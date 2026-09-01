import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiGenerate, geminiEmbed, cosineSimilarity, pickChatModel } from '../../shared/gemini.ts';
import { calcPortfolio, monthlyDistribution } from '../../shared/financeEngine.ts';
import { AGENT_CONTEXT, GIULIA_TONE } from '../../shared/agentContext.ts';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';
import { linkMentionedContacts } from '../../shared/contactLinker.ts';
import { enforceApprovalClaim } from '../../shared/approvalEnforcer.ts';
import { buildImageParts } from '../../shared/imageParts.ts';

/**
 * chatWithGiulia — GIULIA-GIULIA (het brein) stuurt GIULIA-CORE (de blinde
 * executor) rechtstreeks aan via een native Gemini function-calling loop.
 *
 * CONTEXT-GATING (net als Mattia): casual praat krijgt een DUNNE prompt —
 * géén context-dump, géén tool-schema's, één snelle call op gemma. Pas bij
 * operationele berichten (taak/project/agenda/finance/people/…) laden we de
 * volle OS-state + tools en draait een multi-step loop. Dit houdt de
 * token-payload klein en Giulia snel, ook als flash-lite uitgeput is (gemma
 * pakt de bulk; model-fallback in gemini.ts vangt 429's op).
 *
 * Bronnen: source='chat' = Salvo in de app; anders = achtergrondsignaal
 * (email/whatsapp/upload). Voor achtergrondbronnen geldt de anti-ruis-regel:
 * routinematige status gaat naar report_to_salvo (Activity-feed), niet naar
 * create_notification.
 */
const FIN_DAY_MS = 86400000;

const GIULIA_OPERATIONAL_RE = /taak|task|project|agenda|afspraak|meeting|contact|persoon|notitie|note\b|idee|idea|geheugen|memory|herinner|remind|plan|planning|verzet|verplaats|opschuiven|deadline|milestone|beslissing|decision|kennis|knowledge|document|bestand|file|upload|bijlage|attachment|email|whatsapp|mail|verstuur|send|reserveer|reserve|boek|book|rekening|geld|money|saldo|balance|betalen|payment|lasten|expense|inkomen|income|portefeuille|portfolio|reservering|budget|finance|financ|euro|€/i;

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

