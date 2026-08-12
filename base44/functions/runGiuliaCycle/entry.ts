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
const SYNC = ["syncCalendar", "syncDrive"];

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