import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { giuliaCompose } from "../../shared/giulia.ts";

/**
 * eveningFollowUp — reviews what stayed open today and composes a short
 * evening follow-up from Giulia (InvokeLLM = integration credits). Stores
 * an in-app Message and pushes a notification.
 * Scheduled daily at 18:30 Europe/Amsterdam.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [tasks, approvals, threads] = await Promise.all([
      sr.entities.Task.list().catch(() => []),
      sr.entities.Approval.filter({ status: "pending" }).catch(() => []),
      sr.entities.Thread.filter({ status: "open" }).catch(() => []),
    ]);

    const open = tasks.filter((t) => t.status === "today" || t.status === "overdue" || t.status === "waiting");
    const stale = threads.filter((t) => t.needs_info);

    const context = [
      `Openstaand: ${open.map((t) => t.title).join(", ") || "niets"}`,
      `Goedkeuringen wachtend: ${approvals.length}`,
      `Draadjes wachtend op info: ${stale.map((t) => t.title).join(", ") || "geen"}`,
    ].join("\n");

    let message = await giuliaCompose(
      base44,
      "Schrijf een korte avond-follow-up: wat bleef open, wat kan wachten tot morgen, en één ding dat Salvo morgen als eerste kan doen.",
      context
    );
    if (!message) {
      const openPart = open.length ? open.length + " ding(en) staan nog open. " : "Alles is afgerond vandaag. ";
      message = "Goedenavond Salvo. " + openPart + "Morgen pakken we het weer op.";
    }

    // Achtergrond blijft onzichtbaar in de chat — log naar Activity, push blijft.
    await sr.entities.Activity.create({
      action: "evening_followup",
      description: String(message).slice(0, 280),
      source: "eveningFollowUp",
      timestamp: new Date().toISOString(),
    }).catch(() => null);

    try { await base44.functions.invoke("sendPush", { title: "Giulia · Avond", message }); } catch (e) { /* ignore */ }

    return Response.json({ ok: true, message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}