// buildImageParts — geëxtraheerd naar base44/shared/imageParts.ts
// (gedeeld door chatWithGiulia en chatWithMattia).

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
    const isBackgroundSource = source !== "chat";

    // Save User Message
    if (persist && source === "chat") {
      await sr.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent", thread_id: "giulia",
        attachments: attachments.map((a) => ({ url: a.url, name: a.name, type: a.type })),
      }).catch(() => null);
    }

    // ── CONTEXT-GATING ─────────────────────────────────────────────
    // Casual praat = dunne prompt, géén context-dump, géén tools → 1 snelle
    // gemma-call. Operationeel = pas dan volle OS-state + tools + multi-step.
    const isOperational = isBackgroundSource || GIULIA_OPERATIONAL_RE.test(message);
    const nowStr = new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    const o = AGENT_CONTEXT.owner;

    let contextLines = "";
    let profile = "";
    let genTools = [];
    let maxSteps = 1;

    // toolsMap altijd bouwen (goedkoop; pas tokens kosten als genTools
    // wordt meegestuurd). Voor casual blijft genTools = [].
    const toolsMap = {};
    for (const s of GIULIA_SKILLS) {
      toolsMap[s.name] = {
        description: s.description,
        inputSchema: s.inputSchema,
        execute: (args) => s.execute(args, base44),
      };
    }

    if (isOperational) {
      // 1. DATA GATHERING (alleen bij operationele berichten / achtergrondbron)
      const [
        allMemories,
        allProjects,
        allContacts,
        openTasks,
        deadTasks,
        pendingApprovals,
        recentActivity,
        pendingNotifications,
        upcomingEvents,
        activeTherapy,
        allPortfolios,
        allExpenses,
        allIncomes
      ] = await Promise.all([
        sr.entities.Memory.list("-created_date", 10).catch(() => []),
        sr.entities.Project.list("-updated_date", 20).catch(() => []),
        sr.entities.Contact.list("-updated_date", 25).catch(() => []),
        sr.entities.Task.filter({ status: { $in: ["todo", "in_progress", "waiting", "delegated", "today", "upcoming", "overdue"] } }, "-created_date", 15).catch(() => []),
        sr.entities.Task.filter({ status: { $in: ["completed", "archived", "done"] } }, "-updated_date", 4).catch(() => []),
        sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
        sr.entities.Activity.list("-created_date", 3).catch(() => []),
        sr.entities.Notification.filter({ status: "unread" }).catch(() => []),
        sr.entities.CalendarEvent.filter({ start: { $gte: new Date(Date.now() - FIN_DAY_MS).toISOString() } }, "start", 8).catch(() => []),
        sr.entities.TherapyTrajectory.filter({ status: "active" }).catch(() => []),
        sr.entities.Portfolio.filter({ archived: false }, "order", 50).catch(() => []),
        sr.entities.AdminObligation.list("-created_date", 50).catch(() => []),
        sr.entities.Income.list("-created_date", 30).catch(() => []),
      ]);

      // Semantische geheugen-selectie — alleen bij complexere vragen.
      const isSimple = message.length < 140;
      const queryEmbedding = isSimple ? null : await geminiEmbed({ text: message, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
      let memories = allMemories.slice(0, 20);
      if (queryEmbedding) {
        const withEmb = allMemories.filter((m) => Array.isArray(m.embedding) && m.embedding.length);
        if (withEmb.length) {
          const scored = withEmb
            .map((m) => ({ m, score: cosineSimilarity(queryEmbedding, m.embedding) }))
            .sort((a, b) => b.score - a.score);
          const relevant = scored.filter((s) => s.score > 0.55).slice(0, 12).map((s) => s.m);
          if (relevant.length) {
            const merged = [...relevant];
            for (const r of allMemories.slice(0, 5)) {
              if (!merged.find((x) => x.id === r.id)) merged.push(r);
            }
            memories = merged;
          }
        }
      }

      // FINANCE — Personal Admin snapshot
      const fPortfolios = (allPortfolios || []).filter((p) => !p.archived);
      const fExpenses = allExpenses || [];
      const fIncomes = allIncomes || [];
      const finDist = monthlyDistribution(fIncomes, fPortfolios, fExpenses);
      const finReserved = Math.round(fPortfolios.reduce((s, p) => s + (Number(p.current_balance) || 0), 0) * 100) / 100;
      const finTotal = Math.round((finReserved + Math.max(0, finDist.available)) * 100) / 100;
      const finUpcoming = fExpenses
        .filter((e) => e.status !== "done" && e.next_payment_date)
        .map((e) => ({ title: e.title, amount: e.expected_amount ?? e.amount, daysUntil: Math.round((new Date(e.next_payment_date).getTime() - Date.now()) / FIN_DAY_MS) }))
        .filter((e) => e.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 8);

      // Compacte samenvatting — details zijn LAZY via query_*-tools.
      contextLines = [
        `== HUIDIGE STAAT (samenvatting — details via query-tools) ==`,
        `Geheugen (top ${memories.length}): ${memories.length ? memories.map(m => `${String(m.content).slice(0, 90)}`).join("  |  ") : "leeg"}`,
        `Projecten (${allProjects.length}): ${allProjects.slice(0, 10).map(p => `${p.title}(${p.status},${p.progress}%)`).join(" · ")}`,
        `Open taken (${openTasks.length}): ${openTasks.slice(0, 8).map(t => `${t.title}[${t.status}]`).join(" · ")}`,
        `Recent afgerond/verwijderd (NIET heraanmaken): ${deadTasks.slice(0, 5).map(t => t.title).join(" · ") || "geen"}`,
        `Agenda (${upcomingEvents.length}): ${upcomingEvents.slice(0, 6).map(e => `${e.title}@${String(e.start).slice(0, 16)}`).join(" · ")}`,
        `Therapie (${activeTherapy.length}): ${activeTherapy.map(t => `${t.title}[${t.type}]`).join(" · ") || "geen"}`,
        `Goedkeuringen: ${pendingApprovals.length} wachtend · Notificaties: ${pendingNotifications.length} ongelezen`,
        `Recente activiteit: ${recentActivity.slice(0, 2).map(a => String(a.description).slice(0, 80)).join(" · ") || "niets"}`,
        `Contacten: ${allContacts.length} recent (details via query_people)`,
        `FINANCE: TOTAL €${Math.round(finTotal)} · BESTEMD €${Math.round(finReserved)} · VRIJ €${Math.round(Math.max(0, finDist.available))} · INKOMEN/mnd €${Math.round(finDist.income)} · RESERV/mnd €${Math.round(finDist.reserved)}`,
        `Portefeuilles: ${fPortfolios.slice(0, 8).map(p => `${p.name} €${Math.round(p.current_balance || 0)}[${p.status}]`).join(" · ")}`,
        `Komende betalingen (30d): ${finUpcoming.slice(0, 5).map(e => `${e.title}€${Math.round(e.amount)}${e.daysUntil < 0 ? "!" : `${e.daysUntil}d`}`).join(" · ") || "geen"}`,
        `Inkomsten: ${fIncomes.slice(0, 5).map(i => `${i.description || i.category}€${i.amount}[${i.status}]`).join(" · ") || "geen"}`,
      ].join("\n");

      profile = `Naam: ${o.name} (${o.short}, ook '${o.intimate_nickname}') | Locatie: ${o.location} | Tijdzone: ${o.timezone} | Nu: ${nowStr}\n\nOperationeel manifest:\n${Object.values(AGENT_CONTEXT.operational_manifesto).join("\n")}\n\nTrust model — zonder goedkeuring: ${AGENT_CONTEXT.trust_model.without_approval.join(" ")}\nTrust model — nooit zonder goedkeuring: ${AGENT_CONTEXT.trust_model.never_without_approval.join(" ")}\n\n${AGENT_CONTEXT.architecture_rules.roles}\n${AGENT_CONTEXT.architecture_rules.anti_zombie}`;

      const functionDeclarations = Object.entries(toolsMap).map(([name, t]) => ({
        name,
        description: t.description || "",
        parameters: t.inputSchema || { type: "object", properties: {} },
      }));
      genTools = [{ functionDeclarations }];
      maxSteps = 3;
    } else {
      // Casual: compacte persona + actuele tijd. Geen context, geen tools.
      profile = `Naam: ${o.name} (${o.short}) | Locatie: ${o.location} | Nu: ${nowStr}`;
    }

    // 2. REGELS + TOOLS-BLOCK (alleen zinvol bij operationeel)
    const rules = isOperational
      ? `
== REGELS (kern) ==
1. ANTI-ZOMBIE: maak geen taken/projecten aan om gaten te vullen; check open + recent-afgeronde lijsten (zie samenvatting). Duplicaten worden door create_*-tools zelf gedetecteerd.
2. WAT JE DOET MOET ECHT GEBEUREN: roep de functie aan en bevestig pas ná het resultaat. Zeg NOOIT "ik heb het aangepast/klaargezet/verzonden" als je de functie niet aanriep. Geldt ook voor create_approval.
3. EXTERNE ACTIES (email/whatsapp/agenda met gasten) ALTIJD via create_approval, NOOIT zelf verzenden. Category zorgvuldig kiezen; 'proactive' bijna nooit.
4. ONDERSCHEID: Taak=concrete actie vandaag/deze week. Approval=externe verzending. Echte vraag aan Salvo → create_notification (requires_response/urgent). Routinematige status → report_to_salvo, NIET create_notification.
5. LAZY DATA: je hebt een compacte samenvatting. Voor details roep je query_tools aan (query_tasks/query_agenda/query_finance/query_people/query_memory/get_protocol) — alleen als je het echt nodig hebt, niet standaard.
6. PERSOON↔PROJECT/BIJLAGE→PROJECT: koppel via link_objects; sla een bestand voor een project op via create_document (url+project_id).
7. Ontbrekende info → NOOIT gokken: create_notification (kind=question, requires_response) en wachten.
8. DELEGEER ZWAAR WERK: voor bulk-bewerkingen (sync, planning, analyse, proactivity, finance-herberekening) roep je delegate_to aan met de juiste backend-functie (manageTasks, dailyPlanning, weeklyPlanning, runProactivity, recalcWallets, …) in plaats van het zelf stap-voor-stap in de chat te doen. Je eigen redenering blijft compact; data blijft in de backend.
`
      : "";

    const toolDocs = GIULIA_SKILLS.map((s) => `- ${s.name}: ${s.description}`).join("\n");
    const toolsBlock = isOperational
      ? `\n== BESCHIKBARE ACTIES (roep deze aan om iets te doen — je MOET de functie aanroepen, niet alleen beweren) ==\n${toolDocs}\n`
      : "";

    const sourceRule = isBackgroundSource
      ? `\n\n== ACHTERGRONDBRON (geen live chat) ==\nDit signaal komt niet direct van Salvo in de chat (bron: ${source}). Verwerk het autonoom: neem cross-domain acties en koppel herkende objecten aan elkaar (link_objects, bv. taak→project, event→therapie-traject via link_event_to_therapy), plan en leg follow-ups vast. Routinematige status ('sync gelukt', 'X mails verwerkt', 'opstart') hoort in report_to_salvo (Activity-feed), NOOIT in create_notification. Alleen create_notification bij een echte vraag die Salvo zelf moet beantwoorden.\n`
      : "";

    const convoRule = source === "chat"
      ? `\n\n== CONVERSATIE-CONTINUNITEIT ==\nJe krijgt de recente berichtdraad mee (user + giulia, afwisselend). Je weet daardoor wat Salvo net zei én wat jij zelf net antwoordde. Blijf in het gesprek: bouw voort op wat er al gezegd is, herhaal of herformuleer je vorige antwoord niet, en vraag niet om dingen die al duidelijk zijn. Reageer vloeiend en natuurlijk — alsof je nooit weg was.\n`
      : "";

    const operationalClosing = isOperational
      ? "GIULIA-CORE (de executor) werkt STIL: zij voert je opdrachten uit en rapporteert NIET terug wat ze gedaan heeft — jij stuurt haar aan en zij doet het gewoon. Denk na, roep de functies aan die nodig zijn om zijn verzoek ECHT uit te voeren. Voor details die niet in je samenvatting staan, roep je een query-tool aan."
      : "Geen tools nodig — dit is gewoon praten. Antwoord direct, menselijk, zonder acties uit te voeren.";

    const systemInstruction = `${GIULIA_TONE}${convoRule}\n\n${profile}\n\n${contextLines ? contextLines + "\n\n" : ""}${rules}${toolsBlock}${sourceRule}\n\nJe bent GIULIA-GIULIA. Je spreekt direct met Salvo, als zijn beste vriendin — vlot, warm, droog-sarcastisch, uitdagend, stout. ${operationalClosing} Geef daarna een vlot, menselijk antwoord in het Nederlands — to the point, niet treuzelig, met humor, en daag hem uit waar nodig. Stel geen acties voor, bied geen menu aan, sommer geen opties, herhaal niet wat Salvo zei. Wacht met voorstellen tot er een duidelijke, actuele nood is.

== TAAL ==
Default language: English. If Salvo speaks another language, match his language for that reply. Never default to Dutch.`;

    // 4. CONVERSATIE-GESCHIEDENIS — Giulia herinnert het lopende gesprek.
    let contents;
    if (source === "chat") {
      // FILTER/VERKORT: alleen de laatste 2 beurten (4 berichten) voor
      // operationeel, 1 beurt (2 berichten) voor casual praat. Elk bericht
      // tot 600 tekens — tokenverspilling minimaliseren. Giulia delegeert
      // zware data-opvraging aan backend-functies (query-tools / delegate_to)
      // in plaats van alles via de geschiedenis mee te sturen.
      const histLimit = isOperational ? 4 : 2;
      const history = await sr.entities.Message.filter({ channel: "in-app", thread_id: "giulia" }, "-created_date", histLimit).catch(() => []);
      const ordered = (history || []).filter((m) => m.content && String(m.content).trim()).reverse();
      contents = ordered.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: String(m.content).slice(0, 600) }],
      }));
      const lastTurn = contents[contents.length - 1];
      const alreadyLast = lastTurn && lastTurn.role === "user"
        && String(lastTurn.parts?.[0]?.text || "").includes(message.slice(0, 30));
      if (!alreadyLast) {
        while (contents.length && contents[contents.length - 1].role === "model") {
          contents.pop();
        }
        contents.push({ role: "user", parts: [{ text: fullMessage.slice(0, 3000) }] });
      }
      if (file_urls.length) {
        const note = `\n\n[Bijlage(s): ${file_urls.map((u, i) => `${attachments[i]?.name || "bestand"} — ${u}`).join(" | ")}]`;
        const last = contents[contents.length - 1];
        if (last && last.role === "user" && last.parts && last.parts[0]) {
          last.parts[0].text = `${String(last.parts[0].text).slice(0, 2800)}${note}`;
        }
      }
    } else {
      contents = [{ role: "user", parts: [{ text: `Inkomend signaal (bron: ${source}):\n"""${message.slice(0, 3000)}"""` }] }];
    }
    // Beeldbijlagen → inline aan de laatste user-beurt (Gemini vision, BYOK)
    const imgParts = await buildImageParts(attachments);
    if (imgParts.length) {
      const last = contents[contents.length - 1];
      if (last && last.role === "user") last.parts = [...last.parts, ...imgParts];
      else contents.push({ role: "user", parts: imgParts });
    }

    const executed = [];
    let responseText = null;
    const keyName = isBackgroundSource ? "BACKDESK_GEMINI_API_KEY" : "GIGI_Gemini_API_Key";
    // Model-router: casual → gemma (snel, ruime TPM), operationeel → flash-lite
    // (tool-redenering). Model-fallback in gemini.ts vangt 429's op (→ gemma).
    const chosenModel = pickChatModel({
      message,
      hasTools: isOperational,
      hasAttachments: attachments.length > 0,
      isOperational,
    });

    for (let step = 0; step < maxSteps; step++) {
      const parts = await geminiGenerate({ contents, tools: genTools, systemText: systemInstruction, model: chosenModel, keyName });
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
        try {
          result = t ? await t.execute(args) : { error: "unknown tool" };
        } catch (e) {
          result = { error: String((e && e.message) || e) };
        }
        executed.push({ name, args, ok: !(result && result.error), result: sanitizeResult(result) });
        respParts.push({ functionResponse: { name, response: sanitizeResult(result) } });
      }
      contents.push({ role: "user", parts: respParts });
    }

    // 5a. APPROVAL-ENFORCEMENT — alleen bij operationeel + uitgevoerde acties.
    if (isOperational && executed.length && responseText) {
      try {
        const enf = await enforceApprovalClaim({
          finalText: responseText, executed, contents, toolsMap, base44,
          keyName, systemInstruction,
        });
        if (enf && enf.responseText) responseText = enf.responseText;
      } catch { /* ignore */ }
    }

    // 5. SAVE RESPONSE
    const finalText = responseText || (executed.length ? "Ik heb het uitgevoerd." : "Giulia is even bezet — probeer het zo weer.");

    if (persist && source === "chat" && finalText) {
      await sr.entities.Message.create({
        role: "giulia", content: finalText, channel: "in-app", status: "sent", thread_id: "giulia", agent_source: "chatWithGiulia",
        tool_calls: executed.map((e) => ({
          name: e.name,
          status: e.ok ? "completed" : "failed",
          arguments_string: JSON.stringify(e.args),
          results: JSON.stringify(e.result),
        })),
      }).catch(() => null);
    }

    // 6. DETERMINISTIC CONTACT LINKING — koppel genoemde bestaande contacten.
    if (source === "chat") {
      try { await linkMentionedContacts(sr, message); } catch { /* ignore */ }
    }

    return Response.json({
      ok: true,
      response: finalText,
      actions_executed: executed,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}