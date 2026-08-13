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
// Email loopt uitsluitend via de IMAP-bridge (fetchPrivateEmails) — geen Gmail-API sync meer.
const SYNC = ["syncCalendar", "syncDrive"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runOne(base44, name, payload) {
  try {
    await base44.functions.invoke(name, payload || {});
    return { name, ok: true };
  } catch (e) {
    return { name, ok: false, error: String((e && e.message) || e) };
  }
}

// Sequentieel met pauze — blijft ruim onder de Gemini RPM-limiet.
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

    // 1) synchroniseer alle bronnen — sequentieel, faalt zacht
    const syncResults = await runSequential(base44, SYNC);
    const okSync = syncResults.filter((r) => r.ok).length;

    // 2) deterministisch StartupContext bouwen (geen Gemini) — dan ÉÉN keer
    //    naar GIULIA-CONNECT, die context laadt en GIULIA-GIULIA laat beslissen.
    const today = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    const sr = base44.asServiceRole;
    const todayIso = new Date().toISOString().slice(0, 10);
    const [openTasks, unreadEmails, pendingApprovals, projects] = await Promise.all([
      sr.entities.Task.filter({}, "-created_date", 200).catch(() => []),
      sr.entities.Email.filter({ status: "unread" }).catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.Project.list("-created_date", 100).catch(() => []),
    ]);
    const overdue = openTasks.filter((t) => t.status !== "completed" && t.deadline && t.deadline < todayIso);
    const activeProjects = projects.filter((p) => ["planning", "in_progress"].includes(p.status));
    const startupMessage =
      `Opstartprocedure GIULIA OS — ${today}. Status: ${overdue.length} te late taken, ${unreadEmails.length} ongelezen mails, ` +
      `${pendingApprovals.length} openstaande goedkeuringen, ${activeProjects.length} actieve projecten. ` +
      `Bepaal wat nu aandacht verdient. Maak maximaal 3 nieuwe taken aan als er echte gaten zijn, rond simpele administratieve taken zelf af, ` +
      `en leg externe acties vast als approval. Sluit af met één korte start-samenvatting.`;

    const leader = await runOne(base44, "chatWithGiulia", { message: startupMessage, source: "startup", persist: false });

    // 3) Task-agent — de zichtbare agent die alle taken laat lopen (Salvo's +
    //    Giulia's) en proactief aanmaakt/toewijst. Geen eigen Gemini-loop:
    //    delegeert naar de leider. (runProactivity draait op zijn eigen
    //    ingeplande workflow — niet synchroon hier, anders rate-limit op free tier.)
    await sleep(4000);
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