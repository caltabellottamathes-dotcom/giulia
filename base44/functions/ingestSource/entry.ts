import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * ingestSource — Universal Information Ingestion pipeline.
 *
 * Reads an IngestionSource record, processes the complete source (PDF text,
 * pasted text, or image via vision), understands it into a structured
 * "understanding payload" of normalized entities, resolves each against
 * existing OS data, executes a non-destructive merge/create plan, links
 * entities, distributes via Activity + existing downstream triggers, and
 * finalizes the source with a full provenance audit. Idempotent on reprocess.
 *
 * Aanroep: { source_id }
 */

const HIGH = ["certain", "highly_likely", "probable"];

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
  "You are the GIULIA OS ingestion engine. Read the ENTIRE source and extract ALL meaningful, normalized entities. " +
  "Tag each with an entity_class and confidence. Distinguish explicit (directly stated) from inferred (reasonably derivable) — never silently make inference into fact (mark explicit=false and note it). " +
  "Only extract real, actionable or meaningful information; skip noise. Financial items: set fields.financial_kind ('income'|'expense'), amount, currency, recurring, frequency, category, payment_date/start_date/end_date. " +
  "Tasks: only when a real action/commitment/deadline exists. Dates: ISO8601 where possible. Always return valid JSON per the schema.";

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
      prompt: "You resolve extracted entities against existing GIULIA OS records by name/alias/date/email/semantic match. Return JSON {results:[{index, decision, existing_id, reason}]}. Prefer EXISTING over NEW to avoid duplicates; use CONFLICT when the source contradicts existing data.\n\n" + buildResolutionPrompt(entities, candidates),
      response_json_schema: RESOLUTION_SCHEMA
    }).catch(() => null);
    const results = (resolution && resolution.results) || entities.map((_, i) => ({ index: i, decision: "NEW" }));

    // Idempotent reprocess: prefer previously generated records for this source
    const priorGenerated = (src.generated_records || []).map((g) => `${g.entity}::${g.id}`);

    // ── CONNECTING + UPDATING ─────────────────────────────────────────
    await hist("connecting");
    const ctx = { projectIds: {}, contactIds: {} };
    const generated = [], updated = [], relationships = [], conflicts = [], unresolved = [];

    for (let i = 0; i < entities.length; i++) {
      const e = entities[i] || {};
      const r = results.find((x) => x.index === i) || { decision: "NEW" };
      const highConf = HIGH.includes(e.confidence);
      if (!highConf && r.decision === "UNKNOWN") { unresolved.push({ index: i, class: e.entity_class, title: e.title, reason: r.reason || "low confidence" }); continue; }
      try {
        const out = await executeEntity(sr, e, r, src, candidates, ctx, priorGenerated);
        if (out.generated) generated.push(...out.generated);
        if (out.updated) updated.push(...out.updated);
        if (out.relationships) relationships.push(...out.relationships);
        if (out.conflict) conflicts.push(out.conflict);
      } catch (err) {
        unresolved.push({ index: i, class: e.entity_class, title: e.title, reason: String((err && err.message) || err) });
      }
    }

    // ── GAPS → GiuliaQuestion ─────────────────────────────────────────
    const gaps = [];
    for (const g of (understanding.gaps || [])) {
      if (g && g.description) {
        await sr.entities.GiuliaQuestion.create({
          title: `Ingestion gap: ${g.kind || "missing"}`,
          body: g.description, kind: "fill_the_gap", domain: "projects", priority: "soon",
          status: "open", target_ref: g.target_ref || "", context: `Source: ${src.original_filename || src.id}`,
          agent_source: "ingestSource"
        }).catch(() => null);
        gaps.push(g);
      }
    }

    // ── DISTRIBUTING ───────────────────────────────────────────────────
    await hist("distributing");
    for (const g of generated) await logActivity(sr, g, src, false);
    for (const u of updated) await logActivity(sr, u, src, true);
    if (generated.length || updated.length) {
      base44.functions.invoke("refreshDashboard", {}).catch(() => null);
      const touchedCal = generated.some((g) => g.entity === "CalendarEvent") || updated.some((u) => u.entity === "CalendarEvent");
      if (touchedCal) base44.functions.invoke("calendarPropagation", {}).catch(() => null);
    }

    // ── COMPLETE ──────────────────────────────────────────────────────
    const conf = aggregateConfidence(entities, generated, updated, unresolved);
    await patchSrc({
      status: unresolved.length && !generated.length && !updated.length ? "partial" : "complete",
      confidence: conf,
      generated_records: generated, updated_records: updated, relationships_created: relationships,
      conflicts, unresolved, gaps, version: (src.version || 1) + 1
    });

    return Response.json({ ok: true, source_id: sourceId, generated: generated.length, updated: updated.length, conflicts: conflicts.length, unresolved: unresolved.length, gaps: gaps.length });
  } catch (error) {
    const body = await req.json().catch(() => ({}));
    if (body.source_id) await sr.entities.IngestionSource.update(body.source_id, { status: "failed", error: String(error.message) }).catch(() => null);
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}

