import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * runGiuliaCycle — de ENIGE manier waarop achtergrondagents nog draaien.
 * Wordt handmatig geactiveerd (knop in het Agenten-onderdeelpaneel).
 *   1) sync alle bronnen (Gmail / Calendar / Drive) in parallel
 *   2) laat elke agent zijn werk doen met de verse gegevens (parallel)
 *   3) log één Activity-regel voor de cyclus
 * Daarna wachten alle agents weer tot de volgende handmatige cyclus.
 */

const SYNC = ["syncGmail", "syncCalendar", "syncDrive"];

const AGENTS = [
  "interpretInput", "manageCommunication", "manageTasks", "manageProjects",
  "managePeople", "manageIdeas", "manageFiles", "dailyPlanning", "weeklyPlanning",
  "weekReview", "morningBriefing", "eveningFollowUp", "runProactivity",
  "checkProactivity", "chatGatekeeper", "autoDraftWhatsApp",
];

async function runOne(base44, name) {
  try {
    await base44.functions.invoke(name, {});
    return { name, ok: true };
  } catch (e) {
    return { name, ok: false, error: String((e && e.message) || e) };
  }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // 1) synchroniseer alle bronnen
    const syncResults = await Promise.all(SYNC.map((n) => runOne(base44, n)));

    // 2) elke agent doet zijn werk met de verse data
    const agentResults = await Promise.all(AGENTS.map((n) => runOne(base44, n)));

    const okAgents = agentResults.filter((r) => r.ok).length;
    const okSync = syncResults.filter((r) => r.ok).length;

    try {
      await base44.entities.Activity.create({
        action: "giulia_cycle",
        description: `Cyclus voltooid · ${okSync}/${SYNC.length} sync · ${okAgents}/${AGENTS.length} agenten`,
        source: "runGiuliaCycle",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return Response.json({
      ok: true,
      sync: syncResults,
      agents: agentResults,
      summary: { sync: `${okSync}/${SYNC.length}`, agents: `${okAgents}/${AGENTS.length}` },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}