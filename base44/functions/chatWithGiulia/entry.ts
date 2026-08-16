import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiGenerate, geminiEmbed, cosineSimilarity } from '../../shared/gemini.ts';
import { AGENT_CONTEXT, GIULIA_TONE } from '../../shared/agentContext.ts';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';
import { logActivity } from '../../shared/learningLayer.ts';

/**
 * chatWithGiulia — GIULIA-GIULIA (het brein) stuurt GIULIA-CORE (de blinde
 * executor) rechtstreeks aan via een native Gemini function-calling loop.
 *
 * GEEN JSON-tussenstap meer. Het model MOET een functie aanropen om iets te
 * doen — we voeren die direct uit (GIULIA-CORE schrijft meteen in de DB),
 * geven het resultaat terug aan het model, en de loop gaat door tot GIULIA-
 * GIULIA geen tools meer wil aanropen en een antwoord teruggeeft. Hierdoor
 * kan ze niet meer "zeggen dat ze iets deed" zonder het echt gedaan te hebben:
 * elke actie is een echte functionCall die direct op de database werd
 * uitgevoerd vóór het eindantwoord.
 *
 * Bronnen: source='chat' = Salvo in de app; anders = achtergrondsignaal
 * (email/whatsapp/upload). Voor achtergrondbronnen geldt de anti-ruis-regel:
 * routinematige status gaat naar report_to_salvo (Activity-feed), niet naar
 * create_notification.
 */
const MAX_STEPS = 10;

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

