import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { giuliaCompose } from '../../shared/giulia.ts';

/**
 * proactiveBubble — bepaalt op basis van de live staat wat Giulia nu zou
 * zeggen, met context (specifieke taken/afspraken/aantallen). Als het een
 * moment is waarop Giulia "tijd heeft", zet hij ook écht een voorbereidende
 * actie in gang (runProactivity / triageEmails / compileBriefing /
 * eveningFollowUp). Per trigger maximaal één keer per 20 min uitgevoerd,
 * zodat het nooit spamt.
 */
const THROTTLE_MS = 20 * 60 * 1000;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const sr = base44.asServiceRole;
    const now = new Date();
    const todayStr = now.toLocaleDateString("sv-SE");

    const [tasks, events, approvals, threads, emails] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.CalendarEvent.list().catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.Thread.filter({ status: "open" }).catch(() => []),
      sr.entities.Email.filter({ status: "unread" }).catch(() => []),
    ]);

    const overdue = tasks.filter((t) =>
      t.status === "overdue" || (t.deadline && t.deadline < todayStr && t.status !== "completed"));
    const todayEvents = events
      .filter((e) => (e.start || "").slice(0, 10) === todayStr)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    const soon = todayEvents.find((e) => {
      const d = new Date(e.start).getTime() - now.getTime();
      return d > 0 && d < 90 * 60000;
    });
    const stale = threads.filter((t) => t.needs_info);
    const unread = emails.length;
    const hour = now.getHours();

    let trigger, baseContext, actionFn = null, actionLabel = null, templated;
    if (overdue.length) {
      trigger = "overdue";
      baseContext = `Te late taken (${overdue.length}): ${overdue.slice(0, 3).map((t) => t.title).join(", ")}.`;
      templated = `Je hebt ${overdue.length} te late taak${overdue.length > 1 ? "en" : ""}. Ik schuif laag-prioritaire taken door om je focus te beschermen.`;
      actionFn = "runProactivity"; actionLabel = "Plan herschikt";
    } else if (soon) {
      trigger = "soon_event";
      const t = new Date(soon.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
      const mins = Math.max(1, Math.round((new Date(soon.start).getTime() - now.getTime()) / 60000));
      baseContext = `Aankomende afspraak: "${soon.title}" om ${t}, over ${mins} minuten.`;
      templated = `Over ${mins} minuten begint "${soon.title}". Ik leg de briefing klaar.`;
      actionFn = "compileBriefing"; actionLabel = "Briefing klaargelegd";
    } else if (unread >= 5) {
      trigger = "prep_inbox";
      baseContext = `Ongelezen mails: ${unread}. Geen te late taken — rustig moment.`;
      templated = `Rustig genoeg. Ik ga alvast je inbox voorbereiden en antwoorden schetsen.`;
      actionFn = "triageEmails"; actionLabel = "Inbox voorbereid";
    } else if (approvals.length) {
      trigger = "approvals";
      baseContext = `Openstaande goedkeuringen (${approvals.length}): ${approvals.slice(0, 3).map((a) => a.title).join(", ")}.`;
      templated = `Er wachten ${approvals.length} goedkeuring${approvals.length > 1 ? "en" : ""} op je. Ik voer niks uit zonder jouw afteken.`;
    } else if (stale.length) {
      trigger = "stale_threads";
      baseContext = `Threads die wachten op info: ${stale.slice(0, 3).map((t) => t.title).join(", ")}.`;
      templated = `Een paar openstaande threads wachten al dagen op info. Ik stel follow-ups voor.`;
      actionFn = "runProactivity"; actionLabel = "Follow-ups voorgesteld";
    } else if (hour >= 15) {
      trigger = "evening_prep";
      baseContext = `Het is ${hour}:00. Geen dringende zaken meer.`;
      templated = `Bijna einde van je dag. Ik bereid de avond alvast voor.`;
      actionFn = "eveningFollowUp"; actionLabel = "Avond voorbereid";
    } else {
      trigger = "quiet";
      baseContext = `Rustig moment — geen te late taken, geen afspraken nu, ${unread} ongelezen mails.`;
      templated = `Rustig moment. Ik gebruik het om op de achtergrond je inbox voor te sorteren.`;
      actionFn = "triageEmails"; actionLabel = "Inbox voorbereid";
    }

    // throttle per trigger — voorkom herhaling binnen 20 min
    let willRun = false;
    let lastStateId = null;
    if (actionFn) {
      const existing = await sr.entities.SyncState.filter({ source: `proactive_${trigger}` }).catch(() => []);
      const last = existing[0];
      const within = last && last.last_sync && (now.getTime() - new Date(last.last_sync).getTime()) < THROTTLE_MS;
      willRun = !within;
      lastStateId = last ? last.id : null;
    }

    let actionNote;
    if (willRun) {
      actionNote = "Giulia voert nu ook uit: " + actionLabel + ".";
    } else if (actionFn) {
      actionNote = "Giulia heeft dit recent al uitgevoerd (" + actionLabel + "); stelt het nu niet opnieuw uit.";
    } else {
      actionNote = "Giulia voert geen actie uit, alleen een seintje.";
    }
    const context = baseContext + "\n" + actionNote;

    let line = await giuliaCompose(
      base44,
      "Schrijf een korte proactieve check-in op basis van de context. Eén tot twee zinnen, concreet, Nederlands. Spreek Salvo direct aan. Vermeld specifieke namen of tijden waar relevant. Geen opsommingstekens.",
      context
    ).catch(() => null);
    if (!line) line = templated;

    let actionDone = false;
    if (willRun && actionFn) {
      try {
        await base44.functions.invoke(actionFn, {});
        actionDone = true;
        const patch = { last_sync: now.toISOString(), status: "success" };
        if (lastStateId) await sr.entities.SyncState.update(lastStateId, patch).catch(() => {});
        else await sr.entities.SyncState.create({ source: `proactive_${trigger}`, ...patch }).catch(() => {});
      } catch { /* ignore */ }
    }

    return Response.json({
      ok: true,
      line,
      actionLabel: willRun ? actionLabel : null,
      actionDone,
      trigger,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}