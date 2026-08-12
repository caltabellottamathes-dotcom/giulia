import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * dailyPlanning (Phase 3 — The Attention Engine).
 *
 * Vervangt statische lijsten door een dynamisch "Gravity"-systeem: elke actieve
 * taak krijgt een Gravity Score op basis van deadline-nabijheid, expliciete
 * prioriteit en project-gezondheid. De top 3 wordt de focus van de dag; de rest
 * wordt secundair. Resultaat wordt als DailyPlan opgeslagen (upsert op datum).
 *
 * Volledig deterministisch — geen LLM, geen integration credits.
 * Trigger: scheduled cron 05:00 Europe/Amsterdam (zie workflow Daily Planning)
 *          of handmatige her-aanroep.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const now = new Date();
    const todayString = now.toISOString().split("T")[0];

    // ── Step 2.1: Fetch all active entities ──────────────────────────
    const pendingTasks = await sr.entities.Task.filter({
      status: { $in: ["todo", "in_progress"] },
      delegated_to_giulia: false,
    }).catch(() => []);

    const pendingApprovals = await sr.entities.Approval.filter({
      status: "pending",
    }).catch(() => []);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayEvents = await sr.entities.CalendarEvent.filter({
      start: { $gte: todayStart.toISOString(), $lt: todayEnd.toISOString() },
    }).catch(() => []);

    // Project-gezondheid voor de dependency/context-bonus (health === "critical").
    const projects = await sr.entities.Project.list("-created_date", 200).catch(() => []);
    const healthById = new Map(projects.map((p) => [p.id, p.health]));

    // ── Step 2.2: Gravity Scoring Algorithm ─────────────────────────
    const scoredTasks = pendingTasks.map((task) => {
      let score = 0;

      // 1. Deadline-nabijheid
      if (task.deadline) {
        const hoursUntilDeadline = (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilDeadline < 0) score += 100;        // Overdue
        else if (hoursUntilDeadline <= 24) score += 60;  // Vandaag
        else if (hoursUntilDeadline <= 72) score += 30;  // Binnenkort
      }

      // 2. Expliciete prioriteit
      if (task.priority === "high") score += 40;
      else if (task.priority === "medium") score += 20;

      // 3. Dependency / Context — kritiek project geeft +20
      const health = task.project_id ? healthById.get(task.project_id) : null;
      if (health === "critical") score += 20;

      return { ...task, gravity_score: score };
    });

    scoredTasks.sort((a, b) => b.gravity_score - a.gravity_score);

    // ── Step 2.3: Generate the Daily Plan structure ─────────────────
    const topPriorities = scoredTasks.slice(0, 3);
    const secondaryTasks = scoredTasks.slice(3);

    const planData = {
      focus_items: topPriorities.map((t) => ({
        id: t.id,
        title: t.title,
        score: t.gravity_score,
      })),
      secondary_items: secondaryTasks.map((t) => ({
        id: t.id,
        title: t.title,
        energy: t.energy_level || null,
      })),
      pending_approvals_count: pendingApprovals.length,
      events_today: todayEvents.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
      })),
    };

    // ── Step 2.4: Save the DailyPlan (upsert op datum) ──────────────
    const existing = await sr.entities.DailyPlan.filter({ date: todayString }).catch(() => []);
    const isoNow = now.toISOString();
    const payload = {
      date: todayString,
      priorities: topPriorities.map((t) => t.id),
      plan_data: planData,
      status: "active",
      last_updated: isoNow,
      agent_source: "dailyPlanning_engine",
    };

    let saved = null;
    if (existing.length) {
      saved = await sr.entities.DailyPlan.update(existing[0].id, payload).catch(() => null);
    } else {
      saved = await sr.entities.DailyPlan.create(payload).catch(() => null);
    }

    return Response.json({
      ok: true,
      date: todayString,
      focus_count: topPriorities.length,
      secondary_count: secondaryTasks.length,
      pending_approvals: pendingApprovals.length,
      events_today: todayEvents.length,
      plan_id: saved?.id || null,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}