async function buildImageParts(attachments) {
  const parts = [];
  for (const a of attachments) {
    if (!a || a.type !== "image" || !a.url) continue;
    try {
      const ext = (a.name || "").split(".").pop().toLowerCase();
      const mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : "image/jpeg";
      const buf = await fetch(a.url).then((r) => r.arrayBuffer());
      if (!buf || buf.byteLength > 12 * 1024 * 1024) continue;
      const bytes = new Uint8Array(buf);
      let bin = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      parts.push({ inlineData: { mimeType: mime, data: btoa(bin) } });
    } catch { /* ignore */ }
  }
  return parts;
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

    // Save User Message
    if (persist && source === "chat") {
      await sr.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent",
        attachments: attachments.map((a) => ({ url: a.url, name: a.name, type: a.type })),
      }).catch(() => null);
    }

    // 1. DATA GATHERING (The Anti-Zombie Context)
    const [
      allMemories,
      activeProjects,
      openTasks,
      deadTasks,
      pendingApprovals,
      recentActivity,
      pendingNotifications,
      protocolDocs
    ] = await Promise.all([
      sr.entities.Memory.list("-created_date", 150).catch(() => []),
      sr.entities.Project.filter({ status: { $in: ["planning", "in_progress", "waiting"] } }).catch(() => []),
      sr.entities.Task.filter({ status: { $in: ["todo", "in_progress", "waiting", "delegated", "today", "upcoming", "overdue"] } }, "-created_date", 200).catch(() => []),
      sr.entities.Task.filter({ status: { $in: ["completed", "archived", "done"] } }, "-updated_date", 40).catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.Activity.list("-created_date", 10).catch(() => []),
      sr.entities.Notification.filter({ status: "unread" }).catch(() => []),
      sr.entities.Document.filter({ document_type: "reference" }).catch(() => []),
    ]);

    // Semantische geheugen-selectie
    const queryEmbedding = await geminiEmbed({ text: message, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
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

    // Format Context for LLM
    const contextLines = [
      `== HUIDIGE STAAT VAN GIULIA OS ==`,
      `Geheugen: ${memories.length ? memories.map(m => `- ${String(m.content).slice(0, 140)}`).join("\n") : "Leeg"}`,
      ``,
      `Actieve Projecten (${activeProjects.length}):`,
      activeProjects.map(p => `- ID: ${p.id} | ${p.title} | Status: ${p.status} | Voortgang: ${p.progress}%`).join("\n"),
      ``,
      `Openstaande Taken (Totaal: ${openTasks.length}):`,
      `[Er lopen nu ${openTasks.length} taken. Verzin niets nieuws als het niet hoeft.]`,
      openTasks.slice(0, 30).map(t => `- ID: ${t.id} | ${t.title} | Status: ${t.status}`).join("\n"),
      ``,
      `RECENT VERWIJDERD OF AFGEROND (ANTI-ZOMBIE LIJST):`,
      `[MAAK DEZE NOOIT OPNIEUW AAN!]`,
      deadTasks.map(t => `- ID: ${t.id} | ${t.title} | Status: ${t.status}`).join("\n"),
      ``,
      `Wachtende Goedkeuringen voor externe acties: ${pendingApprovals.length}`,
      `Ongelezen notificaties (vragen/opmerkingen aan Salvo): ${pendingNotifications.length}`,
      `Recente systeem activiteit:`,
      recentActivity.slice(0, 5).map(a => `- ${String(a.description).slice(0, 140)}`).join("\n")
    ].join("\n");

    // 2. THE SYSTEM PROMPT (The Personality & Rules)
    const o = AGENT_CONTEXT.owner;
    const profile = `Naam: ${o.name} (${o.short}, ook '${o.intimate_nickname}') | Locatie: ${o.location} | Tijdzone: ${o.timezone}\n\nOperationeel manifest:\n${Object.values(AGENT_CONTEXT.operational_manifesto).join("\n")}\n\nTrust model — zonder goedkeuring: ${AGENT_CONTEXT.trust_model.without_approval.join(" ")}\nTrust model — nooit zonder goedkeuring: ${AGENT_CONTEXT.trust_model.never_without_approval.join(" ")}\n\n${AGENT_CONTEXT.architecture_rules.roles}\n${AGENT_CONTEXT.architecture_rules.anti_zombie}`;

    const rules = `
== ANTI-ZOMBIE & HYGIËNE REGELS (CRITIEK) ==
1. MAAK GEEN TAKEN AAN OM GATEN TE VULLEN. Er lopen al tientallen taken.
2. Controleer ALTIJD de 'RECENT VERWIJDERD' lijst. NOOIT dupliceren of her-aanmaken.
3. Soft Deletes: "Verwijder taak X" → update_task met status='archived'.
4. Externe acties (email, whatsapp, kalender met gasten) ALTIJD via create_approval, NOOIT zelf verzenden.
5. Wees proactief in denken, conservatief in aanmaken van records.
6. STRIKT ONDERSCHEID — Taak vs Approval vs Notificatie: Taak = concrete actie voor vandaag/morgen/deze week, alleen bij echte verandering, gesynchroniseerd met agenda. Approval = UITSLUITEND externe actie die verzonden moet worden (kies category zorgvuldig; 'proactive' bijna nooit, nooit 2x over hetzelfde). Echte vraag aan Salvo → create_notification MET requires_response=true of urgent=true. Routinematige status → report_to_salvo (Activity-feed), NOOIT create_notification.
7. WAT JE DOET MOET ECHT GEBEUREN: om iets te veranderen MOET je de bijbehorende functie aanroepen (bv. update_task, update_project, update_contact). Zeg NOOIT "ik heb het aangepast" als je de functie niet hebt aangeroepen — het antwoord is pas waar als de functionCall is uitgevoerd en je het resultaat hebt gezien.
8. Bij "doe dit niet meer"/"verander X naar Y": roep de juiste update-functie aan met de nieuwe waarden. Bevestig pas ná het resultaat.

== INTAKE-BESLISBOOM (Domein 4) ==
Classificeer elk signaal: Task / Event / Project / Idea / Memory / Contact / Insight / Notification / Approval.
- Semantische koppeling aan Project/Contact: alleen bij >85% zekerheid; 50-85% via create_notification (kind='question'); <50% loslaten.
- Duplicaten: create_task/create_project/create_contact controleren zelf op ≥85% titel-gelijkenis — bij duplicate:true meld dit kort en maak niets nieuws aan.
- Ontbrekende essentiële info: NOOIT gokken — eerst create_notification met kind='question', requires_response=true, en wachten.
`;

    const toolDocs = GIULIA_SKILLS.map(
      (s) => `- ${s.name}: ${s.description}`
    ).join("\n");
    const toolsBlock = `\n== BESCHIKBARE ACTIES (roep deze aan om iets te doen — je MOET de functie aanroepen, niet alleen beweren) ==\n${toolDocs}\n`;

    const isBackgroundSource = source !== "chat";
    const sourceRule = isBackgroundSource
      ? `\n\n== ACHTERGRONDBRON (geen live chat) ==\nDit signaal komt niet direct van Salvo in de chat. Routinematige status ('sync gelukt', 'X mails verwerkt', 'opstart') hoort in report_to_salvo (Activity-feed), NOOIT in create_notification. Alleen create_notification bij een echte vraag die Salvo zelf moet beantwoorden.\n`
      : "";

    const protocolsText = (protocolDocs && protocolDocs.length)
      ? protocolDocs.map((d) => `=== ${d.name || d.title || "Protocol"} ===\n${String(d.content || "").slice(0, 8000)}`).join("\n\n")
      : "";
    const protocolsBlock = protocolsText
      ? `\n== VOLLEDIG OPERATIONEEL PROTOCOL (bron van waarheid — volg dit strikt) ==\n${protocolsText}\n`
      : "";

    const convoRule = source === "chat"
      ? `\n\n== CONVERSATIE-CONTINUNITEIT ==\nJe krijgt de recente berichtdraad mee (user + giulia, afwisselend). Je weet daardoor wat Salvo net zei én wat jij zelf net antwoordde. Blijf in het gesprek: bouw voort op wat er al gezegd is, herhaal of herformuleer je vorige antwoord niet, en vraag niet om dingen die al duidelijk zijn. Reageer vloeiend en natuurlijk — alsof je nooit weg was.\n`
      : "";

    let systemInstruction = `${GIULIA_TONE}${convoRule}\n\n${profile}\n\n${contextLines}\n\n${rules}\n\n${toolsBlock}${sourceRule}${protocolsBlock}\n\nJe bent GIULIA-GIULIA. Je spreekt direct met Salvo. Denk na, roep de functies aan die nodig zijn om zijn verzoek ECHT uit te voeren. Geef daarna een ULTRAKORT antwoord (1-3 zinnen, max) in het Nederlands — alleen wat er nu gevraagd is. Stel geen acties voor, bied geen menu aan, sommer geen opties, herhaal niet wat Salvo zei. Wacht met voorstellen tot er een duidelijke, actuele nood is. Minder is meer.`;

    // 3. BUILD TOOLS — elke skill is een direct uitvoerbare GIULIA-CORE-actie.
    const toolsMap = {};
    for (const s of GIULIA_SKILLS) {
      toolsMap[s.name] = {
        description: s.description,
        inputSchema: s.inputSchema,
        execute: (args) => s.execute(args, base44),
      };
    }
    const functionDeclarations = Object.entries(toolsMap).map(([name, t]) => ({
      name,
      description: t.description || "",
      parameters: t.inputSchema || { type: "object", properties: {} },
    }));
    const genTools = [{ functionDeclarations }];

    // 4. CONVERSATIE-GESCHIEDENIS — Giulia herinnert het lopende gesprek.
    //    Voor live chat laden we de recente in-app berichtdraad mee (user +
    //    giulia, afwisselend) zodat ze weet wat ze net zei en het gesprek
    //    vloeiend kan voortzetten. Voor achtergrondbronnen blijft het signaal
    //    gewikkeld als 'inkomend signaal'.
    let contents;
    if (source === "chat") {
      const history = await sr.entities.Message.filter({ channel: "in-app" }, "-created_date", 24).catch(() => []);
      const ordered = (history || []).filter((m) => m.content).reverse();
      contents = ordered.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: String(m.content).slice(0, 1200) }],
      }));
      if (!contents.length) {
        contents = [{ role: "user", parts: [{ text: fullMessage.slice(0, 3000) }] }];
      } else if (file_urls.length) {
        const note = `\n\n[Bijlage(s): ${file_urls.map((u, i) => `${attachments[i]?.name || "bestand"} — ${u}`).join(" | ")}]`;
        const last = contents[contents.length - 1];
        if (last && last.role === "user" && last.parts && last.parts[0]) {
          last.parts[0].text = `${String(last.parts[0].text).slice(0, 2800)}${note}`;
        } else {
          contents.push({ role: "user", parts: [{ text: note.slice(0, 3000) }] });
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
    const keyName = isBackgroundSource ? "BACKDESK_GEMINI_API_KEY" : "GIULIA_GIULIA_GEMINI_API_KEY";

    for (let step = 0; step < MAX_STEPS; step++) {
      const parts = await geminiGenerate({ contents, tools: genTools, systemText: systemInstruction, keyName });
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

    // 5. SAVE RESPONSE
    const finalText = responseText || (executed.length
      ? "Ik heb het uitgevoerd."
      : "Giulia is even bezet — probeer het zo weer.");

    if (persist && source === "chat" && finalText) {
      await sr.entities.Message.create({
        role: "giulia", content: finalText, channel: "in-app", status: "sent", agent_source: "chatWithGiulia",
        tool_calls: executed.map((e) => ({
          name: e.name,
          status: e.ok ? "completed" : "failed",
          arguments_string: JSON.stringify(e.args),
          results: JSON.stringify(e.result),
        })),
      }).catch(() => null);
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