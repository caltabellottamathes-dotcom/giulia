import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiGenerate } from '../../shared/gemini.ts';
import { calcPortfolio, monthlyDistribution } from '../../shared/financeEngine.ts';
import { MATTIA_INSTRUCTIONS, MATTIA_OS_RULES } from '../../shared/mattiaInstructions.ts';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';
import { linkMentionedContacts } from '../../shared/contactLinker.ts';

/**
 * chatWithMattia — Mattia chat, BYOK (MATTIA-MATTIA_Gemini_API_Key), géén
 * integration-credits. Persona/instructies komen uit mattia.jsonc via
 * mattiaInstructions.ts (Naughty/Playtime + Playtime-context als uitvoerbare
 * instructie) — NIET uit mattiaPrompt.ts. Antwoorden opgeslagen als
 * Message(role="mattia", channel="in-app", thread_id="mattia") zodat
 * useMattiaChat ze via realtime subscription toont.
 *
 * SPEED: géén approval-enforcer (die deed er elke beurt een extra LLM-ronde
 * doorheen — de echte reden dat Mattia traag was), MAX_STEPS=2, lichtere
 * context-gathering (geen embedding-ronde, alleen finance bij finance-vraag).
 */
const MAX_STEPS = 2;
const MATTIA_KEY = "MATTIA-MATTIA_Gemini_API_Key";

const FINANCE_RE = /geld|money|saldo|balance|betalen|payment|lasten|expense|inkomen|income|portefeuille|portfolio|reservering|budget|factuur|invoice|verzekering|huur|energie|rekening|finance|financ|euro|€/i;

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

    // Save User Message (Mattia-draad)
    if (persist && source === "chat") {
      await sr.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent", thread_id: "mattia",
        attachments: attachments.map((a) => ({ url: a.url, name: a.name, type: a.type })),
      }).catch(() => null);
    }

    const wantsFinance = FINANCE_RE.test(message);

    // 1. DATA GATHERING — lichter: alleen kerncontext, finance alleen bij finance-vraag.
    const [memories, allProjects, allContacts, openTasks, pendingApprovals, upcomingEvents] = await Promise.all([
      sr.entities.Memory.list("-created_date", 8).catch(() => []),
      sr.entities.Project.list("-updated_date", 10).catch(() => []),
      sr.entities.Contact.list("-updated_date", 12).catch(() => []),
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
        ``,
        `PERSOONLIJKE ADMIN / FINANCE:`,
        `TOTAL €${Math.round(finTotal)} · BESTEMD €${Math.round(finReserved)} · VRIJ €${Math.round(Math.max(0, finDist.available))} · INKOMEN/mnd €${Math.round(finDist.income)} · RESERVERINGEN/mnd €${Math.round(finDist.reserved)}`,
        `Portefeuilles: ${fPortfolios.map((p) => `${p.name} [${p.kind}] €${Math.round(p.current_balance || 0)}`).join(" · ")}`,
        `Komende betalingen: ${finUpcoming.map((e) => `${e.title} €${Math.round(e.amount)} (${e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`})`).join(" · ") || "geen"}`,
      ].join("\n");
    }

    const contextLines = [
      `== HUIDIGE STAAT (kort) ==`,
      `Geheugen: ${memories.length ? memories.map(m => `- ${String(m.content).slice(0, 100)}`).join("\n") : "leeg"}`,
      `Projecten: ${allProjects.slice(0, 8).map(p => `${p.title} (${p.status}, ${p.progress}%)`).join(" · ") || "geen"}`,
      `Open taken: ${openTasks.map(t => `${t.title} [${t.status}]`).join(" · ") || "geen"}`,
      `Agenda: ${upcomingEvents.map(e => `${e.title} @ ${e.start}`).join(" · ") || "niets"}`,
      `Wachtende goedkeuringen: ${pendingApprovals.length}`,
      financeBlock,
    ].filter(Boolean).join("\n");

    // 2. SYSTEM PROMPT — persona + Playtime (uitvoerbaar) + OS-regels + context.
    const convoRule = source === "chat"
      ? `\n== CONVERSATIE-CONTINUNITEIT ==\nJe krijgt de recente Mattia-draad mee. Blijf in het gesprek; herhaal niet.\n`
      : "";

    const systemInstruction = `${MATTIA_INSTRUCTIONS}${convoRule}\n${MATTIA_OS_RULES}\n\n${contextLines}\n\nJe bent Mattia. Spreek direct met Salvo — vlot, scherp, droog, met humor, met een eigen mening. Voer uit wat nodig is via de tools en geef daarna een menselijk antwoord. To the point, niet treuzelig.`;

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

    // 5. SAVE RESPONSE (role: mattia) — géén extra approval-enforcer-ronde (speed).
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