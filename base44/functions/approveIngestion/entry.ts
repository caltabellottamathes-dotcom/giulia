import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { loadCandidates, executeEntity, logActivity } from '../../shared/ingestExec.ts';
import { emitEvent } from '../../shared/eventEngine.ts';
import { reconstructProject } from '../../shared/reconstruct.ts';

/**
 * approveIngestion — executes the user-approved ingestion Change Plan.
 *
 * Input: { source_id, records: [{ index, entity_class, title, description, fields, action, existing_id, theme_title }] }
 *   action: "create" | "update" | "link" | "merge" | "skip"
 *
 * Creates/updates records via deterministic executeEntity (no parallel system),
 * writes provenance (source_id), emits events through eventEngine, sends gaps
 * to GiuliaQuestion, logs Activity, triggers refreshDashboard + calendarPropagation,
 * and runs project reconstruction on the detected project.
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sourceId = body.source_id;
    const records = Array.isArray(body.records) ? body.records : [];
    if (!sourceId) return Response.json({ error: "source_id required" }, { status: 400 });

    const src = await sr.entities.IngestionSource.get(sourceId).catch(() => null);
    if (!src) return Response.json({ error: "source not found" }, { status: 404 });
    if (src.status !== "pending_approval") return Response.json({ error: "source is not pending approval" }, { status: 400 });

    // User-confirmed target project overrides auto-detection
    const targetProjectId = body.target_project_id || src.detected_project_id || "";
    if (body.target_project_id && body.target_project_id !== src.detected_project_id) {
      await sr.entities.IngestionSource.update(sourceId, { detected_project_id: body.target_project_id }).catch(() => null);
    }

    const candidates = await loadCandidates(sr);
    const ctx = { projectIds: {}, contactIds: {}, themeIds: {} };
    // seed ctx with (confirmed) target project
    if (targetProjectId) {
      const dp = candidates.projects.find((p) => p.id === targetProjectId);
      if (dp) ctx.projectIds[(dp.title || "").toLowerCase()] = dp.id;
    }
    const generated = [], updated = [], relationships = [], conflicts = [], unresolved = [];

    // First pass: create ProjectThemes so theme_id resolution works for items
    const themeRecords = records.filter((r) => ["ProjectTheme", "Theme"].includes(r.entity_class) && r.action !== "skip");
    const otherRecords = records.filter((r) => !["ProjectTheme", "Theme"].includes(r.entity_class) && r.action !== "skip");

    for (const rr of [...themeRecords, ...otherRecords]) {
      const action = rr.action || (rr.existing_id ? "link" : "create");
      const decision = action === "link" || action === "merge" ? "EXISTING" : action === "update" ? "CONFLICT" : "NEW";
      try {
        const out = await executeEntity(sr, {
          cls: rr.entity_class,
          title: rr.title,
          description: rr.description,
          fields: { ...(rr.fields || {}), theme_title: rr.theme_title || (rr.fields || {}).theme_title },
          decision,
          existingId: rr.existing_id || "",
          confidence: "certain",
          reason: "",
          themeId: "",
          projectId: targetProjectId,
          sourceId: sourceId
        }, src, candidates, ctx);
        if (out.generated) generated.push(...out.generated);
        if (out.updated) updated.push(...out.updated);
        if (out.relationships) relationships.push(...out.relationships);
        if (out.conflict) conflicts.push(out.conflict);
      } catch (err) {
        unresolved.push({ index: rr.index, class: rr.entity_class, title: rr.title, reason: String((err && err.message) || err) });
      }
    }

    // ── EVENT ENGINE: emit per record (canonical propagation) ────────
    const touchedProjectIds = new Set(targetProjectId ? [targetProjectId] : []);
    const touchedCalendar = [];
    for (const g of generated) {
      const evType = eventTypeFor(g.entity, false);
      await emitEvent(base44, { event_type: evType, object_type: g.entity, object_id: g.id, domain: domainFor(g.entity), description: `Ingest created ${g.entity} "${g.title}"`, source: "ingestSource" });
      if (g.entity === "Project") touchedProjectIds.add(g.id);
      if (g.entity === "CalendarEvent") touchedCalendar.push(g.id);
    }
    for (const u of updated) {
      const evType = eventTypeFor(u.entity, true);
      await emitEvent(base44, { event_type: evType, object_type: u.entity, object_id: u.id, domain: domainFor(u.entity), description: `Ingest updated ${u.entity} "${u.title}"`, source: "ingestSource" });
      if (u.entity === "Project") touchedProjectIds.add(u.id);
      if (u.entity === "CalendarEvent") touchedCalendar.push(u.id);
    }

    // ── gaps → GiuliaQuestion (only meaningful missing info) ───────────
    const gaps = [];
    for (const g of (src.gaps || [])) {
      if (g && g.description) {
        await sr.entities.GiuliaQuestion.create({
          title: `Ingestion gap: ${g.kind || "missing"}`,
          body: g.description, kind: "fill_the_gap", domain: "projects", priority: "soon",
          status: "open", target_ref: g.target_ref || "", context: `Source: ${src.original_filename || src.id}`,
          agent_source: "approveIngestion"
        }).catch(() => null);
        gaps.push(g);
      }
    }

    // ── activity ──────────────────────────────────────────────────────
    for (const g of generated) await logActivity(sr, g, src, false);
    for (const u of updated) await logActivity(sr, u, src, true);

    // ── propagation & refresh ─────────────────────────────────────────
    if (generated.length || updated.length) {
      base44.functions.invoke("refreshDashboard", {}).catch(() => null);
      if (touchedCalendar.length) base44.functions.invoke("calendarPropagation", {}).catch(() => null);
    }

    // ── PROJECT RECONSTRUCTION (post-execution health) ───────────────
    let health = null;
    const reconstructId = [...touchedProjectIds][0];
    if (reconstructId) {
      try { health = await reconstructProject(sr, reconstructId); } catch { /* ignore */ }
    }

    await sr.entities.IngestionSource.update(sourceId, {
      status: unresolved.length && !generated.length && !updated.length ? "partial" : "complete",
      generated_records: generated,
      updated_records: updated,
      relationships_created: relationships,
      conflicts, unresolved, gaps,
      project_health: health ? { ...health, computed_at: new Date().toISOString() } : (src.project_health || null),
      version: (src.version || 1) + 1
    }).catch(() => null);

    return Response.json({ ok: true, source_id: sourceId, generated: generated.length, updated: updated.length, conflicts: conflicts.length, unresolved: unresolved.length, gaps: gaps.length, health: health || null });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}

