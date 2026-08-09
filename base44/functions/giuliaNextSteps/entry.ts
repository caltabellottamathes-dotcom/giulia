import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * giuliaNextSteps — Giulia looks at the user's current state (open/overdue
 * tasks, pending approvals, unread email, today's agenda, recent insights) and
 * proactively returns 3 concrete next steps for when the user is stuck.
 * Payload: {} (reads the authenticated user's data via service role).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [tasks, approvals, emails, events, insights] = await Promise.all([
      base44.asServiceRole.entities.Task.list().catch(() => []),
      base44.asServiceRole.entities.Approval.filter({ status: "pending" }).catch(() => []),
      base44.asServiceRole.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.asServiceRole.entities.Event.list().catch(() => []),
      base44.asServiceRole.entities.Insight.list("-created_date", 5).catch(() => []),
    ]);

    const todayStr = new Date().toLocaleDateString("sv-SE");
    const openTasks = tasks.filter((t) => ["today", "overdue", "upcoming"].includes(t.status));
    const overdue = tasks.filter((t) => t.status === "overdue");
    const todaysEvents = events.filter((e) => (e.start || "").slice(0, 10) === todayStr);

    const snapshot = {
      openTaken: openTasks.slice(0, 8).map((t) => ({ titel: t.title, status: t.status, deadline: t.deadline, prioriteit: t.priority })),
      teLaat: overdue.map((t) => t.title),
      wachtendeGoedkeuringen: approvals.slice(0, 5).map((a) => a.description),
      ongelezenEmail: emails.length,
      agendaVandaag: todaysEvents.slice(0, 5).map((e) => ({ titel: e.title, start: e.start })),
      recenteInzichten: insights.map((i) => i.title),
    };

    const prompt =
      `Je bent Giulia, de proactieve AI-assistent van Salvo. Hier is zijn huidige staat:\n` +
      JSON.stringify(snapshot) +
      `\n\nSalvo kan vastlopen. Geef 3 concrete, proactieve vervolgstappen: wat moet hij nu doen, in volgorde, en waarom. Beknopt, duidelijk, in het Nederlands, actieerbaar (niet vaag).`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                why: { type: "string" },
                action: { type: "string" },
              },
            },
          },
        },
      },
    });

    const steps = res?.steps || [];
    return Response.json({ ok: true, steps });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}