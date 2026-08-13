import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, geminiEmbed, cosineSimilarity } from '../../shared/gemini.ts';
import { AGENT_CONTEXT, GIULIA_TONE } from '../../shared/agentContext.ts';
import { GIULIA_SKILLS } from '../../shared/giuliaSkills.ts';

/**
 * GIULIA-CONNECT (chatWithGiulia) - De RAG & Connectie Laag.
 *
 * Dit is het enige intelligentiepunt. Het laadt de gigantische context
 * (actieve projecten, ALLE taken, verwijderde taken, geheugen), bouwt de prompt
 * met Anti-Zombie regels, stuurt het naar GIULIA-GIULIA (Gemini), en stuurt
 * de beslissingen door naar GIULIA-CORE (giuliaLeader) voor blinde executie.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const message = body.message || body.content || "";
    const source = body.source || "chat";
    const persist = body.persist !== false;

    if (!message) return Response.json({ error: "No message provided" }, { status: 400 });

    const sr = base44.asServiceRole;

    // Save User Message
    if (persist && source === "chat") {
      await sr.entities.Message.create({
        role: "user", content: message, channel: "in-app", status: "sent"
      }).catch(() => null);
    }

    // 1. DATA GATHERING (The Anti-Zombie Context)
    const [
      allMemories,
      activeProjects,
      openTasks,
      deadTasks,
      pendingApprovals,
      recentActivity
    ] = await Promise.all([
      sr.entities.Memory.list("-created_date", 150).catch(() => []),
      sr.entities.Project.filter({ status: { $in: ["planning", "in_progress", "waiting"] } }).catch(() => []),
      sr.entities.Task.filter({ status: { $in: ["todo", "in_progress", "waiting", "delegated", "today", "upcoming", "overdue"] } }, "-created_date", 200).catch(() => []),
      sr.entities.Task.filter({ status: { $in: ["completed", "archived", "done"] } }, "-updated_date", 40).catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.Activity.list("-created_date", 10).catch(() => []),
    ]);

    // Semantische geheugen-selectie — vindt ook herinneringen van weken
    // terug als ze inhoudelijk aansluiten bij dit bericht. Valt terug op
    // de recentste 20 als embeddings niet beschikbaar zijn.
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
      `[Je ziet hier een samenvatting, er lopen nu ${openTasks.length} taken. Neem dit serieus, verzin niets nieuws als het niet hoeft.]`,
      openTasks.slice(0, 30).map(t => `- ID: ${t.id} | ${t.title} | Status: ${t.status}`).join("\n"),
      ``,
      `RECENT VERWIJDERD OF AFGEROND (ANTI-ZOMBIE LIJST):`,
      `[LET OP: Deze taken zijn zojuist afgesloten of gearchiveerd. MAAK DEZE NOOIT OPNIEUW AAN!]`,
      deadTasks.map(t => `- ID: ${t.id} | ${t.title} | Status: ${t.status}`).join("\n"),
      ``,
      `Wachtende Goedkeuringen voor externe acties: ${pendingApprovals.length}`,
      `Recente systeem activiteit:`,
      recentActivity.slice(0, 5).map(a => `- ${String(a.description).slice(0, 140)}`).join("\n")
    ].join("\n");

    // 2. THE SYSTEM PROMPT (The Personality & Rules)
    const o = AGENT_CONTEXT.owner;
    const profile = `Naam: ${o.name} (${o.short}, ook '${o.intimate_nickname}') | Locatie: ${o.location} | Tijdzone: ${o.timezone}\n\nOperationeel manifest:\n${Object.values(AGENT_CONTEXT.operational_manifesto).join("\n")}\n\nTrust model — zonder goedkeuring: ${AGENT_CONTEXT.trust_model.without_approval.join(" ")}\nTrust model — nooit zonder goedkeuring: ${AGENT_CONTEXT.trust_model.never_without_approval.join(" ")}\n\n${AGENT_CONTEXT.architecture_rules.roles}\n${AGENT_CONTEXT.architecture_rules.anti_zombie}`;

    const rules = `
== ANTI-ZOMBIE & HYGIËNE REGELS (CRITIEK) ==
1. MAAK GEEN TAKEN AAN OM GATEN TE VULLEN. Je ziet in de context dat er al tientallen of honderden taken open staan.
2. Controleer ALTIJD de 'RECENT VERWIJDERD' lijst in je context. Als Salvo een taak weghaalt (archived/completed), mag je die NOOIT dupliceren of her-aanmaken.
3. Soft Deletes: Als Salvo in de chat zegt "Verwijder taak X", roep je 'update_task' aan en zet je de status op 'archived'. Gebruik geen andere acties.
4. Externe acties (email, whatsapp, kalender toevoegen met gasten) doe je NOOIT rechtstreeks, ALTIJD via 'create_approval'.
5. Je bent de enige intelligentie. Wees proactief in je denkproces, maar conservatief in het aanmaken van database-records.
`;

    // Tool-schema's expliciet meegeven — anders weet Gemini niet welke velden
    // per actie verwacht worden en levert het lege args={} op (silent failure
    // bij executie in GIULIA-CORE, want required velden ontbreken dan).
    const toolDocs = GIULIA_SKILLS.map(
      (s) => `- ${s.name}: ${s.description}\n  args schema: ${JSON.stringify(s.inputSchema)}`
    ).join("\n");
    const toolsBlock = `\n== BESCHIKBARE ACTIES (vul args EXACT volgens dit schema, nooit leeg laten) ==\n${toolDocs}\n`;

    const systemInstruction = `${GIULIA_TONE}\n\n${profile}\n\n${contextLines}\n\n${rules}\n\n${toolsBlock}`;

    // 3. SCHEMA DEFINITION (Execution Payload)
    const executionSchema = {
      type: "object",
      properties: {
        response_text: {
          type: "string",
          description: "Jouw antwoord aan Salvo (alleen in te vullen als source='chat'). Gebruik Markdown links naar IDs als je acties uitvoert, bv. [Taaknaam](/tasks?open=id)."
        },
        actions: {
          type: "array",
          description: "Lijst van acties die GIULIA-CORE blind moet uitvoeren.",
          items: {
            type: "object",
            properties: {
              name: { type: "string", enum: GIULIA_SKILLS.map(s => s.name) },
              args_json: { type: "string", description: "De parameters voor deze tool als JSON-string (bv. '{\"title\":\"Bel Mathes\",\"priority\":\"high\"}'), EXACT volgens het args-schema van die tool in de systeeminstructie. Nooit leeg laten — minstens de required velden." }
            },
            required: ["name", "args_json"]
          }
        },
        memory_updates: {
          type: "array",
          description: "Feiten of voorkeuren die je permanent in je geheugen wilt opslaan.",
          items: {
            type: "object",
            properties: {
              content: { type: "string" },
              category: { type: "string", enum: ["User preferences", "Projects", "People", "Routines", "Conversation-derived"] }
            }
          }
        }
      },
      required: ["actions"]
    };

    // 4. THE AI CALL (GIULIA-GIULIA)
    const keyName = source === "chat" ? "GIULIA_GIULIA_GEMINI_API_KEY" : "BACKDESK_GEMINI_API_KEY";

    const payload = await geminiDecide({
      prompt: `Inkomend signaal (bron: ${source}):\n"""${message.slice(0, 3000)}"""\n\nBedenk wat er moet gebeuren, vul het schema in en voer acties toe aan de array.`,
      schema: executionSchema,
      systemText: systemInstruction,
      temperature: 0.2, // Laag houden voor strakke JSON acties
      keyName
    });

    if (!payload) {
      const fallback = "Giulia is even bezet — Gemini-quota bereikt. Probeer het zo weer.";
      if (persist && source === "chat") {
        await sr.entities.Message.create({ role: "giulia", content: fallback, channel: "in-app", status: "sent", agent_source: "chatWithGiulia" }).catch(() => null);
      }
      return Response.json({ ok: false, error: "Gemini failed to generate payload", response: fallback, degraded: true });
    }

    // 5. DELEGATE TO GIULIA-CORE — args_json (string) → args (object)
    const actionsForCore = (payload.actions || []).map((a) => {
      let args = {};
      try { args = a.args_json ? JSON.parse(a.args_json) : {}; } catch { args = {}; }
      return { name: a.name, args };
    });

    let coreResults = [];
    if (actionsForCore.length > 0) {
      const coreRes = await base44.functions.invoke("giuliaLeader", {
        actions: actionsForCore,
        memory_updates: payload.memory_updates
      }).catch((e) => ({ data: { error: String((e && e.message) || e) } }));
      coreResults = (coreRes && coreRes.data && coreRes.data.results) || [];
    } else if (payload.memory_updates && payload.memory_updates.length > 0) {
      // Geen acties, wel geheugen-opslag — stuur toch door naar CORE.
      const coreRes = await base44.functions.invoke("giuliaLeader", {
        actions: [],
        memory_updates: payload.memory_updates
      }).catch((e) => ({ data: { error: String((e && e.message) || e) } }));
      coreResults = (coreRes && coreRes.data && coreRes.data.results) || [];
    }

    // 6. SAVE RESPONSE
    const responseText = payload.response_text || "";
    if (persist && source === "chat" && responseText) {
      await sr.entities.Message.create({
        role: "giulia", content: responseText, channel: "in-app", status: "sent", agent_source: "chatWithGiulia"
      }).catch(() => null);
    }

    return Response.json({
      ok: true,
      response: responseText,
      actions_executed: actionsForCore,
      core_results: coreResults
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}