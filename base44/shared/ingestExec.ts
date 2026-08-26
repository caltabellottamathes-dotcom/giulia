// Shared execution helpers for the Ingestion pipeline.
// ingestSource only PROPOSES — nothing is created until the user approves.
// approveIngestion uses these helpers to actually create/update/link records.

export async function loadCandidates(sr) {
  const [projects, tasks, contacts, events, documents, knowledge, memory, ideas, decisions, milestones, themes] = await Promise.all([
    sr.entities.Project.list("-created_date", 100).catch(() => []),
    sr.entities.Task.list("-created_date", 200).catch(() => []),
    sr.entities.Contact.list("-created_date", 200).catch(() => []),
    sr.entities.CalendarEvent.list("-start", 100).catch(() => []),
    sr.entities.Document.list("-created_date", 100).catch(() => []),
    sr.entities.Knowledge.list("-created_date", 100).catch(() => []),
    sr.entities.Memory.list("-created_date", 100).catch(() => []),
    sr.entities.Idea.list("-created_date", 100).catch(() => []),
    sr.entities.Decision.list("-created_date", 100).catch(() => []),
    sr.entities.Milestone.list("-created_date", 100).catch(() => []),
    sr.entities.ProjectTheme.list("-created_date", 200).catch(() => []),
  ]);
  return {
    projects: projects || [], tasks: tasks || [], contacts: contacts || [], events: events || [],
    documents: documents || [], knowledge: knowledge || [], memory: memory || [], ideas: ideas || [],
    decisions: decisions || [], milestones: milestones || [], themes: themes || []
  };
}

export function dateOnly(s) { if (!s) return undefined; const d = new Date(s); if (isNaN(d.getTime())) return s; return d.toISOString().slice(0, 10); }
export function dateTime(s) { if (!s) return undefined; const d = new Date(s); if (isNaN(d.getTime())) return s; return d.toISOString(); }

export function mergePatch(existing, data) {
  const patch = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    if (existing[k] !== v) patch[k] = v;
  }
  return patch;
}

export function resolveProjectId(ctx, candidates, name) {
  if (!name) return undefined;
  const n = String(name).toLowerCase();
  if (ctx.projectIds[n]) return ctx.projectIds[n];
  const m = candidates.projects.find((p) => (p.title || "").toLowerCase().includes(n) || n.includes((p.title || "").toLowerCase()));
  return m ? m.id : undefined;
}
export function resolveContactId(ctx, candidates, f) {
  const em = (f.email || "").toLowerCase();
  const nm = (f.name || "").toLowerCase();
  if (em && ctx.contactIds[em]) return ctx.contactIds[em];
  const m = candidates.contacts.find((c) => (em && (c.email || "").toLowerCase() === em) || (nm && (c.name || "").toLowerCase() === nm));
  return m ? m.id : undefined;
}
export function resolveThemeId(ctx, candidates, themeTitle, projectId) {
  if (!themeTitle) return undefined;
  const n = String(themeTitle).toLowerCase();
  // ctx-level cache (within one approval run)
  if (ctx.themeIds && ctx.themeIds[n]) return ctx.themeIds[n];
  const m = (candidates.themes || []).find((t) => {
    if (t.title.toLowerCase() !== n) return false;
    return !projectId || !t.project_id || t.project_id === projectId;
  });
  return m ? m.id : undefined;
}

