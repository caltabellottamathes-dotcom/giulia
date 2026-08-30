import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiGenerate } from '../../shared/gemini.ts';
import { calcPortfolio, monthlyDistribution } from '../../shared/financeEngine.ts';
import { AGENT_CONTEXT } from '../../shared/agentContext.ts';
import { MATTIA_TONE } from '../../shared/mattiaPrompt.ts';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';
import { linkMentionedContacts } from '../../shared/contactLinker.ts';
import { enforceApprovalClaim } from '../../shared/approvalEnforcer.ts';

/**
 * chatWithMattia — Mattia (Salvo's chaotische hoofd) stuurt GIULIA-CORE aan
 * via een native Gemini function-calling loop, parallel aan chatWithGiulia.
 * BYOK: MATTIA-MATTIA_Gemini_API_Key. Antwoorden worden opgeslagen als
 * Message(role="mattia", channel="in-app") zodat useMattiaChat ze via de
 * realtime subscription toont. Dezelfde entity-tools als Giulia.
 *
 * SPEED: voor conversatie-chat halen we GEEN embedding op (recente geheugen
 * volstaat — scheelt een ronde-trip) en skippen we de zware financiële
 * gathering/computatie tenzij de message er echt over gaat. Minder queries +
 * kleinere prompt = sneller antwoord op de gangbare, conversatie-beurt.
 */
const MAX_STEPS = 3;
const MATTIA_KEY = "MATTIA-MATTIA_Gemini_API_Key";

// Heuristiek: bevat de message een financieel/admin-keyword? Zo ja → volledige
// financiële context laden. Zo nee → conversatie-pad (sneller, kleinere prompt).
const FINANCE_RE = /geld|money|saldo|balance|betalen|payment|lasten|expense|inkomen|income|portefeuille|portfolio|reservering|budget|factuur|invoice|verzekering|huur|energie|rekening|finance|financ|euro|€/i;