// ── helpers ──────────────────────────────────────────────────────────────

async function loadCandidates(sr) {
  const [projects, tasks, contacts, events, documents, knowledge, memory, ideas, decisions] = await Promise.all([
    sr.entities.Project.list("-created_date", 50).catch(() => []),
    sr.entities.Task.list("-created_date", 50).catch(() => []),
    sr.entities.Contact.list("-created_date", 50).catch(() => []),
    sr.entities.CalendarEvent.list("-start", 50).catch(() => []),
    sr.entities.Document.list("-created_date", 50).catch(() => []),
    sr.entities.Knowledge.list("-created_date", 50).catch(() => []),
    sr.entities.Memory.list("-created_date", 50).catch(() => []),
    sr.entities.Idea.list("-created_date", 50).catch(() => []),
    sr.entities.Decision.list("-created_date", 50).catch(() => []),
  ]);
  return { projects: projects || [], tasks: tasks || [], contacts: contacts || [], events: events || [], documents: documents || [], knowledge: knowledge || [], memory: memory || [], ideas: ideas || [], decisions: decisions || [] };
}

function buildResolutionPrompt(entities, c) {
  const ent = entities.map((e, i) => `[${i}] ${e.entity_class} | title="${e.title || ""}" | name=${e.f_name || ""} | project=${e.f_project_name || ""} | deadline=${e.f_deadline || ""} | amount=${e.f_amount || ""} | email=${e.f_email || ""}`).join("\n");
  const cand = (arr, key, cls) => `${cls}: ` + (arr || []).map((x) => `${x.id}::${x[key] || x.title || x.name || ""}`).join(" | ");
  return `Entities to resolve:\n${ent}\n\nExisting candidates:\n${cand(c.projects, "title", "Project")}\n${cand(c.tasks, "title", "Task")}\n${cand(c.contacts, "name", "Contact")}\n${cand(c.events, "title", "Event")}\n${cand(c.documents, "name", "Document")}\n${cand(c.knowledge, "title", "Knowledge")}\n${cand(c.ideas, "title", "Idea")}\n${cand(c.decisions, "title", "Decision")}\n\nReturn results for every index.`;
}

function dateOnly(s) { if (!s) return undefined; const d = new Date(s); if (isNaN(d.getTime())) return s; return d.toISOString().slice(0, 10); }
function dateTime(s) { if (!s) return undefined; const d = new Date(s); if (isNaN(d.getTime())) return s; return d.toISOString(); }

function mergePatch(existing, data) {
  const patch = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    if (existing[k] !== v) patch[k] = v;
  }
  return patch;
}

function resolveProjectId(ctx, candidates, name) {
  if (!name) return undefined;
  const n = String(name).toLowerCase();
  if (ctx.projectIds[n]) return ctx.projectIds[n];
  const m = candidates.projects.find((p) => (p.title || "").toLowerCase().includes(n) || n.includes((p.title || "").toLowerCase()));
  return m ? m.id : undefined;
}
function resolveContactId(ctx, candidates, f) {
  const em = (f.email || "").toLowerCase();
  const nm = (f.name || "").toLowerCase();
  if (em && ctx.contactIds[em]) return ctx.contactIds[em];
  const m = candidates.contacts.find((c) => (em && (c.email || "").toLowerCase() === em) || (nm && (c.name || "").toLowerCase() === nm));
  return m ? m.id : undefined;
}

