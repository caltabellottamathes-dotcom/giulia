import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiDecide, GIULIA_PERSONA } from '../../shared/gemini.ts';

/**
 * runProactivity (Phase 4 — Dynamic Replanning / "the living schedule").
 *
 * Controleert de werkelijkheid tegen de planning. Lopen de focus-taken van
 * vandaag nog (todo/in_progress) terwijl het later op de dag is? Dan zijn we
 * off-track. Om kern-deadlines te beschermen worden laag-prioritaire taken
 * (priority=low, status=todo, geen directe deadline) +2 dagen verschoven.
 * Per verschuiving wordt een Insight ("Plan Recalibrated") aangemaakt.
 *
 * Daarna (Step 2.5): achtergrond-scan op dead-ends — open threads die al >3
 * dagen op info wachten → er wordt een Approval voorgesteld om een follow-up
 * te sturen.
 *
 * Volledig deterministisch — geen LLM, geen integration credits.
 * Trigger: scheduled cron 12:00 & 16:00 Europe/Amsterdam (zie workflow),
 *          of handmatig / bij een gemiste deep-work taak.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const now = new Date();
    const todayString = now.toISOString().split("T")[0];

    // ── Step 2.1: Assess current state ───────────────────────────────
    const dailyPlans = await sr.entities.DailyPlan.filter({ date: todayString }).catch(() => []);
    if (!dailyPlans || dailyPlans.length === 0) {
      return Response.json({ ok: true, skipped: "no_plan_for_today" });
    }
    const todaysPlan = dailyPlans[0];
    const priorityTaskIds = Array.isArray(todaysPlan.priorities) ? todaysPlan.priorities : [];

    // ── Step 2.2: Detect plan failure ────────────────────────────────
    let planIsOffTrack = false;
    const stalledPriorityTasks = [];

    for (const taskId of priorityTaskIds) {
      const task = await sr.entities.Task.get(taskId).catch(() => null);
      if (!task) continue;
      if (task.status === "todo" || task.status === "in_progress") {
        stalledPriorityTasks.push(task);
      }
    }

    // "Laat op de dag" guard — alleen verschuiven als het >= 12:00 is,
    // zodat een vroege handmatige run niet onnodig herschikt.
    const lateInDay = now.getHours() >= 12;
    if (lateInDay && stalledPriorityTasks.length > 0) {
      planIsOffTrack = true;
    }

    // ── Step 2.3 + 2.4: Recalibration (the shift) + notify ───────────
    let shiftedTasksCount = 0;

    if (planIsOffTrack) {
      // Non-critical: low priority, open, geen directe deadline (>24u of geen).
      const nonCriticalTasks = await sr.entities.Task.filter({
        status: "todo",
        priority: "low",
      }).catch(() => []);

      const dayMs = 24 * 60 * 60 * 1000;
      const shiftDate = (deadline) => {
        const base = deadline ? new Date(deadline) : new Date(now.getTime() + 2 * dayMs);
        return new Date(base.getTime() + 2 * dayMs).toISOString().split("T")[0];
      };

      for (const task of nonCriticalTasks) {
        // Bescherm directe deadlines — alleen verschuiven als geen deadline
        // óf deadline ligt verder dan 24u in de toekomst.
        const hasImmediateDeadline =
          task.deadline && (now.getTime() - new Date(task.deadline).getTime()) / dayMs < 1 &&
          new Date(task.deadline).getTime() > now.getTime() - dayMs &&
          new Date(task.deadline).getTime() <= now.getTime() + dayMs;

        if (hasImmediateDeadline) continue;

        await sr.entities.Task.update(task.id, {
          deadline: shiftDate(task.deadline),
        }).catch(() => null);
        shiftedTasksCount++;
      }

      if (shiftedTasksCount > 0) {
        await sr.entities.Insight.create({
          title: "Plan Recalibrated",
          content: `Ik merk dat de focus-taken langer duren. Ik heb automatisch ${shiftedTasksCount} laag-prioritaire taken naar later deze week verschoven om je focus te beschermen.`,
          category: "Suggestion",
          status: "new",
          confidence: 90,
          source: "runProactivity",
        }).catch(() => null);
      }
    }

    // ── Step 2.5: Background automation checks (dead-ends) ──────────
    const openThreads = await sr.entities.Thread.filter({
      status: "open",
      needs_info: true,
    }).catch(() => []);

    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const deadEndThreads = openThreads.filter((th) => {
      if (!th.last_message_date) return true; // geen activiteit ooit → dead-end
      return now.getTime() - new Date(th.last_message_date).getTime() > threeDaysMs;
    });

    let followUpsProposed = 0;
    for (const th of deadEndThreads.slice(0, 5)) {
      const threadType = (th.type || "").toLowerCase();
      const approvalType = ["email", "whatsapp", "calendar", "task", "file"].includes(threadType)
        ? threadType
        : "other";
      const approvalCategory = ["email", "whatsapp", "calendar", "tasks", "projects", "documents"].includes(threadType)
        ? threadType === "tasks" ? "tasks" : threadType
        : "other";

      await sr.entities.Approval.create({
        title: `Follow-up: ${th.title || "openstaande thread"}`,
        action_type: "send_followup",
        description: `Deze thread wacht al >3 dagen op een reactie. Giulia stelt voor een herinnering/follow-up te sturen.`,
        status: "pending",
        category: approvalCategory,
        type: approvalType,
        thread_id: th.id,
        agent_source: "runProactivity",
        assignee: "salvo",
      }).catch(() => null);
      followUpsProposed++;
    }

    // ── Step 3.1: Project Radar (stall detection) ─────────────────────
    const radar = await runProjectRadar(sr, now);

    // ── Step 3.2: Dependency unblocking ───────────────────────────────
    const unblocked = await unblockDependencies(sr);

    return Response.json({
      ok: true,
      date: todayString,
      off_track: planIsOffTrack,
      stalled_priorities: stalledPriorityTasks.length,
      shifted_tasks: shiftedTasksCount,
      followups_proposed: followUpsProposed,
      project_radar: radar,
      dependencies_unblocked: unblocked,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ── Phase 7 · Step 3.1: Project Radar — stall detection ─────────────────
// Scant actieve projects (in_progress/planning). Bij > STAGNANT_DAYS dagen
// zonder last_activity_date: health → "attention", Risk Insight, en een
// Gemini-gedraftete follow-up → Gatekeeper (ENKEL gemini-3.1-flash-lite).
async function runProjectRadar(sr, now) {
  const STAGNANT_DAYS = 11;
  const dayMs = 24 * 60 * 60 * 1000;
  const projects = await sr.entities.Project.list("-created_date", 200).catch(() => []);
  const active = projects.filter((p) => ["in_progress", "planning"].includes(p.status));
  let flagged = 0;
  let drafts = 0;
  for (const p of active) {
    const last = p.last_activity_date ? new Date(p.last_activity_date) : null;
    const stale = !last || (now.getTime() - last.getTime()) >= STAGNANT_DAYS * dayMs;
    if (!stale) continue;
    if (p.health !== "attention") {
      await sr.entities.Project.update(p.id, { health: "attention" }).catch(() => null);
    }
    await sr.entities.Insight.create({
      title: `Project inactive: ${p.title}`,
      content: `Je hebt ${STAGNANT_DAYS} dagen niets aan dit project gedaan. Wacht je op iemand? Of is er simpelweg geen volgende actie gedefinieerd?`,
      category: "Risk",
      status: "new",
      confidence: 0.7,
      source: "runProactivity · Project Radar",
      project_id: p.id,
    }).catch(() => null);
    flagged++;
    const draft = await geminiDecide({
      model: "gemini-3.1-flash-lite",
      prompt: `Project "${p.title}" is al ${STAGNANT_DAYS} dagen inactief. Schrijf een korte, professionele Nederlandse follow-up e-mail (max 120 woorden) aan de betrokken contactpersoon om te vragen wat de volgende stap is. Geef alleen de e-mailbody terug in JSON {body: string}.`,
      schema: { type: "object", properties: { body: { type: "string" } }, required: ["body"] },
      systemText: GIULIA_PERSONA,
      temperature: 0.5,
    });
    if (draft && draft.body) {
      await sr.entities.Approval.create({
        title: `Follow-up: ${p.title}`,
        action_type: "send_followup",
        description: `Project Radar: ${STAGNANT_DAYS} dagen geen activiteit. Giulia stelt een follow-up voor.`,
        content: draft.body,
        status: "pending",
        category: "email",
        type: "email",
        project_id: p.id,
        agent_source: "runProactivity · Project Radar",
        assignee: "salvo",
      }).catch(() => null);
      drafts++;
    }
  }
  return { flagged, drafts };
}

// ── Phase 7 · Step 3.2: Dependency unblocking ───────────────────────────
// Taken met status "waiting" wiens parent_task voltooid is → activeer naar
// "todo" + Opportunity Insight. Idempotent: eenmaal ontgrendeld zijn ze niet
// langer "waiting", dus geen duplicaten bij volgende runs.
async function unblockDependencies(sr) {
  const waiting = await sr.entities.Task.filter({ status: "waiting" }, "-created_date", 200).catch(() => []);
  let count = 0;
  for (const w of waiting) {
    if (!w.parent_task_id) continue;
    const parent = await sr.entities.Task.get(w.parent_task_id).catch(() => null);
    if (!parent || parent.status !== "completed") continue;
    await sr.entities.Task.update(w.id, { status: "todo" }).catch(() => null);
    await sr.entities.Insight.create({
      title: "Vervolgtaak geactiveerd",
      content: `Omdat '${parent.title}' klaar is, kan '${w.title}' nu starten. Ik heb de vervolgtaak geactiveerd.`,
      category: "Opportunity",
      status: "new",
      confidence: 0.8,
      source: "runProactivity · Dependency Unblock",
      project_id: w.project_id || undefined,
    }).catch(() => null);
    count++;
  }
  return count;
}