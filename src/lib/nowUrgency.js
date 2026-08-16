import { base44 } from "@/api/base44Client";

/**
 * getUrgentTypes — voor het NOW-dashboard: bepaalt per aandacht-widget of er
 * nu echt iets dringends ligt. Comm-widget (email/whatsapp/notifications)
 * staan altijd op NOW (aandacht-kanalen). De rest wordt aan de hand van
 * entity-counts getoetst; leeg → verborgen op NOW.
 */
const ATTENTION_ALWAYS = ["email", "whatsapp", "notifications"];

export async function getUrgentTypes() {
  const urgent = new Set(ATTENTION_ALWAYS);
  await Promise.all([
    base44.entities.Approval.filter({ status: "pending" })
      .then((r) => { if ((r || []).length) urgent.add("approvals"); }).catch(() => {}),
    base44.entities.Task.filter({ status: { $in: ["overdue", "today"] } })
      .then((r) => { if ((r || []).length) urgent.add("tasks"); }).catch(() => {}),
    base44.entities.HouseholdItem.filter({ status: { $in: ["due", "overdue", "needs_attention"] } })
      .then((r) => { if ((r || []).length) urgent.add("household"); }).catch(() => {}),
    base44.entities.AdminObligation.filter({ status: { $in: ["open", "overdue"] } })
      .then((r) => { if ((r || []).length) urgent.add("personaladmin"); }).catch(() => {}),
    base44.entities.SelfCheckIn.filter({}, "-timestamp", 1)
      .then((r) => { const c = (r || [])[0]; if (c && (c.state === "overwhelmed" || c.state === "low")) urgent.add("selfdailystate"); }).catch(() => {}),
    base44.entities.SelfInsight.filter({ status: "active" })
      .then((r) => { if ((r || []).length) urgent.add("selfinsights"); }).catch(() => {}),
  ]);
  return urgent;
}