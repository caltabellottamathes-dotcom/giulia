import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiGenerate, pickChatModel } from '../../shared/gemini.ts';
import { calcPortfolio, monthlyDistribution } from '../../shared/financeEngine.ts';
import { MATTIA_BUDDY, MATTIA_NAUGHTY, MATTIA_PLAYTIME, MATTIA_OS_RULES } from '../../shared/mattiaInstructions.ts';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';
import { linkMentionedContacts } from '../../shared/contactLinker.ts';

/**
 * chatWithMattia — Mattia chat, BYOK (MATTIA-MATTIA_Gemini_API_Key), géén
 * integration-credits. Persona/instructies uit mattia.jsonc via
 * mattiaInstructions.ts (Naughty/Playtime + Playtime-context als uitvoerbare
 * instructie). Antwoorden opgeslagen als Message(role="mattia",
 * channel="in-app", thread_id="mattia") voor useMattiaChat.
 *
 * SPEED: slimme context-gating. Pure conversatie / Naughty-praat krijgt
 * GEEN OS-context (geen 6 entity-queries, geen context-blok) → alleen
 * persona + geschiedenis → 1 snelle Gemini-call. Alleen als het bericht
 * operationeel is (taken/projecten/agenda/finance/people/documenten) laden
 * we de relevante context. Géén approval-enforcer-ronde. MAX_STEPS=2.
 */
const MAX_STEPS = 2;
const MATTIA_KEY = "MattiaTime_Gemini_API_Key";

const FINANCE_RE = /geld|money|saldo|balance|betalen|payment|lasten|expense|inkomen|income|portefeuille|portfolio|reservering|budget|factuur|invoice|verzekering|huur|energie|rekening|finance|financ|euro|€/i;
const OPERATIONAL_RE = /taak|task|project|agenda|afspraak|meeting|contact|persoon|notitie|note\b|idee|idea|geheugen|memory|herinner|remind|plan|planning|verzet|verplaats|opschuiven|deadline|milestone|beslissing|decision|kennis|knowledge|document|bestand|file|upload|bijlage|attachment|email|whatsapp|mail|verstuur|send|reserveer|reserve|boek|book|rekening/i;

// ── PERSONA-CODEWORD-GATING ──────────────────────────────────────
// "playtime" = codewoord voor de volledige Playtime-extensie.
// Lichte seksuele kanteling (zonder codewoord) opent de Naughty-laag.
const PLAYTIME_RE = /\bplaytime\b/i;
const NAUGHTY_RE = /\b(horny|hard|cock|dick|cunt|kut|neuken|zuigen|suck|fuck|wank|stroking|touching|naakt|naked|komen|come|klaar|cum|rimmen|ass|kont|hole|aroused|turned on|opgewonden|zelden)\b/i;

