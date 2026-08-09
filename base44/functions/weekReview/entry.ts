import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo } from "../../shared/agent.ts";

/**
 * weekReview — end of week: analyzes what was finished, not finished, shifted,
 * projects needing attention, recurring tasks, appointments, open commitments,
 * and stuck processes. Produces analysis + input for the new week plan.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [tasks, projects, events, weeklyPlans] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
      sr.entities.Event.list().catch(() => []),
      sr.entities.WeeklyPlan.list().catch(() => []),
    ]);

    const done = tasks.filter((t) => t.status === "completed" || t.status === "done");
    const open = tasks.filter((t) => t.status !== "completed" && t.status !== "done");

    const context = [
      `Voltooid: ${done.map((t) => t.title).join(", ") || "geen"}`,
      `Niet voltooid: ${open.slice(0, 20).map((t) => t.title).join(", ") || "geen"}`,
      `Projecten: ${projects.map((p) => `${p.title} [${p.health || "?"}]`).join(", ")}`,
      `Afspraken: ${events.length}`,
      `Weekplannen: ${weeklyPlans.length}`,
    ].join("\n");

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        summary: { type: "string" },
        carried_over: { type: "array", items: { type: "string" } },
        next_week_focus: { type: "array", items: { type: "string" } },
      },
      required: ["message", "summary"],
    };

    const decision = await agentDecide(
      base44, "weekReview",
      "Analyseer: wat afgerond, niet afgerond, verschoven, projecten met aandacht, terugkerende taken, open commitments, vastlopers. Maak een analyse en input voor de nieuwe weekplanning.",
      context, schema
    );

    await reportToSalvo(base44, "weekReview", decision?.message || decision?.summary || "");

    return Response.json({ ok: true, summary: decision?.summary, carried_over: decision?.carried_over || [], next_week_focus: decision?.next_week_focus || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}