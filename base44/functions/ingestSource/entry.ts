import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { loadCandidates } from '../../shared/ingestExec.ts';

/**
 * ingestSource — Universal Information Ingestion pipeline (PROPOSE-ONLY).
 *
 * Reads an IngestionSource, understands the source into a structured set of
 * proposed entities, resolves each against existing OS data, and stores them
 * as `proposed_records` with status `pending_approval`. NOTHING is created or
 * updated here — the user reviews and approves via `approveIngestion`.
 *
 * Aanroep: { source_id }
 */

const UNDERSTANDING_SCHEMA = {
  type: "object",
  properties: {
    overall_subject: { type: "string" },
    purpose: { type: "string" },
    entities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity_class: { type: "string", enum: ["Project", "Task", "Person", "Contact", "Event", "Deadline", "Commitment", "Document", "Knowledge", "Note", "Idea", "Decision", "Memory", "FinancialItem"] },
          title: { type: "string" },
          description: { type: "string" },
          f_name: { type: "string" },
          f_project_name: { type: "string" },
          f_deadline: { type: "string" },
          f_date: { type: "string" },
          f_start: { type: "string" },
          f_end: { type: "string" },
          f_amount: { type: "number" },
          f_currency: { type: "string" },
          f_recurring: { type: "boolean" },
          f_frequency: { type: "string" },
          f_category: { type: "string" },
          f_financial_kind: { type: "string", enum: ["income", "expense"] },
          f_payment_date: { type: "string" },
          f_start_date: { type: "string" },
          f_end_date: { type: "string" },
          f_account_source: { type: "string" },
          f_email: { type: "string" },
          f_phone: { type: "string" },
          f_company: { type: "string" },
          f_role: { type: "string" },
          f_relationship_type: { type: "string" },
          f_priority: { type: "string" },
          f_status: { type: "string" },
          f_location: { type: "string" },
          f_notes: { type: "string" },
          f_content: { type: "string" },
          f_decision: { type: "string" },
          f_url: { type: "string" },
          f_description: { type: "string" },
          explicit: { type: "boolean" },
          confidence: { type: "string", enum: ["certain", "highly_likely", "probable", "uncertain", "unresolved"] },
          reasoning: { type: "string" },
          source_span: { type: "string" },
          inferred_notes: { type: "string" }
        }
      }
    },
    gaps: { type: "array", items: { type: "object", properties: { kind: { type: "string" }, description: { type: "string" }, target_ref: { type: "string" } } } }
  }
};

const RESOLUTION_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "number" },
          decision: { type: "string", enum: ["EXISTING", "NEW", "POSSIBLE_MATCH", "CONFLICT", "UNKNOWN"] },
          existing_id: { type: "string" },
          reason: { type: "string" }
        }
      }
    }
  }
};

