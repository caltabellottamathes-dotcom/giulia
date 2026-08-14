import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * manageProjects — deterministische scanner, GEEN eigen Gemini-brein meer.
 * Detecteert stilgevallen projecten en stuurt het signaal naar GIULIA-CONNECT
 * (chatWithGiulia) zodat GIULIA-GIULIA — het enige brein — beslist welke
 * acties nodig zijn. Uitvoering loopt via GIULIA-CORE.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const projects = await sr.entities.Project.list("-created_date", 200).catch(() => []);
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // Domein 10: 14 dagen stilstand-drempel (zelfde als runProjectRadar in runProactivity).
    // Domein 7 anti-spam: max 3 signalen per ronde, niet vaker dan 1x per 7 dagen per project.
    const stale = projects.filter((p) => {
      if (!["planning", "in_progress"].includes(p.status)) return false;
      const last = p.last_activity_date ? new Date(p.last_activity_date).getTime() : null;
      const isStale = !last || now - last >= 14 * dayMs;
      if (!isStale) return false;
      const lastNotified = p.last_notified_at ? new Date(p.last_notified_at).getTime() : null;
      if (lastNotified && now - lastNotified < 7 * dayMs) return false;
      return true;
    }).slice(0, 3);

    if (!stale.length) return Response.json({ ok: true, stale: 0, skipped: "geen stilgevallen projecten" });

    await Promise.all(stale.map((p) => sr.entities.Project.update(p.id, { last_notified_at: new Date().toISOString() }).catch(() => null)));

    const context = `Stilgevallen projecten (${stale.length}):\n` +
      stale.map((p) => `- id:${p.id} | ${p.title} | [${p.status}] | health ${p.health || "?"} | laatste activiteit: ${p.last_activity_date || "onbekend"}`).join("\n");
    const message =
      `Project-scan: deze projecten zijn stilgevallen (>10 dagen geen activiteit). ` +
      `Beslis per project of health naar 'attention' moet, of er een follow-up nodig is (create_approval, category calendar/email als extern), of dat het intern kan blijven.\n\n${context}`;

    await base44.functions.invoke("chatWithGiulia", { message, source: "agent_projects", persist: false }).catch(() => null);

    return Response.json({ ok: true, stale: stale.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}