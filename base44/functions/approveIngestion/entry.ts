import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { loadCandidates, executeEntity, logActivity } from '../../shared/ingestExec.ts';

/**
 * approveIngestion — executes the user-approved ingestion proposals.
 *
 * Input: { source_id, records: [{ index, entity_class, title, description, fields, action, existing_id }] }
 *   action: "create" | "link" | "skip"
 *     - create → new record (NEW)
 *     - link   → merge into existing_id (EXISTING)
 *     - skip   → ignored
 *
 * Creates/updates records, links relationships, sends gaps to Wants to Know,
 * logs Activity, and finalizes the source as `complete`.
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

    const candidates = await loadCandidates(sr);
    const ctx = { projectIds: {}, contactIds: {} };
    const generated = [], updated = [], relationships = [], conflicts = [], unresolved = [];

    for (const rr of records) {
      if (rr.action === "skip") continue;
      const decision = rr.action === "link" ? "EXISTING" : "NEW";
      try {
        const out = await executeEntity(sr, {
          cls: rr.entity_class,
          title: rr.title,
          description: rr.description,
          fields: rr.fields || {},
          decision,
          existingId: rr.existing_id || "",
          confidence: "certain",
          reason: ""
        }, src, candidates, ctx);
        if (out.generated) generated.push(...out.generated);
        if (out.updated) updated.push(...out.updated);
        if (out.relationships) relationships.push(...out.relationships);
        if (out.conflict) conflicts.push(out.conflict);
      } catch (err) {
        unresolved.push({ index: rr.index, class: rr.entity_class, title: rr.title, reason: String((err && err.message) || err) });
      }
    }

    // gaps → GiuliaQuestion
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

    // activity
    for (const g of generated) await logActivity(sr, g, src, false);
    for (const u of updated) await logActivity(sr, u, src, true);
    if (generated.length || updated.length) {
      base44.functions.invoke("refreshDashboard", {}).catch(() => null);
      const touchedCal = generated.some((g) => g.entity === "CalendarEvent") || updated.some((u) => u.entity === "CalendarEvent");
      if (touchedCal) base44.functions.invoke("calendarPropagation", {}).catch(() => null);
    }

    await sr.entities.IngestionSource.update(sourceId, {
      status: unresolved.length && !generated.length && !updated.length ? "partial" : "complete",
      generated_records: generated,
      updated_records: updated,
      relationships_created: relationships,
      conflicts, unresolved, gaps,
      version: (src.version || 1) + 1
    }).catch(() => null);

    return Response.json({ ok: true, source_id: sourceId, generated: generated.length, updated: updated.length, conflicts: conflicts.length, unresolved: unresolved.length, gaps: gaps.length });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}