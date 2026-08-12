import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { todayStr } from "../../shared/codeAgent.ts";

/**
 * manageTasks — de ZICHTBARE task-agent van GIULIA OS.
 *
 * Geen eigen Gemini-loop (geen superagent). Werkt in twee stappen:
 *   1) Deterministisch: markeer te late taken (status -> overdue).
 *   2) EEN aanroep naar giuliaLeader (het enige brein) met een taak-gericht
 *      signaal (source: "task_agent"). De leider herprioriteert, werkt
 *      statussen/deadlines bij, deelt grote taken op, legt goedkeuringen
 *      voor externe acties vast en stelt proactieve taken voor — voor zowel
 *      Salvo's als aan Giulia gedelegeerde taken.
 *
 * Elke stap logt naar Activity → real-time zichtbaar op de taken-pagina
 * (TaskAgentRunner), in de Activity-widget en in panelen.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const t = todayStr();

    // 1) deterministisch: te late taken markeren
    const tasks = await sr.entities.Task.list().catch(() => []);
    const overdue = tasks.filter(
      (x) => x.status !== "completed" && x.status !== "done" && x.status !== "overdue" && x.deadline && x.deadline < t
    );
    await Promise.all(overdue.map((x) => sr.entities.Task.update(x.id, { status: "overdue" }).catch(() => {})));

    const open = tasks.filter((x) => x.status !== "completed" && x.status !== "done");
    const mine = open.filter((x) => !x.delegated_to_giulia);
    const giulia = open.filter((x) => x.delegated_to_giulia);

    // 2) Activity: zichtbaar dat de task-agent draait
    try {
      await base44.entities.Activity.create({
        action: "task_agent_run",
        description: `Task-agent draait · ${mine.length} eigen + ${giulia.length} Giulia-taken · ${overdue.length} te laat`,
        source: "manageTasks",
        timestamp: new Date().toISOString(),
      });
    } catch { /* ignore */ }

    // 3) EEN aanroep naar de leider — geen eigen Gemini-loop
    const context =
      `Open taken — Salvo (${mine.length}):\n` +
      mine.slice(0, 25).map((x) => `- id:${x.id} | ${x.title} | prio ${x.priority} | deadline ${x.deadline || "geen"} | ${x.status}`).join("\n") +
      `\n\nOpen taken — gedelegeerd aan Giulia (${giulia.length}):\n` +
      giulia.slice(0, 15).map((x) => `- id:${x.id} | ${x.title} | prio ${x.priority} | deadline ${x.deadline || "geen"} | ${x.status}`).join("\n");
    const signal =
      `Task-agent cyclus. Herzie ALLE open taken (zowel Salvo's als aan Giulia gedelegeerde). ` +
      `Bepaal prioriteit op belangrijkheid, urgentie, afhankelijkheden en opbrengst. ` +
      `Werk statussen en deadlines bij via update_task waar zinvol. Deel grote taken op. ` +
      `Sluit NIET automatisch taken af. ` +
      `Leg externe acties (herinneringen sturen, afspraken maken, delegeren) vast via create_approval. ` +
      `Stel maximaal 3 proactieve taken voor (create_task, assignee salvo of giulia) als er echte gaten zijn. ` +
      `Sluit af met één korte rapportage via report_to_salvo.\n\n${context}`;

    let leaderOk = false;
    let leaderErr = "";
    try {
      await base44.functions.invoke("giuliaLeader", { signal, source: "task_agent", persist: false });
      leaderOk = true;
    } catch (e) {
      leaderErr = String((e && e.message) || e);
    }

    // 4) Activity: voltooid
    try {
      await base44.entities.Activity.create({
        action: "task_agent_done",
        description: `Task-agent voltooid · leider ${leaderOk ? "ok" : "fout"}${leaderErr ? " (" + leaderErr.slice(0, 60) + ")" : ""}`,
        source: "manageTasks",
        timestamp: new Date().toISOString(),
      });
    } catch { /* ignore */ }

    return Response.json({
      ok: true,
      open: open.length,
      mine: mine.length,
      giulia: giulia.length,
      overdue: overdue.length,
      leader: leaderOk,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}