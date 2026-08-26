import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { loadCandidates, dateOnly } from '../../shared/ingestExec.ts';

/**
 * ingestSource — Universal Project Intelligence & Ingestion pipeline (PROPOSE-ONLY).
 *
 * Pipeline: reading → understanding → structuring → matching → reconciling →
 *           planning → validating → pending_approval.
 *
 * Builds a Project Understanding Model (themes + classified items), resolves each
 * item against existing OS data, composes a validated Change Plan, and stores
 * everything as proposed_records awaiting human approval. NOTHING is created here.
 *
 * Aanroep: { source_id }
 */

const ENTITY_CLASSES = ["Project", "ProjectTheme", "Task", "Milestone", "Decision", "Person", "Contact", "Event", "Deadline", "Commitment", "Document", "Knowledge", "Note", "Memory", "Idea", "Insight", "AdminObligation"];
const CLASSIFICATIONS = ["project_info", "theme_info", "requirement", "objective", "task", "milestone", "decision", "deadline", "person", "document", "knowledge", "note", "insight", "open_question", "dependency", "admin_obligation"];

const UNDERSTANDING_SCHEMA = {
  type: "object",
  properties: {
    overall_subject: { type: "string" },
    purpose: { type: "string" },
    context_domain: { type: "string", enum: ["focus", "life", "knowledge", "memory", "global"] },
    detected_project: {
      type: "object",
      properties: { title: { type: "string" }, reason: { type: "string" }, confidence: { type: "string", enum: ["certain", "highly_likely", "probable", "uncertain", "unresolved"] } }
    },
    themes: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, description: { type: "string" }, purpose: { type: "string" }, parent_title: { type: "string" }, order: { type: "number" } }
      }
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity_class: { type: "string", enum: ENTITY_CLASSES },
          classification: { type: "string", enum: CLASSIFICATIONS },
          theme_title: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          f_name: { type: "string" },
          f_project_name: { type: "string" },
          f_theme_title: { type: "string" },
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
          f_purpose: { type: "string" },
          f_context: { type: "string" },
          f_parent_title: { type: "string" },
          f_order: { type: "number" },
          f_beneficiary: { type: "string" },
          f_account_number: { type: "string" },
          f_reference: { type: "string" },
          f_recurrence: { type: "string", enum: ["none", "monthly", "quarterly", "annual"] },
          f_obligation_type: { type: "string", enum: ["payment", "insurance", "contract", "renewal", "subscription"] },
          explicit: { type: "boolean" },
          confidence: { type: "string", enum: ["certain", "highly_likely", "probable", "uncertain", "unresolved"] },
          reasoning: { type: "string" },
          source_span: { type: "string" }
        }
      }
    },
    gaps: { type: "array", items: { type: "object", properties: { kind: { type: "string" }, description: { type: "string" }, target_ref: { type: "string" } } } }
  }
};

