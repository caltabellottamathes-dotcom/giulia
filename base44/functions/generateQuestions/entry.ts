import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiGenerate, GIULIA_PERSONA } from '../../shared/gemini.ts';

/**
 * generateQuestions — GIULIA WANTS TO KNOW.
 * Giulia's nieuwsgierigheidslaag. Analyseert de huidige kenniskaart
 * (projecten, taken, contacten, agenda, geheugen, hobby's, huishouden,
 * admin, activiteit), vindt gaten / conflicten / verouderde info, en
 * formuleert daar 3-7 slimme vragen om — één per gat, geselecteerd op
 * informatiewaarde. Loopt volledig op eigen BYOK Gemini (geen credits).
 */
const KINDS = ["quick_drop", "fill_the_gap", "connect_the_dots", "memory_check", "life_check", "self_discovery"];
const DOMAINS = ["life", "self", "projects", "time", "admin", "people", "communication"];
const PRIORITIES = ["now", "soon", "useful", "curious"];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [projects, tasks, contacts, events, memories, hobbies, household, admin, activities] = await Promise.all([
      sr.entities.Project.filter({ status: { $in: ["planning", "in_progress", "waiting", "review", "afwerking"] } }).catch(() => []),
      sr.entities.Task.filter({ status: { $in: ["todo", "in_progress", "waiting", "today", "upcoming", "overdue", "delegated"] } }, "-created_date", 80).catch(() => []),
      sr.entities.Contact.list("-created_date", 60).catch(() => []),
      sr.entities.Event.list("-created_date", 40).catch(() => []),
      sr.entities.Memory.list("-created_date", 80).catch(() => []),
      sr.entities.Hobby.list("-last_activity_date", 30).catch(() => []),
      sr.entities.HouseholdItem.list("-updated_date", 40).catch(() => []),
      sr.entities.AdminObligation.filter({ status: "open" }).catch(() => []),
      sr.entities.Activity.list("-created_date", 12).catch(() => []),
    ]);

    const map = [
      `== KENNISKAART ==`,
      `PROJECTEN (${projects.length}):`,
      projects.slice(0, 20).map(p => `- ${p.title} | status=${p.status} | health=${p.health || "?"} | progress=${p.progress || 0}% | next=${p.next_milestone || "?"} | deadline=${p.deadline || "?"} | category=${p.category || "?"}`).join("\n"),
      `TAKEN (open, ${tasks.length}):`,
      tasks.slice(0, 30).map(t => `- ${t.title} | status=${t.status} | prio=${t.priority || "?"} | deadline=${t.deadline || "?"} | domain=${t.domain || "?"}`).join("\n"),
      `CONTACTEN (${contacts.length}):`,
      contacts.slice(0, 20).map(c => `- ${c.name} | relatie=${c.relationship_type || "?"} | freq=${c.desired_frequency_days || "?"}d | last=${(c.last_contact_date || "").slice(0, 10) || "?"}`).join("\n"),
      `AGENDA komend:`,
      events.slice(0, 15).map(e => `- ${(e.start || "").slice(0, 16)} ${e.title} | ${e.location || "?"}`).join("\n"),
      `GEHEUGEN (${memories.length}):`,
      memories.slice(0, 20).map(m => `- [${m.category}] ${String(m.content).slice(0, 120)}`).join("\n"),
      `HOBBY'S (${hobbies.length}):`,
      hobbies.slice(0, 15).map(h => `- ${h.title} | level=${h.activity_level} | last=${(h.last_activity_date || "").slice(0, 10) || "?"}`).join("\n"),
      `HUISHOUDEN (${household.length}):`,
      household.slice(0, 15).map(h => `- ${h.title} | kind=${h.kind} | status=${h.status} | next=${h.next_due || "?"}`).join("\n"),
      `ADMIN (${admin.length}):`,
      admin.slice(0, 12).map(a => `- ${a.title} | type=${a.type} | due=${a.due_date || "?"} | bedrag=${a.amount || "?"}`).join("\n"),
      `RECENTE ACTIVITEIT:`,
      activities.slice(0, 8).map(a => `- ${String(a.description).slice(0, 120)}`).join("\n"),
    ].join("\n");

    const existing = await sr.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 50).catch(() => []);
    const existingTitles = existing.map(q => String(q.title || "").toLowerCase());

    const prompt = `Je bent GIULIA. Dit is je "WANTS TO KNOW"-laag: je zoekt ontbrekende, tegenstrijdige of verouderde informatie in het leven van Salvo en vormt daar één slimme vraag per gat — geen formulier.

KENNISKAART:
${map}

AL OPENSTAANDE VRAGEN (niet dupliceren, niet herhalen):
${existingTitles.length ? existingTitles.map(t => "- " + t).join("\n") : "(geen)"}

Produceer 5-8 vragen. Elke vraag:
- title: kort, prikkelend, in het Nederlands, max 90 tekens.
- body: 1-3 zinnen — wat Giulia al weet + wat ontbreekt, in Giulia's stem (scherp, nieuwsgierig, soms speels).
- kind: één van ${KINDS.join(", ")}.
- domain: één van ${DOMAINS.join(", ")}.
- priority: now (nodig om iets correct uit te voeren) | soon (verbetert planning) | useful (verdiept begrip) | curious (gewoon interessant).
- options: 2-4 korte antwoordknopjes (lege array als het vrije tekst vereist).
- target_type: project|task|contact|event|hobby|household|admin|self|life|general.
- target_ref: id indien van toepassing, anders leeg.
- confidence: 0-1 hoe zeker je bent dat dit gat echt bestaat.

Mix de vragen: maximaal de helft mag operationeel (taken/projecten/agenda/admin). Minstens 2-3 vragen zijn PERSOONLIJK — om Salvo écht te leren kennen (voorkeuren, gewoontes, waarden, energie, dromen, relaties, wat hem bezighoudt buiten werk). Stel ook KENNISVRAGEN over inhoudelijke onderwerpen die je nog niet weet maar die je begrip vergroten (context bij projecten, achtergrond bij contacten, het doel achter doelen). Gebruik self_discovery en life_check ruim. Wees proactief: zoek info die ontbreekt om projecten, agenda, contacten en andere functies up-te-daten naar de laatste stand — vraag om verouderde of incomplete data te bevestigen of aan te vullen.

Selecteer op INFORMATIEWAARDE: één antwoord dat meerdere onderdelen verbetert is beter. Durf verbanden te leggen (connect_the_dots) en conflicten te vinden (agenda vs deadlines, tegenstrijdige herinneringen). Variëer de kinds. Max 1 curious.`;

    const tools = [{
      functionDeclarations: [{
        name: "submit_questions",
        description: "Dien de WANTS TO KNOW-vragen in die je hebt geformuleerd.",
        parameters: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  body: { type: "string" },
                  kind: { type: "string" },
                  domain: { type: "string" },
                  priority: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  target_type: { type: "string" },
                  target_ref: { type: "string" },
                  confidence: { type: "number" },
                },
                required: ["title", "body", "kind", "domain", "priority"],
              },
            },
          },
          required: ["questions"],
        },
      }],
    }];

    const parts = await geminiGenerate({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools,
      systemText: `${GIULIA_PERSONA}\n\nJe bent Giulia's nieuwsgierigheidslaag — actief, warm en behoorlijk nieuwsgierig. Je wilt Salvo écht leren kennen, niet alleen zijn taken beheren. Je zoekt actief naar kennis die je nog mist: persoonlijke voorkeuren, achtergrond bij projecten en contacten, verouderde info die bijgewerkt moet worden, en inhoudelijke context die je begrip vergroot. Stel daarom ook persoonlijke en inhoudelijke vragen — niet alleen operationele. Roep submit_questions aan met je vragen.`,
      keyName: "GIULIA_GIULIA_GEMINI_API_KEY",
    });

    let out = null;
    if (parts && parts.length) {
      const fc = parts.find((p) => p.functionCall && p.functionCall.name === "submit_questions");
      if (fc) out = fc.functionCall.args || null;
      if (!out) {
        const tp = parts.find((p) => p.text);
        if (tp && tp.text) {
          try { const m = tp.text.match(/\{[\s\S]*\}/); if (m) out = JSON.parse(m[0]); } catch { /* ignore */ }
        }
      }
    }

    let created = 0;
    let skipped = 0;
    if (out && Array.isArray(out.questions)) {
      for (const q of out.questions) {
        if (!q || !q.title) continue;
        const t = String(q.title).toLowerCase();
        if (existingTitles.some(e => e && (e === t || e.includes(t) || t.includes(e)))) { skipped++; continue; }
        if (!KINDS.includes(q.kind)) q.kind = "fill_the_gap";
        if (!DOMAINS.includes(q.domain)) q.domain = "projects";
        if (!PRIORITIES.includes(q.priority)) q.priority = "useful";
        await sr.entities.GiuliaQuestion.create({
          title: String(q.title).slice(0, 140),
          body: String(q.body || "").slice(0, 800),
          kind: q.kind,
          domain: q.domain,
          priority: q.priority,
          options: Array.isArray(q.options) ? q.options.slice(0, 4).map(o => String(o).slice(0, 40)) : [],
          target_type: q.target_type || "general",
          target_ref: q.target_ref || "",
          context: "",
          status: "open",
          confidence: typeof q.confidence === "number" ? q.confidence : 0.5,
          agent_source: "generateQuestions",
        }).catch(() => null);
        existingTitles.push(t);
        created++;
      }
    }

    const openCount = (await sr.entities.GiuliaQuestion.filter({ status: "open" }).catch(() => [])).length;
    return Response.json({ ok: true, created, skipped, open: openCount });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}