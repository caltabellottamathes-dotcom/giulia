import { base44 } from "@/api/base44Client";

/**
 * getUrgentTypes — voor het NOW-dashboard: toont PER widget alleen of er
 * NU werkelijk iets dringends ligt. Geen widget staat "altijd" aan —
 * als er niets ongelezen/ongedaan is, verdwijnt de widget van NOW.
 * Dit houdt NOW fris: alleen actuele aandacht, niet dezelfde widgets
 * dag in dag uit.
 */
export async function getUrgentTypes() {
  const urgent = new Set();
  await Promise.all([
    // Comm — alleen als er werkelijk iets ongelezen ligt
    base44.entities.Email.filter({ status: "unread", folder: "inbox", deleted: { $ne: true } })
      .then((r) => { if ((r || []).length) urgent.add("email"); }).catch(() => {}),
    base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" })
      .then((r) => { if ((r || []).length) urgent.add("whatsapp"); }).catch(() => {}),
    base44.entities.Notification.filter({ status: "unread" })
      .then((r) => { if ((r || []).length) urgent.add("notifications"); }).catch(() => {}),
    // Tasks
    base44.entities.Task.filter({ status: { $in: ["overdue", "today"] } })
      .then((r) => { if ((r || []).length) urgent.add("tasks"); }).catch(() => {}),
    // Approvals
    base44.entities.Approval.filter({ status: "pending" })
      .then((r) => { if ((r || []).length) urgent.add("approvals"); }).catch(() => {}),
    // Household
    base44.entities.HouseholdItem.filter({ status: { $in: ["due", "overdue", "needs_attention"] } })
      .then((r) => { if ((r || []).length) urgent.add("household"); }).catch(() => {}),
    // Admin
    base44.entities.AdminObligation.filter({ status: { $in: ["open", "overdue"] } })
      .then((r) => { if ((r || []).length) urgent.add("personaladmin"); }).catch(() => {}),
    // Self state
    base44.entities.SelfCheckIn.filter({}, "-timestamp", 1)
      .then((r) => { const c = (r || [])[0]; if (c && (c.state === "overwhelmed" || c.state === "low")) urgent.add("selfdailystate"); }).catch(() => {}),
    // Self insights
    base44.entities.SelfInsight.filter({ status: "active" })
      .then((r) => { if ((r || []).length) urgent.add("selfinsights"); }).catch(() => {}),
  ]);
  return urgent;
}