const MATCHING_SCHEMA = {
  type: "object",
  properties: {
    detected_project_id: { type: "string" },
    detected_project_reason: { type: "string" },
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
  "You are GIULIA's Project Intelligence & Ingestion engine. You read a source ONCE and build a complete Project Understanding Model — not a flat list.\n\n" +
  "METHOD — follow strictly:\n" +
  "1. CLASSIFY THE SOURCE: overall_subject (≤8 words), purpose (one sentence), context_domain (focus=work project, life=personal, knowledge=durable reference, memory=long-term context, global=none of these).\n" +
  "2. DETECT PROJECT: If this clearly belongs to an existing project, name it in detected_project.title (the exact project name as you know it) + reason. Leave empty if it's global/LIFE/knowledge.\n" +
  "3. BUILD THEMES (hierarchical): A Theme is a coherent subject/component/workstream of the project — NOT a task, NOT a hardcoded category. Derive themes from the source's actual structure (headings, repeated subjects, workstreams). Use parent_title to nest subthemes under a theme. Only create themes that are genuinely self-contained project components. A simple source may have 0-1 themes.\n" +
  "4. EXTRACT & SYNTHESIZE ITEMS — make the project page come alive:\n" +
  "   - EXPLICIT items: extract what is concretely stated ('Maak X', 'Stuur Y', a named milestone, a decided choice, a deadline). Set explicit=true.\n" +
  "   - DERIVED items (SYNTHESIS): for strategic/plan sources that contain vision, goals, tiers, positioning or workstreams but few literal tasks, INFER the concrete actionable tasks, milestones and decisions that follow from the strategy. Aim for enough derived tasks that the project page reads as a real, executable plan — at least one concrete build/launch task per distinct component, tier or workstream the source describes. Example: a tier 'Tier 1 — Marketing + Self-Reflection €129' implies tasks like 'Build Tier 1 self-reflection questionnaire', 'Write Tier 1 marketing copy', 'Set up Base44 marketplace listing for Tier 1'. A 'Licensing' section implies decisions like 'One practice, one deployment, one license' and tasks like 'Define licensing infrastructure'. Set explicit=false and write a one-sentence reasoning explaining the derivation.\n" +
  "   - Keep derived items genuinely actionable and specific — not filler. When a derivation is a stretch, skip it. Quality over quantity still applies; do not explode into trivial micro-tasks.\n" +
  "   - Milestone = a meaningful project phase/achieved point (not just a deadline). Decision = a conscious choice made (e.g. a licensing rule, a positioning choice). Deadline = a time-bound obligation (→ Event). Person = someone with at least a name. Document = source/supporting material. Knowledge = durable reference info. Note = contextual info. Insight = an interpretation/pattern. open_question → put in gaps instead.\n" +
  "   - Skip greetings, filler, passing mentions. When unsure if something is meaningful, DO NOT extract it.\n" +
  "5. THEME LINKAGE: set theme_title on each item when it belongs to a theme you defined. Leave empty for global/project-level items.\n" +
  "6. FIELDS: Fill ONLY fields directly supported by the text. Leave empty rather than guessing. Dates → ISO 8601 (YYYY-MM-DD). Money → number + currency. For financial items set f_financial_kind.\n" +
  "7. EXPLICIT vs INFERRED: explicit=true ONLY when stated verbatim. Derived → explicit=false.\n" +
  "8. CONFIDENCE — conservative: certain=unambiguous; highly_likely=strongly implied; probable=likely w/ context; uncertain=reasonable guess; unresolved=cannot determine. When in doubt, drop a level.\n" +
  "9. REASONING: For EVERY item write one clear sentence explaining WHY it's a real OS entity and how derived. The approver reads this.\n" +
  "10. GAPS: Only MEANINGFUL missing info (a deadline without a date that matters, an amount without currency, an ownerless critical task) — not every tiny gap.\n\n" +
  "PERSONAL-ADMIN / FINANCIAL SOURCES — bank statements, budget plans, expense overviews, recurring payment tables:\n" +
  "When the source is a personal financial/administrative overview (table of beneficiaries, payment dates, amounts, categories like huur/premie/abonnement/reservering), set context_domain=\"life\" and do NOT detect or force a project (leave detected_project empty). For EACH row, extract an item with entity_class=\"AdminObligation\", classification=\"admin_obligation\", title=Categorie, and fields:\n" +
  "  f_obligation_type: map from category — premie/verzekering→\"insurance\", abonnement/lidmaatschap/contributie→\"subscription\", huur/kostgeld→\"payment\", sparen/reservering→\"contract\", default \"payment\".\n" +
  "  f_amount: the Bedrag (number), f_currency: \"EUR\".\n" +
  "  f_payment_date: the Betaaldatum (ISO). f_recurrence: \"monthly\" when Periode indicates a monthly recurrence (e.g. \"maand (dag 8)\"), else \"none\".\n" +
  "  f_beneficiary: Begunstigde, f_account_number: Rekeningnummer, f_reference: Referentie.\n" +
  "  notes/description: Referentie text. Do NOT create themes for these sources. explicit=true for each row (they are literal).\n\n" +
  "Return ONLY valid JSON. Do not invent entities. Do not explode tasks. Derive structure from the source, never impose a hardcoded theme list.";

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
    if (text) await patchSrc({ extracted_text: String(text).slice(0, 30000) });

    // ── UNDERSTANDING ─────────────────────────────────────────────────
    await hist("understanding");
    let understanding = null;
    if (src.source_type === "image" && src.file_url) {
      understanding = await base44.integrations.Core.InvokeLLM({
        prompt: "Analyseer deze afbeelding volledig (OCR + visueel). Bouw een Project Understanding Model volgens het schema.\n" + SYSTEM_TEXT,
        file_urls: [src.file_url],
        response_json_schema: UNDERSTANDING_SCHEMA,
        model: "gemini_3_flash"
      }).catch(() => null);
    } else if (text) {
      understanding = await base44.integrations.Core.InvokeLLM({
        prompt: SYSTEM_TEXT + "\n\nBron:\n\"\"\"" + String(text).slice(0, 14000) + "\"\"\"",
        response_json_schema: UNDERSTANDING_SCHEMA,
        model: "gemini_3_flash"
      }).catch(() => null);
    }
    if (!understanding || !Array.isArray(understanding.items)) {
      throw new Error("understanding failed — no items extracted");
    }

    // ── STRUCTURING ──────────────────────────────────────────────────
    await hist("structuring");
    const themes = (understanding.themes || []).filter((t) => t && t.title);
    await patchSrc({
      overall_subject: understanding.overall_subject || "",
      purpose: understanding.purpose || "",
      project_understanding: {
        context_domain: understanding.context_domain || "global",
        themes,
        items: (understanding.items || []).map((e, i) => ({
          index: i,
          classification: e.classification || "",
          theme_title: e.theme_title || "",
          title: e.title || "",
          description: e.description || "",
          fields: stripUndefinedFields(e),
          confidence: e.confidence || "uncertain",
          explicit: e.explicit === true,
          source_span: e.source_span || "",
          reasoning: e.reasoning || ""
        }))
      }
    });

    // ── MATCHING ──────────────────────────────────────────────────────
    await hist("matching");
    const candidates = await loadCandidates(sr);
    const items = understanding.items;
    const matching = await base44.integrations.Core.InvokeLLM({
      prompt: "You resolve the Project Understanding against existing GIULIA OS records. First, decide detected_project_id: match understanding.detected_project.title against existing projects (exact/alias/fuzzy/semantic). Prefer enriching an existing project over creating a new one. If no match, leave empty.\n\n" +
        "Then for EACH item return a decision:\n" +
        "- EXISTING: clearly the same record (name/alias/email/exact date+title). Set existing_id.\n" +
        "- POSSIBLE_MATCH: likely same, not certain.\n" +
        "- CONFLICT: refers to an existing record BUT the source contradicts its data (different deadline/status/price/decision). Set existing_id + explain.\n" +
        "- NEW: no existing record matches.\n" +
        "- UNKNOWN: cannot determine.\n" +
        "Only use EXISTING/POSSIBLE_MATCH/CONFLICT when genuinely confident.\n\n" + buildMatchingPrompt(understanding, items, candidates),
      response_json_schema: MATCHING_SCHEMA
    }).catch(() => null);
    const detectedProjectId = (matching && matching.detected_project_id) || "";
    const detectedProjectReason = (matching && matching.detected_project_reason) || (understanding.detected_project && understanding.detected_project.reason) || "";
    const results = (matching && matching.results) || items.map((_, i) => ({ index: i, decision: "NEW" }));

    // ── RECONCILING ───────────────────────────────────────────────────
    await hist("reconciling");
    const themeTitles = new Set(themes.map((t) => t.title.toLowerCase()));
    // Inject themes as proposed ProjectTheme records (so they flow through
    // approval + execution — themes must exist before items can link to them).
    const themeProposed = themes.map((t, ti) => ({
      index: 9000 + ti,
      entity_class: "ProjectTheme",
      classification: "theme_info",
      title: t.title,
      description: t.description || "",
      fields: { name: t.title, description: t.description || "", purpose: t.purpose || "", parent_title: t.parent_title || "", order: t.order || ti, project_name: (understanding.detected_project && understanding.detected_project.title) || "" },
      confidence: "highly_likely",
      explicit: false,
      source_span: "",
      reasoning: t.purpose ? `Theme afgeleid uit de bronstructuur: ${t.purpose}` : "Theme afgeleid uit de bronstructuur.",
      theme_title: "",
      decision: "NEW",
      existing_id: "",
      existing_title: "",
      reason: "new theme from source structure",
      plan_action: "CREATE",
      validation: { ok: true, errors: [] }
    }));
    const itemProposed = items.map((e, i) => {
      const r = results.find((x) => x.index === i) || { decision: "NEW" };
      const fields = stripUndefinedFields(e);
      const cls = normalizeClass(e.entity_class, e.classification);
      return {
        index: i,
        entity_class: cls,
        classification: e.classification || "",
        title: e.title || (cls === "Milestone" ? e.f_name : "") || "",
        description: e.description || "",
        fields,
        confidence: e.confidence || "uncertain",
        explicit: e.explicit === true,
        source_span: e.source_span || "",
        reasoning: e.reasoning || "",
        theme_title: e.theme_title || e.f_theme_title || "",
        decision: r.decision || "NEW",
        existing_id: r.existing_id || "",
        existing_title: existingTitle(candidates, cls, r.existing_id),
        reason: r.reason || "",
        plan_action: planAction(r.decision),
        validation: { ok: true, errors: [] }
      };
    });
    const proposed = [...themeProposed, ...itemProposed];

    // ── PLANNING (Change Plan) ────────────────────────────────────────
    await hist("validating");
    const changePlan = proposed.map((p) => {
      const fieldChanges = [];
      if ((p.plan_action === "UPDATE" || p.plan_action === "LINK" || p.plan_action === "MERGE") && p.existing_id) {
        const ex = findExisting(candidates, p.entity_class, p.existing_id);
        if (ex) for (const [k, v] of Object.entries(p.fields)) {
          const oldV = ex[k];
          if (oldV !== v && v) fieldChanges.push({ field: k, old_value: String(oldV ?? ""), new_value: String(v), reason: `source provides new value for ${k}` });
        }
      }
      const validation = validateItem(p, candidates, themeTitles, detectedProjectId);
      return {
        index: p.index,
        entity_class: p.entity_class,
        action: p.plan_action,
        title: p.title,
        existing_id: p.existing_id,
        fields: p.fields,
        field_changes: fieldChanges,
        reason: p.reason || p.reasoning || "",
        confidence: p.confidence,
        source_span: p.source_span,
        validation_ok: validation.ok,
        validation_errors: validation.errors
      };
    });
    // reflect validation back into proposed records
    proposed.forEach((p) => {
      const cp = changePlan.find((c) => c.index === p.index);
      if (cp) p.validation = { ok: cp.validation_ok, errors: cp.validation_errors };
    });

    const gaps = (understanding.gaps || []).filter((g) => g && g.description);
    const conf = aggregateConfidence(items);
    const conflicts = proposed.filter((p) => p.decision === "CONFLICT").map((p) => ({ entity: p.entity_class, id: p.existing_id, title: p.existing_title || p.title, reason: p.reason }));

    await patchSrc({
      detected_project_id: detectedProjectId,
      detected_project_match_reason: detectedProjectReason,
      confidence: conf,
      proposed_records: proposed,
      change_plan: changePlan,
      conflicts,
      gaps,
      status: "pending_approval",
      processing_history: [...(src.processing_history || []), { stage: "pending_approval", at: new Date().toISOString(), ok: true, note: `${proposed.length} proposed · ${changePlan.filter((c) => c.validation_ok).length} valid · awaiting approval` }]
    });

    return Response.json({ ok: true, source_id: sourceId, proposed: proposed.length, themes: themes.length, conflicts: conflicts.length, gaps: gaps.length });
  } catch (error) {
    const body = await req.json().catch(() => ({}));
    if (body.source_id) await sr.entities.IngestionSource.update(body.source_id, { status: "failed", error: String(error.message) }).catch(() => null);
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}

// ── helpers ──────────────────────────────────────────────────────────────

function stripUndefinedFields(e) {
  const raw = {
    name: e.f_name, project_name: e.f_project_name, theme_title: e.f_theme_title, deadline: e.f_deadline, date: e.f_date, start: e.f_start, end: e.f_end,
    amount: e.f_amount, currency: e.f_currency, recurring: e.f_recurring, frequency: e.f_frequency, category: e.f_category,
    financial_kind: e.f_financial_kind, payment_date: e.f_payment_date, start_date: e.f_start_date, end_date: e.f_end_date, account_source: e.f_account_source,
    email: e.f_email, phone: e.f_phone, company: e.f_company, role: e.f_role, relationship_type: e.f_relationship_type,
    priority: e.f_priority, status: e.f_status, location: e.f_location, notes: e.f_notes, content: e.f_content, decision: e.f_decision, url: e.f_url, description: e.f_description,
    purpose: e.f_purpose, context: e.f_context, parent_title: e.f_parent_title, order: e.f_order,
    beneficiary: e.f_beneficiary, account_number: e.f_account_number, reference: e.f_reference,
    recurrence: e.f_recurrence, obligation_type: e.f_obligation_type
  };
  const clean = {};
  for (const [k, v] of Object.entries(raw)) if (v !== undefined && v !== null && v !== "") clean[k] = v;
  return clean;
}

function normalizeClass(cls, classification) {
  if (cls && cls !== "Insight") return cls;
  if (classification === "milestone") return "Milestone";
  if (classification === "decision") return "Decision";
  if (classification === "deadline") return "Event";
  if (classification === "person") return "Contact";
  if (classification === "document") return "Document";
  if (classification === "knowledge" || classification === "insight") return "Knowledge";
  if (classification === "note" || classification === "requirement" || classification === "objective" || classification === "dependency") return "Note";
  if (classification === "task") return "Task";
  if (classification === "theme_info") return "ProjectTheme";
  if (classification === "admin_obligation") return "AdminObligation";
  return cls || "Note";
}

function planAction(decision) {
  switch (decision) {
    case "EXISTING": return "LINK";
    case "POSSIBLE_MATCH": return "LINK";
    case "CONFLICT": return "UPDATE";
    case "NEW": return "CREATE";
    default: return "ASK";
  }
}

function buildMatchingPrompt(understanding, items, c) {
  const dp = understanding.detected_project ? `detected_project: title="${understanding.detected_project.title}" reason="${understanding.detected_project.reason}"` : "detected_project: (none)";
  const themesStr = (understanding.themes || []).map((t) => `theme: ${t.title}${t.parent_title ? ` (subtheme of ${t.parent_title})` : ""}`).join("\n");
  const it = items.map((e, i) => `[${i}] ${e.entity_class} | cls=${e.classification || ""} | theme=${e.theme_title || ""} | title="${e.title || ""}" | name=${e.f_name || ""} | project=${e.f_project_name || ""} | deadline=${e.f_deadline || ""} | date=${e.f_date || ""} | amount=${e.f_amount || ""} | email=${e.f_email || ""} | oblige_type=${e.f_obligation_type || ""} | beneficiary=${e.f_beneficiary || ""} | payment_date=${e.f_payment_date || ""} | recurrence=${e.f_recurrence || ""}`).join("\n");
  const cand = (arr, key, cls) => `${cls}: ` + (arr || []).map((x) => `${x.id}::${x[key] || x.title || x.name || ""}`).join(" | ");
  return `${dp}\n\nThemes found:\n${themesStr || "(none)"}\n\nItems to resolve:\n${it}\n\nExisting candidates:\n${cand(c.projects, "title", "Project")}\n${cand(c.themes, "title", "ProjectTheme")}\n${cand(c.tasks, "title", "Task")}\n${cand(c.milestones, "name", "Milestone")}\n${cand(c.decisions, "title", "Decision")}\n${cand(c.contacts, "name", "Contact")}\n${cand(c.events, "title", "Event")}\n${cand(c.documents, "name", "Document")}\n${cand(c.knowledge, "title", "Knowledge")}\n${cand(c.adminObligations, "title", "AdminObligation")}\n\nFor AdminObligation rows, match against existing AdminObligation by title (Categorie) AND amount — same title+amount+monthly = EXISTING.\n\nReturn detected_project_id + a result for every index.`;
}

function existingTitle(candidates, cls, id) {
  if (!id) return "";
  const map = { Project: "projects", ProjectTheme: "themes", Task: "tasks", Person: "contacts", Contact: "contacts", Event: "events", Deadline: "events", Commitment: "events", Document: "documents", Knowledge: "knowledge", Note: "knowledge", Memory: "memory", Idea: "ideas", Decision: "decisions", Milestone: "milestones", FinancialItem: "", AdminObligation: "adminObligations" };
  const arr = candidates[map[cls]] || [];
  const r = arr.find((x) => x.id === id);
  return r ? (r.title || r.name || "") : "";
}

function findExisting(candidates, cls, id) {
  if (!id) return null;
  const map = { Project: "projects", ProjectTheme: "themes", Task: "tasks", Contact: "contacts", Event: "events", Document: "documents", Knowledge: "knowledge", Decision: "decisions", Milestone: "milestones", AdminObligation: "adminObligations" };
  const arr = candidates[map[cls]] || [];
  return arr.find((x) => x.id === id) || null;
}

function validateItem(p, candidates, themeTitles, detectedProjectId) {
  const errors = [];
  const f = p.fields || {};
  // required title/name
  const titleField = p.entity_class === "Milestone" ? "name" : "title";
  const hasTitle = p.title || f.name || (p.entity_class === "Milestone" ? f.name : p.title);
  if (!hasTitle) errors.push("missing required title");
  // valid dates
  for (const k of ["deadline", "date", "start", "end", "payment_date", "start_date", "end_date"]) {
    if (f[k] && isNaN(new Date(f[k]).getTime())) errors.push(`invalid date: ${k}`);
  }
  // duplicate risk for NEW
  if (p.decision === "NEW") {
    const dup = findDuplicate(candidates, p.entity_class, p.title || f.name);
    if (dup) errors.push(`possible duplicate of existing "${dup.title || dup.name}" (${dup.id})`);
  }
  // theme reference
  if (p.theme_title && !themeTitles.has(String(p.theme_title).toLowerCase())) {
    // theme not in understanding — will be created, that's ok; just warn
    errors.push(`theme "${p.theme_title}" not in understanding themes (will be created)`);
  }
  // conflict must have existing_id
  if (p.decision === "CONFLICT" && !p.existing_id) errors.push("conflict without existing_id");
  return { ok: errors.length === 0, errors };
}

function findDuplicate(candidates, cls, title) {
  if (!title) return null;
  const map = { Project: "projects", ProjectTheme: "themes", Task: "tasks", Contact: "contacts", Event: "events", Document: "documents", Knowledge: "knowledge", Decision: "decisions", Milestone: "milestones", AdminObligation: "adminObligations" };
  const arr = candidates[map[cls]] || [];
  const t = String(title).toLowerCase();
  return arr.find((x) => (x.title || x.name || "").toLowerCase() === t) || null;
}

function aggregateConfidence(items) {
  if (!items.length) return "unresolved";
  const c = { certain: 5, highly_likely: 4, probable: 3, uncertain: 2, unresolved: 1 };
  const avg = items.reduce((s, e) => s + (c[e.confidence] || 2), 0) / items.length;
  if (avg >= 4.5) return "certain";
  if (avg >= 3.5) return "highly_likely";
  if (avg >= 2.5) return "probable";
  if (avg >= 1.5) return "uncertain";
  return "unresolved";
}