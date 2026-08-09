import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo } from "../../shared/agent.ts";

/**
 * weeklyPlanning — each week builds a realistic week plan into WeeklyPlan.
 * Distributes tasks across days accounting for time, energy, deadlines,
 * context, location, appointments, focus need and task size. Dynamic: replants
 * on delay.
 */
function mondayStr() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toLocaleDateString("sv-SE");
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const ws = mondayStr();

    const [tasks, events, projects, approvals] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.Event.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
    ]);

    const context = [
      `Week start: ${ws}`,
      `Taken: ${tasks.length} (te laat: ${tasks.filter((t) => t.status === "overdue").length})`,
      `Afspraken: ${events.length}`,
      `Projecten: ${projects.map((p) => `${p.title} [${p.status}]`).join(", ")}`,
      `Open commitments/goedkeuringen: ${approvals.length}`,
    ].join("\n");

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        plan: { type: "array", items: { type: "object", properties: { day: { type: "string" }, focus: { type: "string" }, items: { type: "array", items: { type: "string" } } } } },
        summary: { type: "string" },
      },
      required: ["message"],
    };

    const decision = await agentDecide(
      base44, "weeklyPlanning",
      "Maak een realistische weekplanning. Verdeel taken over dagen rekening houdend met tijd, energie, deadlines, context, locatie, afspraken, focus-behoefte en taakgrootte. Dynamisch: herplant bij vertraging.",
      context, schema
    );

    const plan_data = { plan: decision?.plan || [], summary: decision?.summary || "" };
    const now = new Date().toISOString();

    const existing = await sr.entities.WeeklyPlan.filter({ week_start: ws }).catch(() => []);
    if (existing.length) {
      await sr.entities.WeeklyPlan.update(existing[0].id, { plan_data, status: "active", last_updated: now, agent_source: "weeklyPlanning" }).catch(() => {});
    } else {
      await sr.entities.WeeklyPlan.create({ week_start: ws, plan_data, status: "active", last_updated: now, agent_source: "weeklyPlanning" }).catch(() => {});
    }

    await reportToSalvo(base44, "weeklyPlanning", decision?.message || "");
    await notifySalvo(base44, "Weekplanning", decision?.message || "");

    return Response.json({ ok: true, week_start: ws, plan_data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}