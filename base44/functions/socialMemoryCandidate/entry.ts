import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * socialMemoryCandidate — §9.7 / §19. Niet elk sociaal moment hoort in
 * Memory. Alleen high-significance SocialMoments worden een Memory-record
 * (wat blijft langdurig relevant) — apart van Activity (wat gebeurde).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { moment_id } = await req.json();
    if (!moment_id) return Response.json({ ok: false, error: "moment_id required" }, { status: 400 });
    const sr = base44.asServiceRole;
    const moment = await sr.entities.SocialMoment.get(moment_id).catch(() => null);
    if (!moment) return Response.json({ ok: true, skipped: "not_found" });
    if (moment.significance !== "high" && !moment.memory_candidate) return Response.json({ ok: true, skipped: "not_significant" });
    await sr.entities.Memory.create({
      category: "People",
      content: `${moment.title} \u2014 ${moment.description || ""}`.trim(),
      confidence: 0.6,
      source: "socialMemoryCandidate",
    });
    return Response.json({ ok: true, created: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}