const SYSTEM_TEXT =
  "You are GIULIA's ingestion engine. You read a source ONCE and decide what (if anything) in it is real, durable information that belongs in a personal OS.\n\n" +
  "METHOD — follow strictly:\n" +
  "1. CLASSIFY: Decide what kind of source this is (note, offer, report, email, receipt, contract, message, screenshot…). Write overall_subject (≤8 words) and purpose (one sentence: what this is and why it exists).\n" +
  "2. FILTER: Only extract entities that are REAL and MEANINGFUL — a concrete thing the user would actually want stored: a project, a task/commitment with a real action, a person with at least a name, an event/deadline with a date, a financial figure with an amount, a decision, a durable note/knowledge, an idea. Skip passing mentions, greetings, filler and obvious noise. When unsure whether something is meaningful, do not extract it.\n" +
  "3. FIELDS: Fill ONLY fields directly supported by the text. Leave a field empty rather than guessing. Dates → ISO 8601 (YYYY-MM-DD). Money → number + currency. For financial items set f_financial_kind ('income' or 'expense').\n" +
  "4. EXPLICIT vs INFERRED: explicit=true ONLY when the fact is stated verbatim. Anything you derive (a deadline implied by 'next week', a project inferred from context, a guessed role) → explicit=false and explain in inferred_notes.\n" +
  "5. CONFIDENCE — be honest and conservative: certain = stated unambiguously; highly_likely = strongly implied with little doubt; probable = likely but assumes context; uncertain = a reasonable guess; unresolved = cannot determine. When in doubt, drop a level.\n" +
  "6. REASONING: For EVERY entity write one clear sentence in 'reasoning' explaining WHY this is a real OS entity and how you derived it. The human who will approve reads this — make it specific and logical, not generic.\n" +
  "7. GAPS: List things clearly missing to make entities useful (a deadline without a date, a task without an owner, an amount without a currency) under gaps, each with a short description.\n\n" +
  "Return ONLY valid JSON matching the schema. Quality over quantity. Do not invent entities.";

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sourceId = body.source_id;
    if (!sourceId) return Response.json({ error: "source_id required" }, { status: 400 });

    let src = await sr.entities.IngestionSource.get(sourceId).catch(() => null);
    if (!src) return Response.json({ error: "source not found" }, { status: 404 });

    const hist = async (stage, ok = true, note = "") => {
      const next = [...(src.processing_history || []), { stage, at: new Date().toISOString(), ok, note }];
      await sr.entities.IngestionSource.update(sourceId, { status: stage, processing_history: next }).catch(() => null);
      src = { ...src, status: stage, processing_history: next };
    };
    const patchSrc = async (p) => { await sr.entities.IngestionSource.update(sourceId, p).catch(() => null); src = { ...src, ...p }; };

    // ── READING ────────────────────────────────────────────────────────
    let text = "";
    await hist("reading");
    if (src.source_type === "text") {
      text = src.pasted_text || "";
    } else if (src.source_type === "pdf" && src.file_url) {
      const ex = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: src.file_url,
        json_schema: { type: "object", properties: { content: { type: "string" } } }
      }).catch(() => null);
      const out = ex && ex.output;
      text = out ? (out.content || out.text || (typeof out === "string" ? out : JSON.stringify(out))) : "";
    }
    if (text) await patchSrc({ extracted_text: String(text).slice(0, 20000) });

    // ── UNDERSTANDING + EXTRACTING ────────────────────────────────────
    await hist("understanding");
    let understanding = null;
    if (src.source_type === "image" && src.file_url) {
      understanding = await base44.integrations.Core.InvokeLLM({
        prompt: "Analyseer deze afbeelding volledig (OCR + visueel). Extract alle relevante entiteiten, datums, bedragen, relaties en commitments als gestructureerde JSON volgens het schema.\n" + SYSTEM_TEXT,
        file_urls: [src.file_url],
        response_json_schema: UNDERSTANDING_SCHEMA,
        model: "gemini_3_flash"
      }).catch(() => null);
    } else if (text) {
      understanding = await base44.integrations.Core.InvokeLLM({
        prompt: SYSTEM_TEXT + "\n\nBron:\n\"\"\"" + String(text).slice(0, 12000) + "\"\"\"",
        response_json_schema: UNDERSTANDING_SCHEMA
      }).catch(() => null);
    }
    if (!understanding || !Array.isArray(understanding.entities)) {
      throw new Error("understanding failed — no entities extracted");
    }
    await hist("extracting");
    await patchSrc({
      overall_subject: understanding.overall_subject || "",
      purpose: understanding.purpose || "",
      detected_entities: understanding.entities.map((e, i) => ({ index: i, class: e.entity_class, title: e.title, confidence: e.confidence, explicit: e.explicit }))
    });

    // ── MATCHING ──────────────────────────────────────────────────────
    await hist("matching");
    const candidates = await loadCandidates(sr);
    const entities = understanding.entities;
    const resolution = await base44.integrations.Core.InvokeLLM({
      prompt: "You resolve each extracted entity against existing GIULIA OS records. For every index return a decision:\n" +
        "- EXISTING: this is clearly the same record (match on name/alias/email/exact date+title). Prefer this to avoid duplicates.\n" +
        "- POSSIBLE_MATCH: likely the same but not certain.\n" +
        "- CONFLICT: refers to an existing record but the source contradicts its data.\n" +
        "- NEW: no existing record matches.\n" +
        "- UNKNOWN: cannot determine.\n" +
        "Only use EXISTING/POSSIBLE_MATCH/CONFLICT when you are genuinely confident. Set existing_id to the candidate id. Explain in 'reason'.\n\n" + buildResolutionPrompt(entities, candidates),
      response_json_schema: RESOLUTION_SCHEMA
    }).catch(() => null);
    const results = (resolution && resolution.results) || entities.map((_, i) => ({ index: i, decision: "NEW" }));

    // ── PROPOSE (no creation) ─────────────────────────────────────────
    const proposed = entities.map((e, i) => {
      const r = results.find((x) => x.index === i) || { decision: "NEW" };
      const fields = {
        name: e.f_name, project_name: e.f_project_name, deadline: e.f_deadline, date: e.f_date, start: e.f_start, end: e.f_end,
        amount: e.f_amount, currency: e.f_currency, recurring: e.f_recurring, frequency: e.f_frequency, category: e.f_category,
        financial_kind: e.f_financial_kind, payment_date: e.f_payment_date, start_date: e.f_start_date, end_date: e.f_end_date, account_source: e.f_account_source,
        email: e.f_email, phone: e.f_phone, company: e.f_company, role: e.f_role, relationship_type: e.f_relationship_type,
        priority: e.f_priority, status: e.f_status, location: e.f_location, notes: e.f_notes, content: e.f_content, decision: e.f_decision, url: e.f_url, description: e.f_description
      };
      const cleanFields = {};
      for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== null && v !== "") cleanFields[k] = v;
      return {
        index: i,
        entity_class: e.entity_class,
        title: e.title || "",
        description: e.description || "",
        fields: cleanFields,
        confidence: e.confidence || "uncertain",
        explicit: e.explicit === true,
        source_span: e.source_span || "",
        inferred_notes: e.inferred_notes || "",
        reasoning: e.reasoning || "",
        decision: r.decision || "NEW",
        existing_id: r.existing_id || "",
        existing_title: existingTitle(candidates, e.entity_class, r.existing_id),
        reason: r.reason || ""
      };
    });

    const gaps = (understanding.gaps || []).filter((g) => g && g.description);
    const conf = aggregateConfidence(entities);

    await patchSrc({
      status: "pending_approval",
      confidence: conf,
      proposed_records: proposed,
      gaps,
      processing_history: [...(src.processing_history || []), { stage: "pending_approval", at: new Date().toISOString(), ok: true, note: `${proposed.length} proposed · awaiting approval` }]
    });

    return Response.json({ ok: true, source_id: sourceId, proposed: proposed.length, gaps: gaps.length });
  } catch (error) {
    const body = await req.json().catch(() => ({}));
    if (body.source_id) await sr.entities.IngestionSource.update(body.source_id, { status: "failed", error: String(error.message) }).catch(() => null);
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}