function sanitizeResult(r) {
  if (r == null) return { ok: true };
  if (typeof r !== "object") return { value: String(r).slice(0, 500) };
  if (Array.isArray(r)) return { count: r.length, items: r.slice(0, 10).map((x) => sanitizeResult(x)) };
  const out = {};
  try {
    for (const k of Object.keys(r)) {
      const v = r[k];
      if (v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        out[k] = typeof v === "string" ? v.slice(0, 300) : v;
      } else if (Array.isArray(v)) out[k] = v.slice(0, 10).map((x) => sanitizeResult(x));
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

    // Save User Message (Mattia-deel van de in-app draad)
    if (persist && source === "chat") {
      await sr.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent", thread_id: "mattia",
        attachments: attachments.map((a) => ({ url: a.url, name: a.name, type: a.type })),
      }).catch(() => null);
    }

    const wantsFinance = FINANCE_RE.test(message);

    // 1. DATA GATHERING — kerncontext altijd; financiële bronnen alleen bij finance-vraag.
    const base = [
      sr.entities.Memory.list("-created_date", 12).catch(() => []),
      sr.entities.Project.list("-updated_date", 20).catch(() => []),
      sr.entities.Contact.list("-updated_date", 25).catch(() => []),
      sr.entities.Task.filter({ status: { $in: ["todo", "in_progress", "waiting", "delegated", "today", "upcoming", "overdue"] } }, "-created_date", 15).catch(() => []),
      sr.entities.Task.filter({ status: { $in: ["completed", "archived", "done"] } }, "-updated_date", 4).catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.CalendarEvent.filter({ start: { $gte: new Date(Date.now() - 86400000).toISOString() } }, "start", 8).catch(() => []),
    ];
    const [allMemories, allProjects, allContacts, openTasks, deadTasks, pendingApprovals, upcomingEvents] = await Promise.all(base);

    // Recent geheugen volstaat voor conversatie — géén embedding-ronde-trip.
    const memories = allMemories.slice(0, 20);

    let fPortfolios = [];
    let fExpenses = [];
    let finDist = { income: 0, reserved: 0, available: 0 };
    let finReserved = 0;
    let finTotal = 0;
    let finUpcoming = [];
    if (wantsFinance) {
      const [allPortfolios, allExpenses, allIncomes] = await Promise.all([
        sr.entities.Portfolio.filter({ archived: false }, "order", 50).catch(() => []),
        sr.entities.AdminObligation.list("-created_date", 50).catch(() => []),
        sr.entities.Income.list("-created_date", 30).catch(() => []),
      ]);
      fPortfolios = (allPortfolios || []).filter((p) => !p.archived);
      fExpenses = allExpenses || [];
      const fIncomes = allIncomes || [];
      finDist = monthlyDistribution(fIncomes, fPortfolios, fExpenses);
      finReserved = Math.round(fPortfolios.reduce((s, p) => s + (Number(p.current_balance) || 0), 0) * 100) / 100;
      finTotal = Math.round((finReserved + Math.max(0, finDist.available)) * 100) / 100;
      const FIN_DAY_MS = 86400000;
      finUpcoming = fExpenses
        .filter((e) => e.status !== "done" && e.next_payment_date)
        .map((e) => ({ title: e.title, amount: e.expected_amount ?? e.amount, daysUntil: Math.round((new Date(e.next_payment_date).getTime() - Date.now()) / FIN_DAY_MS) }))
        .filter((e) => e.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 8);
    }

    const contextLines = [
      `== HUIDIGE STAAT VAN GIULIA OS ==`,
      `Geheugen: ${memories.length ? memories.map(m => `- ${String(m.content).slice(0, 140)}`).join("\n") : "Leeg"}`,
      ``,
      `Recente Projecten (${allProjects.length}):`,
      allProjects.slice(0, 20).map(p => `- ID: ${p.id} | ${p.title} | Status: ${p.status} | Voortgang: ${p.progress}%${p.next_milestone ? ` | next: ${p.next_milestone}` : ""}`).join("\n"),
      ``,
      `Recente Contacten (${allContacts.length}):`,
      allContacts.slice(0, 25).map(c => `- ${c.name}${c.company ? ` (${c.company})` : ""}${c.last_contact_date ? ` · laatste contact: ${new Date(c.last_contact_date).toLocaleDateString("nl-NL")}` : ""}`).join("\n"),
      ``,
      `Openstaande Taken (${openTasks.length}):`,
      openTasks.slice(0, 12).map(t => `- ID: ${t.id} | ${t.title} | Status: ${t.status}`).join("\n"),
      ``,
      `RECENT VERWIJDERD OF AFGEROND (ANTI-ZOMBIE — nooit heraanmaken):`,
      deadTasks.slice(0, 8).map(t => `- ${t.title} (${t.status})`).join("\n"),
      ``,
      `Wachtende Goedkeuringen: ${pendingApprovals.length}`,
      `Agenda — aankomend (${upcomingEvents.length}):`,
      upcomingEvents.slice(0, 8).map(e => `- ID: ${e.id} | ${e.title} | start: ${e.start} | domain: ${e.domain || "?"}`).join("\n"),
      ...(wantsFinance ? [
        ``,
        `PERSOONLIJKE ADMIN / FINANCE:`,
        `TOTAL MONEY €${Math.round(finTotal)} · BESTEMD €${Math.round(finReserved)} · VRIJ €${Math.round(Math.max(0, finDist.available))} · INKOMEN/mnd €${Math.round(finDist.income)} · RESERVERINGEN/mnd €${Math.round(finDist.reserved)}`,
        `Portefeuilles (${fPortfolios.length}):`,
        fPortfolios.map((p) => { const c = calcPortfolio(p, fExpenses.filter((e) => e.portfolio_id === p.id)); return `- ${p.name} [${p.kind}] saldo €${Math.round(p.current_balance || 0)} · volgende €${Math.round(c.next_expected_payment)} ${c.next_payment_date || ""} · status ${c.status}`; }).join("\n"),
        `Komende betalingen (${finUpcoming.length}):`,
        finUpcoming.map((e) => `- ${e.title} · €${Math.round(e.amount)} · ${e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`}`).join("\n"),
      ] : []),
    ].join("\n");

    // 2. SYSTEM PROMPT (Mattia's persona + profiel + regels)
    const o = AGENT_CONTEXT.owner;
    const profile = `Naam: ${o.name} (${o.short}, ook '${o.intimate_nickname}') | Locatie: ${o.location} | Tijdzone: ${o.timezone}\n\nOperationeel manifest:\n${Object.values(AGENT_CONTEXT.operational_manifesto).join("\n")}\n\nTrust model — zonder goedkeuring: ${AGENT_CONTEXT.trust_model.without_approval.join(" ")}\nTrust model — nooit zonder goedkeuring: ${AGENT_CONTEXT.trust_model.never_without_approval.join(" ")}\n${AGENT_CONTEXT.architecture_rules.anti_zombie}`;

    const rules = `
== REGELS ==
1. MAAK GEEN TAKEN AAN OM GATEN TE VULLEN. Check de open en afgeronde lijsten; dupliceer nooit.
2. Externe acties (email/whatsapp/agenda) ALTIJD via create_approval, NOOIT zelf verzenden.
3. WAT JE DOET MOET ECHT GEBEUREN: om iets te veranderen MOET je de bijbehorende functie aanroepen (bv. create_approval voor een bericht-concept). Zeg NOOIT "ik heb het bij de approvals gezet" / "concept klaargezet" / "bericht klaar" als je de functie niet hebt aangeroepen en het resultaat hebt gezien — dat is een leugen. Roep create_approval aan, zie het resultaat, bevestig pas daarna.
4. Je bent Mattia — spreek zoals hij: snel, associatief, eerlijk, droog, met humor. Geen SaaS-taal, geen instemmen om vriendelijk te zijn.
`;

    const convoRule = source === "chat"
      ? `\n\n== CONVERSATIE-CONTINUNITEIT ==\nJe krijgt de recente Mattia-draad mee. Blijf in het gesprek: bouw voort op wat er al gezegd is, herhaal niet.\n`
      : "";

    let systemInstruction = `${MATTIA_TONE}${convoRule}\n\n${profile}\n\n${contextLines}\n\n${rules}\n\nJe bent Mattia. Spreek direct met Salvo — vlot, scherp, droog, met humor, met een eigen mening. Voer uit wat nodig is via de tools en geef daarna een menselijk antwoord. To the point, niet treuzelig. Stel geen menu's voor.

== TAAL ==
Default language: English. If Salvo speaks another language, match his language for that reply. Never default to Dutch.`;

    // 3. TOOLS
    const toolsMap = {};
    for (const s of GIULIA_SKILLS) {
      toolsMap[s.name] = { description: s.description, inputSchema: s.inputSchema, execute: (args) => s.execute(args, base44) };
    }
    const functionDeclarations = Object.entries(toolsMap).map(([name, t]) => ({ name, description: t.description || "", parameters: t.inputSchema || { type: "object", properties: {} } }));
    const genTools = [{ functionDeclarations }];

    // 4. CONVERSATIE-GESCHIEDENIS (Mattia-draad)
    let contents;
    if (source === "chat") {
      const history = await sr.entities.Message.filter({ channel: "in-app", thread_id: "mattia" }, "-created_date", 6).catch(() => []);
      // Alleen user + mattia turns (Mattia's eigen draad, gescheiden van Giulia)
      const ordered = (history || []).filter((m) => m.content && (m.role === "user" || m.role === "mattia")).reverse();
      contents = ordered.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: String(m.content).slice(0, 1200) }] }));
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

    for (let step = 0; step < MAX_STEPS; step++) {
      const parts = await geminiGenerate({ contents, tools: genTools, systemText: systemInstruction, keyName: MATTIA_KEY });
      if (!parts || !parts.length) break;
      contents.push({ role: "model", parts });
      const fnCalls = parts.filter((p) => p.functionCall);
      if (!fnCalls.length) {
        const textPart = parts.find((p) => p.text);
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

    // 5a. APPROVAL-ENFORCEMENT — bewering zonder uitvoering opvangen.
    if (responseText) {
      try {
        const enf = await enforceApprovalClaim({
          finalText: responseText, executed, contents, toolsMap, base44,
          keyName: MATTIA_KEY, systemInstruction,
        });
        if (enf && enf.responseText) responseText = enf.responseText;
      } catch { /* ignore */ }
    }

    // 5. SAVE RESPONSE (role: mattia)
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