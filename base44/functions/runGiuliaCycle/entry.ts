import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * runGiuliaCycle — de ENIGE manier waarop achtergrondagents nog draaien.
 * Wordt handmatig geactiveerd (knop in het Agenten-onderdeelpaneel).
 *   1) sync alle bronnen (Gmail / Calendar / Drive) in parallel
 *   2) laat elke agent zijn werk doen met de verse gegevens (parallel)
 *   3) log één Activity-regel voor de cyclus
 * Daarna wachten alle agents weer tot de volgende handmatige cyclus.
 */

// Email loopt uitsluitend via de IMAP-bridge (fetchPrivateEmails) — geen Gmail-API sync meer.
const SYNC = ["syncEmails", "syncCalendar", "syncDrive"];

const AGENTS = [
  "interpretInput", "manageCommunication", "manageTasks", "manageProjects",
  "managePeople", "manageIdeas", "manageFiles", "dailyPlanning", "weeklyPlanning",
  "weekReview", "morningBriefing", "eveningFollowUp", "runProactivity",
  "checkProactivity", "chatGatekeeper", "autoDraftWhatsApp",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runOne(base44, name) {
  try {
    await base44.functions.invoke(name, {});
    return { name, ok: true };
  } catch (e) {
    return { name, ok: false, error: String((e && e.message) || e) };
  }
}

// Sequentieel met pauze i.p.v. Promise.all — houdt het totaal aantal Gemini-
// aanroepen ruim onder de 15-20 RPM-limiet, ook als elke agent zelf meerdere
// Gemini-stappen doet.
async function runSequential(base44, names, delayMs = 4000) {
  const results = [];
  for (const n of names) {
    results.push(await runOne(base44, n));
    await sleep(delayMs);
  }
  return results;
}

/**
 * cleanupApprovals — voorkomt dat Salvo 1000× dezelfde goedkeuring ziet.
 * 1) stale: pending > 24u → "already_done" (dingen die allang afgehandeld zijn).
 * 2) duplicaten: gelijke genormaliseerde titel → houd de nieuwste, rest "already_done".
 * 3) cap: max 8 pending tegelijk → oudste overschot "already_done".
 */
// Normaliseert een titel: kleine letters, leestekens eruit, korte woorden EN
// veelvoorkomende actiewerkwoorden (verzenden/versturen/opvolgen/bespreken…)
// weg — zodat "Verstuur Kredietbank machtiging", "Kredietbank: Machtiging
// versturen" en "Verzenden Kredietbank machtiging" allemaal op dezelfde sleutel
// "kredietbank machtiging" uitkomen en als duplicaat worden herkend.
const ACTION_VERBS = new Set([
  "verzenden", "verzend", "versturen", "verstuur", "sturen", "stuur",
  "opvolgen", "opvolg", "bespreken", "bespreek", "opstellen", "aanmaken",
  "afhandelen", "afhandeld", "reviewen", "review", "versturen", "verzenden",
]);
function normTitle(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/).filter((w) => w.length > 2 && !ACTION_VERBS.has(w)).sort().join(" ");
}
async function cleanupApprovals(sr) {
  const all = await sr.entities.Approval.list("-created_date", 300).catch(() => []);
  const pending = all.filter((a) => a.status === "pending");
  if (!pending.length) return { resolved: 0 };
  const handled = all.filter((a) => ["executed", "approved", "already_done", "discarded"].includes(a.status));
  const handledKeys = new Set(
    handled.map((a) => (a.action_type || "") + "|" + normTitle(a.title)).filter((k) => !k.endsWith("|"))
  );
  const now = Date.now();
  const toResolve = new Set();
  // stale > 24u
  pending.forEach((a) => {
    if (a.created_date && now - new Date(a.created_date).getTime() > 24 * 3600 * 1000) toResolve.add(a.id);
  });
  // duplicaten + reeds-afgehandeld: per (action_type + genormaliseerde titel)
  const byKey = {};
  pending.forEach((a) => {
    const k = (a.action_type || "") + "|" + normTitle(a.title);
    if (k.endsWith("|")) return;
    (byKey[k] = byKey[k] || []).push(a);
  });
  Object.entries(byKey).forEach(([key, g]) => {
    // al afgehandeld in het verleden → alle pending van deze sleutel weg
    if (handledKeys.has(key)) { g.forEach((a) => toResolve.add(a.id)); return; }
    if (g.length <= 1) return;
    g.sort((x, y) => new Date(y.created_date || 0) - new Date(x.created_date || 0));
    g.slice(1).forEach((a) => toResolve.add(a.id)); // houd nieuwste
  });
  // cap op 8
  const remaining = pending.filter((a) => !toResolve.has(a.id))
    .sort((x, y) => new Date(x.created_date || 0) - new Date(y.created_date || 0));
  if (remaining.length > 8) remaining.slice(0, remaining.length - 8).forEach((a) => toResolve.add(a.id));
  const ids = [...toResolve];
  if (ids.length) await sr.entities.Approval.bulkUpdate(ids.map((id) => ({ id, status: "already_done" }))).catch(() => null);
  return { resolved: ids.length };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // 1) synchroniseer alle bronnen — sequentieel, met pauze tussen elke call
    const syncResults = await runSequential(base44, SYNC);

    // 2) elke agent doet zijn werk met de verse data — sequentieel, met pauze
    const agentResults = await runSequential(base44, AGENTS);

    const okAgents = agentResults.filter((r) => r.ok).length;
    const okSync = syncResults.filter((r) => r.ok).length;

    // 3) ruim duplicaat- en verlopen goedkeuringen op — Salvo ziet niet 1000× hetzelfde.
    const approvalCleanup = await cleanupApprovals(base44.asServiceRole);

    try {
      await base44.entities.Activity.create({
        action: "giulia_cycle",
        description: `Cyclus voltooid · ${okSync}/${SYNC.length} sync · ${okAgents}/${AGENTS.length} agenten · ${approvalCleanup.resolved} goedkeuringen auto-afgehandeld`,
        source: "runGiuliaCycle",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return Response.json({
      ok: true,
      sync: syncResults,
      agents: agentResults,
      approvalCleanup,
      summary: { sync: `${okSync}/${SYNC.length}`, agents: `${okAgents}/${AGENTS.length}`, approvalsResolved: approvalCleanup.resolved },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}