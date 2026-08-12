import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * startGiulia — de echte opstart-procedure van GIULIA OS.
 *
 * Bij app-load (en via de Agenten-widget):
 *   1) sync alle bronnen (Gmail / Calendar / Drive) in parallel
 *   2) giuliaLeader — DE enige agent die Gemini aanroept — krijgt een
 *      "startup"-signaal: hij interpreteert EEN keer, leest elk domein in
 *      (os_query) en legt eventuele aandacht vast als Approval / taak /
 *      Activity. De uitvoering is INTERN, ZONDER opnieuw Gemini aan te roepen.
 *   3) Eén Activity-regel → na kort laden zichtbaar in het hele OS app.
 *
 * Hiermee "begint" elke agent-domein en zijn alle updates real-time zichtbaar.
 */
const SYNC = ["syncGmail", "syncCalendar", "syncDrive"];

async function runOne(base44, name, payload) {
  try {
    await base44.functions.invoke(name, payload || {});
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

    // 1) synchroniseer alle bronnen (parallel, faalt zacht)
    const syncResults = await Promise.all(SYNC.map((n) => runOne(base44, n)));
    const okSync = syncResults.filter((r) => r.ok).length;

    // 2) de leider — EEN Gemini-aanroep — initialiseert elk domein intern
    const today = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    const startupSignal =
      `Opstartprocedure GIULIA OS — ${today}. ` +
      `Lees met os_query achtereenvolgens: tasks, events, approvals, emails, projects, contacts, activity, whatsapp, notes, ideas. ` +
      `Dat initialiseert elk domein zodat elke agent 'begint'. ` +
      `Bepaal daarna wat NU aandacht verdient (te late taken, open goedkeuringen, ongelezen mail, wachtende threads). ` +
      `Leg concrete acties vast via create_task (assignee salvo of giulia) en create_approval voor externe acties — maar stuur niets zelf. ` +
      `Sluit af met één korte start-samenvatting aan Salvo (report_to_salvo) over de staat van het OS.`;

    const leader = await runOne(base44, "giuliaLeader", { signal: startupSignal, source: "startup", persist: true });

    // 3) Task-agent — de zichtbare agent die alle taken laat lopen (Salvo's +
    //    Giulia's). Geen eigen Gemini-loop: delegeert naar de leider.
    const taskAgent = await runOne(base44, "manageTasks", {});

    // 4) Activity-log → zichtbaar in widgets & panelen
    try {
      await base44.entities.Activity.create({
        action: "start_giulia",
        description: `Opstart voltooid · sync ${okSync}/${SYNC.length} · leider ${leader.ok ? "actief" : "fout"} · task-agent ${taskAgent.ok ? "actief" : "fout"}`,
        source: "startGiulia",
        timestamp: new Date().toISOString(),
      });
    } catch { /* ignore */ }

    return Response.json({
      ok: true,
      sync: syncResults,
      leader,
      taskAgent,
      summary: {
        sync: `${okSync}/${SYNC.length}`,
        leader: leader.ok ? "active" : "error",
        taskAgent: taskAgent.ok ? "active" : "error",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}