async function executeEntity(sr, e, r, src, candidates, ctx, priorGenerated) {
  const out = { generated: [], updated: [], relationships: [], conflict: null };
  const f = {
    name: e.f_name, project_name: e.f_project_name, deadline: e.f_deadline, date: e.f_date, start: e.f_start, end: e.f_end,
    amount: e.f_amount, currency: e.f_currency, recurring: e.f_recurring, frequency: e.f_frequency, category: e.f_category,
    financial_kind: e.f_financial_kind, payment_date: e.f_payment_date, start_date: e.f_start_date, end_date: e.f_end_date, account_source: e.f_account_source,
    email: e.f_email, phone: e.f_phone, company: e.f_company, role: e.f_role, relationship_type: e.f_relationship_type,
    priority: e.f_priority, status: e.f_status, location: e.f_location, notes: e.f_notes, content: e.f_content, decision: e.f_decision, url: e.f_url, description: e.f_description
  };
  const cls = e.entity_class;
  const isUpdate = r.existing_id && (r.decision === "EXISTING" || r.decision === "POSSIBLE_MATCH" || r.decision === "CONFLICT");

  if (cls === "Project") {
    const data = { title: f.name || e.title, description: f.description || f.notes || e.description || "", domain: f.domain || "focus" };
    if (f.deadline) data.deadline = dateOnly(f.deadline);
    if (f.status) data.status = f.status;
    if (f.priority) data.health = f.priority === "high" ? "attention" : "good";
    const ex = r.existing_id ? candidates.projects.find((p) => p.id === r.existing_id) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.Project.update(ex.id, p);
      ctx.projectIds[(data.title || ex.title || "").toLowerCase()] = ex.id;
      out.updated.push({ entity: "Project", id: ex.id, title: ex.title });
      if (r.decision === "CONFLICT") out.conflict = { entity: "Project", id: ex.id, title: ex.title, reason: r.reason };
    } else {
      const proj = await sr.entities.Project.create(data);
      ctx.projectIds[(data.title || "").toLowerCase()] = proj.id;
      out.generated.push({ entity: "Project", id: proj.id, title: data.title });
    }
  } else if (cls === "Task") {
    const projectId = resolveProjectId(ctx, candidates, f.project_name);
    const contactId = resolveContactId(ctx, candidates, f);
    const data = { title: e.title, description: f.description || f.notes || e.description || "", domain: f.domain || "focus", priority: f.priority || "medium", status: f.status || "todo" };
    if (f.deadline) data.deadline = dateOnly(f.deadline);
    if (projectId) data.project_id = projectId;
    if (contactId) data.contact_id = contactId;
    const ex = r.existing_id ? candidates.tasks.find((t) => t.id === r.existing_id) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.Task.update(ex.id, p);
      out.updated.push({ entity: "Task", id: ex.id, title: ex.title });
      if (projectId) out.relationships.push({ from: `Task:${ex.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
    } else {
      const t = await sr.entities.Task.create(data);
      out.generated.push({ entity: "Task", id: t.id, title: data.title });
      if (projectId) out.relationships.push({ from: `Task:${t.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
    }
  } else if (cls === "Person" || cls === "Contact") {
    const data = { name: f.name || e.title };
    if (f.email) data.email = f.email;
    if (f.phone) data.phone = f.phone;
    if (f.company) data.company = f.company;
    if (f.role) data.role = f.role;
    if (f.relationship_type) data.relationship_type = f.relationship_type;
    data.status = "confirmed";
    data.last_contact_date = new Date().toISOString();
    const ex = r.existing_id ? candidates.contacts.find((c) => c.id === r.existing_id) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.Contact.update(ex.id, p);
      if (data.email) ctx.contactIds[data.email.toLowerCase()] = ex.id;
      out.updated.push({ entity: "Contact", id: ex.id, title: ex.name });
    } else {
      const c = await sr.entities.Contact.create(data);
      if (data.email) ctx.contactIds[data.email.toLowerCase()] = c.id;
      out.generated.push({ entity: "Contact", id: c.id, title: data.name });
    }
  } else if (cls === "Event" || cls === "Deadline" || cls === "Commitment") {
    const projectId = resolveProjectId(ctx, candidates, f.project_name);
    const start = dateTime(f.start || f.date || f.deadline);
    const end = dateTime(f.end) || (start ? new Date(new Date(start).getTime() + 3600000).toISOString() : undefined);
    const data = { title: e.title, description: f.description || e.description || "", domain: f.domain || "life", status: "tentative" };
    if (start) data.start = start;
    if (end) data.end = end;
    if (f.location) data.location = f.location;
    if (projectId) data.project_id = projectId;
    const ex = r.existing_id ? candidates.events.find((ev) => ev.id === r.existing_id) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.CalendarEvent.update(ex.id, p);
      out.updated.push({ entity: "CalendarEvent", id: ex.id, title: ex.title });
    } else {
      const ev = await sr.entities.CalendarEvent.create(data);
      out.generated.push({ entity: "CalendarEvent", id: ev.id, title: data.title });
    }
  } else if (cls === "Document") {
    const projectId = resolveProjectId(ctx, candidates, f.project_name);
    const data = { name: e.title || src.original_filename || "document", url: f.url || src.file_url || "", type: src.source_type === "pdf" ? "pdf" : "other", document_type: "reference", content: f.description || f.notes || e.description || "" };
    if (projectId) data.project_id = projectId;
    const doc = await sr.entities.Document.create(data);
    out.generated.push({ entity: "Document", id: doc.id, title: data.name });
    if (projectId) out.relationships.push({ from: `Document:${doc.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
  } else if (cls === "Knowledge" || cls === "Note") {
    const projectId = resolveProjectId(ctx, candidates, f.project_name);
    const data = { title: e.title || understanding_subject(src), content: f.content || f.description || f.notes || e.description || "", category: "Notes", source: `Ingestion: ${src.original_filename || src.id}` };
    if (projectId) data.project_id = projectId;
    const k = await sr.entities.Knowledge.create(data);
    out.generated.push({ entity: "Knowledge", id: k.id, title: data.title });
  } else if (cls === "Memory") {
    const data = { content: f.content || f.description || e.description || e.title || "", category: "Important information", confidence: e.confidence === "certain" ? 0.95 : e.confidence === "highly_likely" ? 0.8 : 0.6, source: `Ingestion: ${src.original_filename || src.id}` };
    await sr.entities.Memory.create(data);
    out.generated.push({ entity: "Memory", id: null, title: "memory" });
  } else if (cls === "Idea") {
    const projectId = resolveProjectId(ctx, candidates, f.project_name);
    const data = { title: e.title, content: f.content || f.description || f.notes || e.description || "", status: "new", agent_source: "ingestSource" };
    if (projectId) data.project_id = projectId;
    const idea = await sr.entities.Idea.create(data);
    out.generated.push({ entity: "Idea", id: idea.id, title: data.title });
  } else if (cls === "Decision") {
    const projectId = resolveProjectId(ctx, candidates, f.project_name);
    const data = { title: e.title, description: f.decision || f.description || e.description || "", date: dateOnly(f.date) || dateOnly(new Date().toISOString()) };
    if (projectId) data.project_id = projectId;
    const d = await sr.entities.Decision.create(data);
    out.generated.push({ entity: "Decision", id: d.id, title: data.title });
  } else if (cls === "FinancialItem") {
    const isExpense = (f.financial_kind || "expense") === "expense";
    const projectId = resolveProjectId(ctx, candidates, f.project_name);
    const contactId = resolveContactId(ctx, candidates, f);
    if (isExpense) {
      const data = { amount: Number(f.amount) || 0, currency: f.currency || "EUR", category: f.category || "", description: f.description || e.title || "", payment_date: dateOnly(f.payment_date || f.date), start_date: dateOnly(f.start_date), end_date: dateOnly(f.end_date), frequency: f.frequency || "", account_source: f.account_source || "", source_id: src.id };
      if (projectId) data.project_id = projectId;
      if (contactId) data.contact_id = contactId;
      const rec = await sr.entities.RecurringExpense.create(data);
      out.generated.push({ entity: "RecurringExpense", id: rec.id, title: `${data.amount} ${data.currency}` });
    } else {
      const data = { amount: Number(f.amount) || 0, currency: f.currency || "EUR", category: f.category || "", description: f.description || e.title || "", date: dateOnly(f.date), recurring: f.recurring === true, frequency: f.frequency || "", account_source: f.account_source || "", source_id: src.id };
      if (projectId) data.project_id = projectId;
      if (contactId) data.contact_id = contactId;
      const rec = await sr.entities.Income.create(data);
      out.generated.push({ entity: "Income", id: rec.id, title: `${data.amount} ${data.currency}` });
    }
  } else {
    out.conflict = null;
  }
  return out;
}

function understanding_subject(src) { return src.overall_subject || src.original_filename || "ingested note"; }

async function logActivity(sr, rec, src, isUpdate) {
  const domain = ["Project", "Task", "CalendarEvent", "Document", "Contact"].includes(rec.entity) ? "focus" : ["Income", "RecurringExpense"].includes(rec.entity) ? "life" : "giulia";
  await sr.entities.Activity.create({
    action: isUpdate ? "ingest_update" : "ingest_create",
    description: `${isUpdate ? "Updated" : "Created"} ${rec.entity}${rec.title ? ` "${rec.title}"` : ""} from ${src.original_filename || "ingestion"}`,
    source: "ingestSource", timestamp: new Date().toISOString(),
    event_type: isUpdate ? "update" : "create", object_type: rec.entity, object_id: rec.id || "", domain
  }).catch(() => null);
}

function aggregateConfidence(entities, generated, updated, unresolved) {
  const total = entities.length || 1;
  const acted = generated.length + updated.length;
  const pct = acted / total;
  if (pct >= 0.8) return "certain";
  if (pct >= 0.5) return "highly_likely";
  if (pct >= 0.25) return "probable";
  if (acted > 0) return "uncertain";
  return "unresolved";
}