// rec = { cls, title, description, fields, decision, existingId, confidence, reason, themeId, projectId, sourceId }
export async function executeEntity(sr, rec, src, candidates, ctx) {
  const out = { generated: [], updated: [], relationships: [], conflict: null };
  const f = rec.fields || {};
  const cls = rec.cls;
  const projectId = rec.projectId || resolveProjectId(ctx, candidates, f.project_name);
  const themeId = rec.themeId || resolveThemeId(ctx, candidates, f.theme_title, projectId);
  const sourceId = rec.sourceId || src.id;

  if (cls === "Project") {
    const data = { title: f.name || rec.title, description: f.description || f.notes || rec.description || "", domain: f.domain || "focus" };
    if (f.deadline) data.deadline = dateOnly(f.deadline);
    if (f.status) data.status = f.status;
    if (f.priority) data.health = f.priority === "high" ? "attention" : "good";
    const ex = rec.existingId ? candidates.projects.find((p) => p.id === rec.existingId) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.Project.update(ex.id, p);
      ctx.projectIds[(data.title || ex.title || "").toLowerCase()] = ex.id;
      out.updated.push({ entity: "Project", id: ex.id, title: ex.title });
      if (rec.decision === "CONFLICT") out.conflict = { entity: "Project", id: ex.id, title: ex.title, reason: rec.reason || "conflict" };
    } else {
      const proj = await sr.entities.Project.create(data);
      ctx.projectIds[(data.title || "").toLowerCase()] = proj.id;
      out.generated.push({ entity: "Project", id: proj.id, title: data.title });
    }
  } else if (cls === "ProjectTheme" || cls === "Theme") {
    const parentTitle = f.parent_title || "";
    const parentId = parentTitle ? resolveThemeId(ctx, candidates, parentTitle, projectId) : undefined;
    const data = {
      title: f.name || rec.title,
      description: f.description || f.notes || rec.description || "",
      purpose: f.purpose || "",
      context: f.context || "",
      status: f.status || "open",
      priority: f.priority || "medium",
      progress: 0,
      order: Number(f.order) || 0,
      agent_source: "ingestSource",
      source_id: sourceId
    };
    if (projectId) data.project_id = projectId;
    if (parentId) data.parent_theme_id = parentId;
    const ex = rec.existingId ? (candidates.themes || []).find((t) => t.id === rec.existingId) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.ProjectTheme.update(ex.id, p);
      if (!ctx.themeIds) ctx.themeIds = {};
      ctx.themeIds[(data.title || ex.title || "").toLowerCase()] = ex.id;
      out.updated.push({ entity: "ProjectTheme", id: ex.id, title: ex.title });
    } else {
      const t = await sr.entities.ProjectTheme.create(data);
      if (!ctx.themeIds) ctx.themeIds = {};
      ctx.themeIds[(data.title || "").toLowerCase()] = t.id;
      out.generated.push({ entity: "ProjectTheme", id: t.id, title: data.title });
      if (projectId) out.relationships.push({ from: `ProjectTheme:${t.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
      if (parentId) out.relationships.push({ from: `ProjectTheme:${t.id}`, to: `ProjectTheme:${parentId}`, kind: "child_of" });
    }
  } else if (cls === "Task") {
    const contactId = resolveContactId(ctx, candidates, f);
    const data = { title: rec.title, description: f.description || f.notes || rec.description || "", domain: f.domain || "focus", priority: f.priority || "medium", status: f.status || "todo", source_id: sourceId };
    if (f.deadline) data.deadline = dateOnly(f.deadline);
    if (projectId) data.project_id = projectId;
    if (contactId) data.contact_id = contactId;
    if (themeId) data.theme_id = themeId;
    const ex = rec.existingId ? candidates.tasks.find((t) => t.id === rec.existingId) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.Task.update(ex.id, p);
      out.updated.push({ entity: "Task", id: ex.id, title: ex.title });
      if (projectId) out.relationships.push({ from: `Task:${ex.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
      if (themeId) out.relationships.push({ from: `Task:${ex.id}`, to: `ProjectTheme:${themeId}`, kind: "belongs_to" });
    } else {
      const t = await sr.entities.Task.create(data);
      out.generated.push({ entity: "Task", id: t.id, title: data.title });
      if (projectId) out.relationships.push({ from: `Task:${t.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
      if (themeId) out.relationships.push({ from: `Task:${t.id}`, to: `ProjectTheme:${themeId}`, kind: "belongs_to" });
    }
  } else if (cls === "Milestone") {
    const data = { name: f.name || rec.title, description: f.description || f.notes || rec.description || "", status: f.status || "open", source_id: sourceId };
    if (f.date) data.date = dateOnly(f.date);
    if (projectId) data.project_id = projectId;
    if (themeId) data.theme_id = themeId;
    const ex = rec.existingId ? (candidates.milestones || []).find((m) => m.id === rec.existingId) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.Milestone.update(ex.id, p);
      out.updated.push({ entity: "Milestone", id: ex.id, title: ex.name });
    } else {
      const m = await sr.entities.Milestone.create(data);
      out.generated.push({ entity: "Milestone", id: m.id, title: data.name });
      if (projectId) out.relationships.push({ from: `Milestone:${m.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
      if (themeId) out.relationships.push({ from: `Milestone:${m.id}`, to: `ProjectTheme:${themeId}`, kind: "belongs_to" });
    }
  } else if (cls === "Person" || cls === "Contact") {
    const data = { name: f.name || rec.title };
    if (f.email) data.email = f.email;
    if (f.phone) data.phone = f.phone;
    if (f.company) data.company = f.company;
    if (f.role) data.role = f.role;
    if (f.relationship_type) data.relationship_type = f.relationship_type;
    data.status = "confirmed";
    data.last_contact_date = new Date().toISOString();
    const ex = rec.existingId ? candidates.contacts.find((c) => c.id === rec.existingId) : null;
    let contactId;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.Contact.update(ex.id, p);
      if (data.email) ctx.contactIds[data.email.toLowerCase()] = ex.id;
      contactId = ex.id;
      out.updated.push({ entity: "Contact", id: ex.id, title: ex.name });
    } else {
      const c = await sr.entities.Contact.create(data);
      if (data.email) ctx.contactIds[data.email.toLowerCase()] = c.id;
      contactId = c.id;
      out.generated.push({ entity: "Contact", id: c.id, title: data.name });
    }
    // Link contact → project (Contact.project_ids) — canonical source of truth
    if (projectId) {
      const cur = await sr.entities.Contact.get(contactId).catch(() => null);
      if (cur) {
        const pids = [...(cur.project_ids || []), projectId].filter((v, i, a) => a.indexOf(v) === i);
        if (pids.length !== (cur.project_ids || []).length) await sr.entities.Contact.update(contactId, { project_ids: pids }).catch(() => null);
        out.relationships.push({ from: `Contact:${contactId}`, to: `Project:${projectId}`, kind: "involved_in" });
      }
    }
  } else if (cls === "Event" || cls === "Deadline" || cls === "Commitment") {
    const start = dateTime(f.start || f.date || f.deadline);
    const end = dateTime(f.end) || (start ? new Date(new Date(start).getTime() + 3600000).toISOString() : undefined);
    const data = { title: rec.title, description: f.description || rec.description || "", domain: f.domain || "life", status: "tentative", source_id: sourceId };
    if (start) data.start = start;
    if (end) data.end = end;
    if (f.location) data.location = f.location;
    if (projectId) data.project_id = projectId;
    if (themeId) data.theme_id = themeId;
    const ex = rec.existingId ? candidates.events.find((ev) => ev.id === rec.existingId) : null;
    if (ex) {
      const p = mergePatch(ex, data); if (Object.keys(p).length) await sr.entities.CalendarEvent.update(ex.id, p);
      out.updated.push({ entity: "CalendarEvent", id: ex.id, title: ex.title });
    } else {
      const ev = await sr.entities.CalendarEvent.create(data);
      out.generated.push({ entity: "CalendarEvent", id: ev.id, title: data.title });
    }
  } else if (cls === "Document") {
    const data = { name: rec.title || src.original_filename || "document", url: f.url || src.file_url || "", type: src.source_type === "pdf" ? "pdf" : "other", document_type: "reference", content: f.description || f.notes || rec.description || "", source_id: sourceId };
    if (projectId) data.project_id = projectId;
    if (themeId) data.theme_id = themeId;
    const doc = await sr.entities.Document.create(data);
    out.generated.push({ entity: "Document", id: doc.id, title: data.name });
    if (projectId) out.relationships.push({ from: `Document:${doc.id}`, to: `Project:${projectId}`, kind: "belongs_to" });
    if (themeId) out.relationships.push({ from: `Document:${doc.id}`, to: `ProjectTheme:${themeId}`, kind: "belongs_to" });
  } else if (cls === "Knowledge" || cls === "Note") {
    const data = { title: rec.title || src.overall_subject || src.original_filename || "ingested note", content: f.content || f.description || f.notes || rec.description || "", category: "Notes", source: `Ingestion: ${src.original_filename || src.id}`, source_id: sourceId };
    if (projectId) data.project_id = projectId;
    if (themeId) data.theme_id = themeId;
    const k = await sr.entities.Knowledge.create(data);
    out.generated.push({ entity: "Knowledge", id: k.id, title: data.title });
    if (themeId) out.relationships.push({ from: `Knowledge:${k.id}`, to: `ProjectTheme:${themeId}`, kind: "belongs_to" });
  } else if (cls === "Memory") {
    const data = { content: f.content || f.description || rec.description || rec.title || "", category: "Important information", confidence: rec.confidence === "certain" ? 0.95 : rec.confidence === "highly_likely" ? 0.8 : 0.6, source: `Ingestion: ${src.original_filename || src.id}` };
    await sr.entities.Memory.create(data);
    out.generated.push({ entity: "Memory", id: null, title: "memory" });
  } else if (cls === "Idea") {
    const data = { title: rec.title, content: f.content || f.description || f.notes || rec.description || "", status: "new", agent_source: "ingestSource" };
    if (projectId) data.project_id = projectId;
    const idea = await sr.entities.Idea.create(data);
    out.generated.push({ entity: "Idea", id: idea.id, title: data.title });
  } else if (cls === "Decision") {
    const data = { title: rec.title, description: f.decision || f.description || rec.description || "", date: dateOnly(f.date) || dateOnly(new Date().toISOString()), source_id: sourceId };
    if (projectId) data.project_id = projectId;
    if (themeId) data.theme_id = themeId;
    const d = await sr.entities.Decision.create(data);
    out.generated.push({ entity: "Decision", id: d.id, title: data.title });
    if (themeId) out.relationships.push({ from: `Decision:${d.id}`, to: `ProjectTheme:${themeId}`, kind: "belongs_to" });
  } else if (cls === "FinancialItem") {
    const isExpense = (f.financial_kind || "expense") === "expense";
    if (isExpense) {
      const data = { amount: Number(f.amount) || 0, currency: f.currency || "EUR", category: f.category || "", description: f.description || rec.title || "", payment_date: dateOnly(f.payment_date || f.date), start_date: dateOnly(f.start_date), end_date: dateOnly(f.end_date), frequency: f.frequency || "", account_source: f.account_source || "", source_id: sourceId };
      if (projectId) data.project_id = projectId;
      const contactId = resolveContactId(ctx, candidates, f);
      if (contactId) data.contact_id = contactId;
      const r = await sr.entities.RecurringExpense.create(data);
      out.generated.push({ entity: "RecurringExpense", id: r.id, title: `${data.amount} ${data.currency}` });
    } else {
      const data = { amount: Number(f.amount) || 0, currency: f.currency || "EUR", category: f.category || "", description: f.description || rec.title || "", date: dateOnly(f.date), recurring: f.recurring === true, frequency: f.frequency || "", account_source: f.account_source || "", source_id: sourceId };
      if (projectId) data.project_id = projectId;
      const contactId = resolveContactId(ctx, candidates, f);
      if (contactId) data.contact_id = contactId;
      const r = await sr.entities.Income.create(data);
      out.generated.push({ entity: "Income", id: r.id, title: `${data.amount} ${data.currency}` });
    }
  }
  return out;
}

export async function logActivity(sr, rec, src, isUpdate) {
  const domain = ["Project", "Task", "CalendarEvent", "Document", "Contact", "ProjectTheme", "Milestone", "Decision"].includes(rec.entity) ? "focus" : ["Income", "RecurringExpense"].includes(rec.entity) ? "life" : "giulia";
  await sr.entities.Activity.create({
    action: isUpdate ? "ingest_update" : "ingest_create",
    description: `${isUpdate ? "Updated" : "Created"} ${rec.entity}${rec.title ? ` "${rec.title}"` : ""} from ${src.original_filename || "ingestion"}`,
    source: "ingestSource", timestamp: new Date().toISOString(),
    event_type: isUpdate ? "update" : "create", object_type: rec.entity, object_id: rec.id || "", domain
  }).catch(() => null);
}