// ── helpers ──────────────────────────────────────────────────────────────

function buildResolutionPrompt(entities, c) {
  const ent = entities.map((e, i) => `[${i}] ${e.entity_class} | title="${e.title || ""}" | name=${e.f_name || ""} | project=${e.f_project_name || ""} | deadline=${e.f_deadline || ""} | amount=${e.f_amount || ""} | email=${e.f_email || ""}`).join("\n");
  const cand = (arr, key, cls) => `${cls}: ` + (arr || []).map((x) => `${x.id}::${x[key] || x.title || x.name || ""}`).join(" | ");
  return `Entities to resolve:\n${ent}\n\nExisting candidates:\n${cand(c.projects, "title", "Project")}\n${cand(c.tasks, "title", "Task")}\n${cand(c.contacts, "name", "Contact")}\n${cand(c.events, "title", "Event")}\n${cand(c.documents, "name", "Document")}\n${cand(c.knowledge, "title", "Knowledge")}\n${cand(c.ideas, "title", "Idea")}\n${cand(c.decisions, "title", "Decision")}\n\nReturn a result for every index.`;
}

function existingTitle(candidates, cls, id) {
  if (!id) return "";
  const map = { Project: "projects", Task: "tasks", Person: "contacts", Contact: "contacts", Event: "events", Deadline: "events", Commitment: "events", Document: "documents", Knowledge: "knowledge", Note: "knowledge", Memory: "memory", Idea: "ideas", Decision: "decisions", FinancialItem: "" };
  const arr = candidates[map[cls]] || [];
  const r = arr.find((x) => x.id === id);
  return r ? (r.title || r.name || "") : "";
}

function aggregateConfidence(entities) {
  if (!entities.length) return "unresolved";
  const c = { certain: 5, highly_likely: 4, probable: 3, uncertain: 2, unresolved: 1 };
  const avg = entities.reduce((s, e) => s + (c[e.confidence] || 2), 0) / entities.length;
  if (avg >= 4.5) return "certain";
  if (avg >= 3.5) return "highly_likely";
  if (avg >= 2.5) return "probable";
  if (avg >= 1.5) return "uncertain";
  return "unresolved";
}