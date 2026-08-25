import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { giuliaCompose } from '../../shared/giulia.ts';

/**
 * proactiveBubble — bepaalt op basis van de live staat wat Giulia nu zou
 * zeggen, met context (specifieke taken/afspraken/aantallen). Als het een
 * moment is waarop Giulia "tijd heeft", zet hij ook écht een voorbereidende
 * actie in gang (runProactivity / triageEmails / compileBriefing /
 * eveningFollowUp). Per trigger maximaal één keer per 20 min uitgevoerd,
 * zodat het nooit spamt.
 *
 * Variatie: elke check-in wordt frans geformuleerd — geen standaard-riedeltje,
 * elke keer een andere invalshoek/toon/openingswoord. Recente bubbel-regels
 * worden meegegeven om herhaling te vermijden.
 */
const THROTTLE_MS = 20 * 60 * 1000;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TEMPLATES = {
  overdue: (n) => [
    `${n} taak${n > 1 ? "en" : ""} lopen achter. Ik houd de lagere prio's op afstand zodat jij de deadline haalt.`,
    `De klok tikt door op ${n} taak${n > 1 ? "en" : ""}. Zal ik vanavond even herschikken?`,
    `Nog ${n} die roepen. Zeg het maar als ik iets voor je verschuif.`,
  ],
  soon_event: (mins, title) => [
    `Over ${mins} min begint "${title}" — briefing ligt klaar.`,
    `"${title}" staat voor de deur, ${mins} min nog. Klaar?`,
    `Nog ${mins} min tot "${title}". Ik heb de context al gepakt.`,
  ],
  prep_inbox: () => [
    `Rustig moment — ik ga alvast door je inbox om antwoorden te schetsen.`,
    `Even ruimte. Ik bereid je inbox voor, dan kun je straks snel door.`,
    `Ik gebruik de rust om je mail op orde te zetten.`,
  ],
  approvals: (n) => [
    `${n} goedkeuring${n > 1 ? "en" : ""} wachten op jou. Ik voer niets uit zonder je ja.`,
    `Er liggen ${n} dingen te wachten op je afteken.`,
    `${n} keuzes staan klaar — pas als jij ze aftekent, gebeurt er iets.`,
  ],
  stale_threads: () => [
    `Een paar threads wachten al dagen op info. Zal ik follow-ups voorstellen?`,
    `Nog steeds open: een paar threads die op input wachten. Ik kan herinneringen opstellen.`,
    `Er liggen threads stil — wil je dat ik ze weer levend maak?`,
  ],
  evening_prep: () => [
    `Bijna einde dag. Ik bereid de avond alvast voor.`,
    `Rustig aan toe. Ik zet alvast de avond klaar.`,
    `Het kalmeert — ik gebruik het om vanavond voor te bereiden.`,
  ],
  quiet: () => [
    `Rustig moment. Ik sorteer op de achtergrond je inbox voor.`,
    `Even niets dringends. Ik gebruik de tijd om op te ruimen.`,
    `Stilte — ideaal om achter de schermen je inbox voor te sorteren.`,
  ],
};

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
      templated = pick(TEMPLATES.overdue(overdue.length));
      actionFn = "runProactivity"; actionLabel = "Plan herschikt";
    } else if (soon) {
      trigger = "soon_event";
      const t = new Date(soon.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
      const mins = Math.max(1, Math.round((new Date(soon.start).getTime() - now.getTime()) / 60000));
      baseContext = `Aankomende afspraak: "${soon.title}" om ${t}, over ${mins} minuten.`;
      templated = pick(TEMPLATES.soon_event(mins, soon.title));
      actionFn = "compileBriefing"; actionLabel = "Briefing klaargelegd";
    } else if (unread >= 5) {
      trigger = "prep_inbox";
      baseContext = `Ongelezen mails: ${unread}. Geen te late taken — rustig moment.`;
      templated = pick(TEMPLATES.prep_inbox());
      // geen automatische inbox-triage meer — alleen op expliciet verzoek
    } else if (approvals.length) {
      trigger = "approvals";
      baseContext = `Openstaande goedkeuringen (${approvals.length}): ${approvals.slice(0, 3).map((a) => a.title).join(", ")}.`;
      templated = pick(TEMPLATES.approvals(approvals.length));
    } else if (stale.length) {
      trigger = "stale_threads";
      baseContext = `Threads die wachten op info: ${stale.slice(0, 3).map((t) => t.title).join(", ")}.`;
      templated = pick(TEMPLATES.stale_threads());
      actionFn = "runProactivity"; actionLabel = "Follow-ups voorgesteld";
    } else if (hour >= 15) {
      trigger = "evening_prep";
      baseContext = `Het is ${hour}:00. Geen dringende zaken meer.`;
      templated = pick(TEMPLATES.evening_prep());
      actionFn = "eveningFollowUp"; actionLabel = "Avond voorbereid";
    } else {
      trigger = "quiet";
      baseContext = `Rustig moment — geen te late taken, geen afspraken nu, ${unread} ongelezen mails.`;
      templated = pick(TEMPLATES.quiet());
      // geen automatische inbox-triage meer — alleen op expliciet verzoek
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

    // Recente bubbel-regels ophalen → vermijd herhaling van zinsbouw/opening.
    const recentActs = await sr.entities.Activity.filter({ source: "proactiveBubble" }, "-created_date", 6).catch(() => []);
    const recentLines = (recentActs || []).map((a) => String(a.description || "").trim()).filter(Boolean).slice(0, 6);
    const recentBlock = recentLines.length
      ? `\n\nRECENTE BUBBELS (herhaal NIET deze zinsbouw of openingswoorden, varieer sterk):\n${recentLines.map((l) => "- " + l).join("\n")}`
      : "";

    const instruction =
      `Schrijf een korte proactieve check-in op basis van de context. Eén tot twee zinnen, concreet, Nederlands, direct tot Salvo. Vermeld specifieke namen of tijden waar relevant. Geen opsommingstekens, geen standaard-riedeltje.` +
      ` Begin NOOIT met "Je hebt", "Er wachten", "Rustig moment" of soortgelijke formules. Kies elke keer een andere invalshoek, toon en openingswoord — soms een vraag, soms een observatie, soms een droge one-liner, soms warm, soms speels.` +
      recentBlock;

    let line = await giuliaCompose(base44, instruction, context).catch(() => null);
    if (!line) line = templated;

    // Bewaar deze regel voor toekomstige variatie-controle.
    await sr.entities.Activity.create({
      action: "proactive_bubble",
      description: String(line).slice(0, 280),
      source: "proactiveBubble",
      timestamp: now.toISOString(),
    }).catch(() => null);

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