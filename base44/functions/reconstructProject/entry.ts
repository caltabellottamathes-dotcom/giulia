import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { reconstructProject } from '../../shared/reconstruct.ts';

/**
 * reconstructProject — Project Reconstruction & Health after ingestion.
 *
 * Re-analyses the project as a whole: structure, completeness, progress,
 * dependencies, deadlines, missing info, conflicts, health, next logical
 * steps. Deterministic (no LLM).
 *
 * Aanroep: { project_id, source_id? }
 */
export default async function (req) {
  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;
  try {
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const projectId = body.project_id;
    if (!projectId) return Response.json({ error: "project_id required" }, { status: 400 });

    const health = await reconstructProject(sr, projectId);
    if (!health) return Response.json({ error: "project not found" }, { status: 404 });

    return Response.json({ ok: true, project_id: projectId, health });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}