function eventTypeFor(entity, isUpdate) {
  const map = {
    Task: isUpdate ? "TASK_UPDATED" : "TASK_CREATED",
    Project: isUpdate ? "PROJECT_UPDATED" : "PROJECT_CREATED",
    ProjectTheme: isUpdate ? "THEME_UPDATED" : "THEME_CREATED",
    Milestone: isUpdate ? "MILESTONE_UPDATED" : "MILESTONE_CREATED",
    Decision: isUpdate ? "DECISION_UPDATED" : "DECISION_CREATED",
    Document: isUpdate ? "DOCUMENT_UPDATED" : "DOCUMENT_LINKED",
    Contact: isUpdate ? "CONTACT_UPDATED" : "CONTACT_CREATED",
    CalendarEvent: isUpdate ? "EVENT_UPDATED" : "EVENT_CREATED",
    Knowledge: isUpdate ? "KNOWLEDGE_UPDATED" : "KNOWLEDGE_CREATED",
    AdminObligation: isUpdate ? "OBLIGATION_UPDATED" : "OBLIGATION_CREATED",
  };
  return map[entity] || (isUpdate ? "INGEST_UPDATED" : "INGEST_CREATED");
}

function domainFor(entity) {
  if (["Project", "Task", "CalendarEvent", "Document", "Contact", "ProjectTheme", "Milestone", "Decision", "Knowledge"].includes(entity)) return "focus";
  if (["Income", "RecurringExpense", "AdminObligation"].includes(entity)) return "life";
  return "giulia";
}