function sanitizeResult(r) {
  if (r == null) return { ok: true };
  if (typeof r !== "object") return { value: String(r).slice(0, 500) };
  if (Array.isArray(r)) return { count: r.length, items: r.slice(0, 8).map((x) => sanitizeResult(x)) };
  const out = {};
  try {
    for (const k of Object.keys(r)) {
      const v = r[k];
      if (v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        out[k] = typeof v === "string" ? v.slice(0, 300) : v;
      } else if (Array.isArray(v)) out[k] = v.slice(0, 8).map((x) => sanitizeResult(x));
      else if (typeof v === "object") out[k] = "[object]";
      if (Object.keys(out).length >= 12) break;
    }
  } catch { /* ignore */ }
  return out;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const message = body.message || body.content || "";
    const source = body.source || "chat";
    const persist = body.persist !== false;
    const file_urls = Array.isArray(body.file_urls) ? body.file_urls : [];
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    const fullMessage = file_urls.length
      ? `${message}\n\n[Bijlage(s): ${file_urls.map((u, i) => `${attachments[i]?.name || "bestand"} — ${u}`).join(" | ")}]`
      : message;

    if (!message && !file_urls.length) return Response.json({ error: "No message provided" }, { status: 400 });

    const sr = base44.asServiceRole;

    if (persist && source === "chat") {
      await sr.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent", thread_id: "mattia",
        attachments: attachments.map((a) => ({ url: a.url, name: a.name, type: a.type })),
      }).catch(() => null);
    }

    // ── CONTEXT-GATING ──────────────────────────────────────────────
    // Pure conversatie / Naughty-praat: GEEN OS-context (snel). Operationeel:
    // laad relevante context. Finance: extra finance-blok.
    const wantsFinance = FINANCE_RE.test(message);
    const isOperational = wantsFinance || OPERATIONAL_RE.test(message);

    let contextBlock = "";
    if (isOperational) {
      const [memories, allProjects, allContacts, openTasks, pendingApprovals, upcomingEvents] = await Promise.all([
        sr.entities.Memory.list("-created_date", 6).catch(() => []),
        sr.entities.Project.list("-updated_date", 8).catch(() => []),
        sr.entities.Contact.list("-updated_date", 10).catch(() => []),
        sr.entities.Task.filter({ status: { $in: ["todo", "in_progress", "waiting", "delegated", "today", "upcoming", "overdue"] } }, "-created_date", 6).catch(() => []),
        sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
        sr.entities.CalendarEvent.filter({ start: { $gte: new Date(Date.now() - 86400000).toISOString() } }, "start", 4).catch(() => []),
      ]);

      let financeBlock = "";
      if (wantsFinance) {
        const [allPortfolios, allExpenses, allIncomes] = await Promise.all([
          sr.entities.Portfolio.filter({ archived: false }, "order", 50).catch(() => []),
          sr.entities.AdminObligation.list("-created_date", 50).catch(() => []),
          sr.entities.Income.list("-created_date", 30).catch(() => []),
        ]);
        const fPortfolios = (allPortfolios || []).filter((p) => !p.archived);
        const fExpenses = allExpenses || [];
        const fIncomes = allIncomes || [];
        const finDist = monthlyDistribution(fIncomes, fPortfolios, fExpenses);
        const finReserved = Math.round(fPortfolios.reduce((s, p) => s + (Number(p.current_balance) || 0), 0) * 100) / 100;
        const finTotal = Math.round((finReserved + Math.max(0, finDist.available)) * 100) / 100;
        const finUpcoming = fExpenses
          .filter((e) => e.status !== "done" && e.next_payment_date)
          .map((e) => ({ title: e.title, amount: e.expected_amount ?? e.amount, daysUntil: Math.round((new Date(e.next_payment_date).getTime() - Date.now()) / 86400000) }))
          .filter((e) => e.daysUntil <= 30)
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 6);
        financeBlock = [
          `\nPERSOONLIJKE ADMIN / FINANCE:`,
          `TOTAL €${Math.round(finTotal)} · BESTEMD €${Math.round(finReserved)} · VRIJ €${Math.round(Math.max(0, finDist.available))} · INKOMEN/mnd €${Math.round(finDist.income)} · RESERVERINGEN/mnd €${Math.round(finDist.reserved)}`,
          `Portefeuilles: ${fPortfolios.map((p) => `${p.name} [${p.kind}] €${Math.round(p.current_balance || 0)}`).join(" · ")}`,
          `Komende betalingen: ${finUpcoming.map((e) => `${e.title} €${Math.round(e.amount)} (${e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`})`).join(" · ") || "geen"}`,
        ].join("\n");
      }

      contextBlock = [
        `\n== HUIDIGE STAAT (kort) ==`,
        `Geheugen: ${memories.length ? memories.map(m => `- ${String(m.content).slice(0, 100)}`).join("\n") : "leeg"}`,
        `Projecten: ${allProjects.slice(0, 8).map(p => `${p.title} (${p.status}, ${p.progress}%)`).join(" · ") || "geen"}`,
        `Open taken: ${openTasks.map(t => `${t.title} [${t.status}]`).join(" · ") || "geen"}`,
        `Agenda: ${upcomingEvents.map(e => `${e.title} @ ${e.start}`).join(" · ") || "niets"}`,
        `Wachtende goedkeuringen: ${pendingApprovals.length}`,
        financeBlock,
      ].filter(Boolean).join("\n");
    }

    // ── SYSTEM PROMPT (persona-codeword-gating) ─────────────────────
    // Buddy-kern altijd. Naughty-laag bij seksuele kanteling of codewoord.
    // Playtime-extensie alleen na codewoord "playtime".
    const wantsPlaytime = PLAYTIME_RE.test(message);
    const wantsNaughty = wantsPlaytime || NAUGHTY_RE.test(message);

    const convoRule = source === "chat"
      ? `\n== CONVERSATIE-CONTINUNITEIT ==\nJe krijgt de recente Mattia-draad mee. Blijf in het gesprek; herhaal niet.\n`
      : "";
    const operationalPart = isOperational
      ? `\n${MATTIA_OS_RULES}\n${contextBlock}\n`
      : `\n== ACTIES ==\nJe kan via tools interne acties doen (taken/notities/agenda/geheugen) als Salvo dat vraagt; externe verzending altijd via create_approval. Vraag geen toestemming voor interne acties. Voer alleen uit als er een duidelijke actie is.\n`;

    const personaLayers = [MATTIA_BUDDY, convoRule, operationalPart];
    if (wantsNaughty) personaLayers.push(MATTIA_NAUGHTY);
    if (wantsPlaytime) personaLayers.push(MATTIA_PLAYTIME);
    const closing = `\n\nJe bent Mattia. Spreek direct met Salvo — vlot, scherp, droog, met humor, met een eigen mening. Voer uit wat nodig is via de tools en geef daarna een menselijk antwoord. ANTWOORDEN KORT EN PUNCHY: een paar zinnen, geen muur van tekst, tenzij de sfeer duidelijk om meer detail vraagt. To the point, niet treuzelig.`;
    const systemInstruction = personaLayers.join("\n") + closing;

    // ── TOOLS ───────────────────────────────────────────────────────
    // Tools alleen meesturen bij operationele berichten — anders moet het model
    // 40+ functies evalueren voor een simpele casual/naughty reply (traag).
    const toolsMap = {};
    for (const s of GIULIA_SKILLS) {
      toolsMap[s.name] = { description: s.description, inputSchema: s.inputSchema, execute: (args) => s.execute(args, base44) };
    }
    const functionDeclarations = Object.entries(toolsMap).map(([name, t]) => ({ name, description: t.description || "", parameters: t.inputSchema || { type: "object", properties: {} } }));
    const genTools = isOperational ? [{ functionDeclarations }] : [];

    // ── CONVERSATIE-GESCHIEDENIS (Mattia-draad) ──────────────────────
    let contents;
    if (source === "chat") {
      const history = await sr.entities.Message.filter({ channel: "in-app", thread_id: "mattia" }, "-created_date", 6).catch(() => []);
      const ordered = (history || []).filter((m) => m.content && (m.role === "user" || m.role === "mattia")).reverse();
      contents = ordered.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: String(m.content).slice(0, 1000) }] }));
      const lastTurn = contents[contents.length - 1];
      const alreadyLast = lastTurn && lastTurn.role === "user" && String(lastTurn.parts?.[0]?.text || "").includes(message.slice(0, 30));
      if (!alreadyLast) {
        while (contents.length && contents[contents.length - 1].role === "model") contents.pop();
        contents.push({ role: "user", parts: [{ text: fullMessage.slice(0, 3000) }] });
      }
    } else {
      contents = [{ role: "user", parts: [{ text: `Inkomend signaal (bron: ${source}):\n"""${message.slice(0, 3000)}"""` }] }];
    }

    const executed = [];
    let responseText = null;
    // Model-router: kiest automatisch het optimale model per bericht.
    const chosenModel = pickChatModel({
      message, hasTools: genTools.length > 0,
      hasAttachments: attachments.length > 0, isOperational,
    });

    for (let step = 0; step < MAX_STEPS; step++) {
      const parts = await geminiGenerate({ contents, tools: genTools, systemText: systemInstruction, model: chosenModel, keyName: MATTIA_KEY });
      if (!parts || !parts.length) break;
      contents.push({ role: "model", parts });
      const fnCalls = parts.filter((p) => p.functionCall);
      if (!fnCalls.length) {
        // Gemma zet soms een "denk"-tekst vóór het echte antwoord; pak de
        // laatste tekst-part (het daadwerkelijke antwoord), niet de eerste.
        const textPart = [...parts].reverse().find((p) => p.text);
        responseText = textPart?.text || null;
        break;
      }
      const respParts = [];
      for (const p of fnCalls) {
        const name = p.functionCall.name;
        const args = p.functionCall.args || {};
        const t = toolsMap[name];
        let result;
        try { result = t ? await t.execute(args) : { error: "unknown tool" }; }
        catch (e) { result = { error: String((e && e.message) || e) }; }
        executed.push({ name, args, ok: !(result && result.error), result: sanitizeResult(result) });
        respParts.push({ functionResponse: { name, response: sanitizeResult(result) } });
      }
      contents.push({ role: "user", parts: respParts });
    }

    // ── SAVE RESPONSE (role: mattia) — géén approval-enforcer-ronde ──
    const finalText = responseText || (executed.length ? "Geregeld." : "Mattia is even stil — probeer het zo weer.");

    if (persist && source === "chat" && finalText) {
      await sr.entities.Message.create({
        role: "mattia", content: finalText, channel: "in-app", status: "sent", thread_id: "mattia", agent_source: "chatWithMattia",
        tool_calls: executed.map((e) => ({ name: e.name, status: e.ok ? "completed" : "failed", arguments_string: JSON.stringify(e.args), results: JSON.stringify(e.result) })),
      }).catch(() => null);
    }

    if (source === "chat") {
      try { await linkMentionedContacts(sr, message); } catch { /* ignore */ }
    }

    return Response.json({ ok: true, response: finalText, actions_executed: executed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}