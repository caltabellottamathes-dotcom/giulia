import { base44 } from "@/api/base44Client";

/**
 * unifiedStream.js — de "versmolten" data-laag achter /Giulia.
 * Eén plek die FOCUS, LIFE, SELF en GIULIA samenbrengt zodat de GIULIA-widgets
 * als één unified systeem functioneren. Widgets lezen hier vandaan in plaats
 * van per-domein hun eigen queries te draaien.
 */

export const DOMAIN_META = {
  focus: { label: "Focus", color: "hsl(var(--olive))", route: "/tasks" },
  life: { label: "Life", color: "hsl(var(--life-blue-deep))", route: "/life" },
  self: { label: "Self", color: "hsl(var(--self-accent-deep))", route: "/self" },
  giulia: { label: "Giulia", color: "hsl(var(--urgent))", route: "/chat" },
};

const todayStr = () => new Date().toLocaleDateString("sv-SE");
const dayBounds = () => {
  const s = new Date(); s.setHours(0, 0, 0, 0);
  const e = new Date(); e.setHours(23, 59, 59, 999);
  return [s.toISOString(), e.toISOString()];
};

/** Unified attention — FOCUS + LIFE + SELF in één object. */
export async function fetchUnifiedAttention() {
  const today = todayStr();
  const [start, end] = dayBounds();
  const [events, approvals, emails, wa, threads, needs, household, routines, socialPlans] = await Promise.all([
    base44.entities.CalendarEvent.filter({ start: { $gte: start, $lt: end } }).catch(() => []),
    base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
    base44.entities.Email.filter({ status: "unread" }).catch(() => []),
    base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
    base44.entities.Thread.filter({ needs_info: true }).catch(() => []),
    base44.entities.SelfNeed.filter({ status: { $in: ["open", "prioritized", "revisited"] } }).catch(() => []),
    base44.entities.HouseholdItem.filter({ status: { $in: ["needs_attention", "due", "overdue"] } }).catch(() => []),
    base44.entities.SelfRoutine.filter({ status: "active", next_due: today }).catch(() => []),
    base44.entities.SocialPlan.filter({ status: { $in: ["planned", "confirmed"] } }, "suggested_date").catch(() => []),
  ]);
  const evs = events || [];
  const eventsByDomain = evs.reduce((a, e) => { const d = e.domain || "focus"; (a[d] = a[d] || []).push(e); return a; }, {});
  const upcomingSocial = (socialPlans || []).filter((p) => new Date(p.suggested_date).getTime() >= Date.now() - 3600000).slice(0, 5);
  return {
    events: evs,
    eventsByDomain,
    approvals: approvals || [],
    unreadEmails: emails || [],
    unreadWhatsapps: wa || [],
    openThreads: threads || [],
    selfNeeds: needs || [],
    lifeItemsDue: household || [],
    routinesDueToday: routines || [],
    socialPlans: upcomingSocial,
  };
}

/** Unified insights — Insight (FOCUS/LIFE/GIULIA) + SelfInsight (SELF) merged. */
export async function fetchUnifiedInsights(limit = 20) {
  const [ins, selfIns] = await Promise.all([
    base44.entities.Insight.list("-created_date", limit).catch(() => []),
    base44.entities.SelfInsight.list("-created_date", limit).catch(() => []),
  ]);
  const norm = (i, domain) => ({ ...i, _domain: domain, _kind: "insight" });
  const merged = [
    ...(ins || []).map((i) => norm(i, i.domain || "focus")),
    ...(selfIns || []).map((i) => norm(i, "self")),
  ];
  merged.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  return merged.slice(0, limit);
}

/** Unified completed — wat er gedaan is over ALLE domeinen heen. */
export async function fetchUnifiedCompleted(limit = 10) {
  const [tasks, routines, social, goals, household] = await Promise.all([
    base44.entities.Task.filter({ status: "completed" }, "-updated_date", limit).catch(() => []),
    base44.entities.SelfRoutine.filter({ status: "completed" }, "-updated_date", limit).catch(() => []),
    base44.entities.SocialPlan.filter({ status: "done" }, "-updated_date", limit).catch(() => []),
    base44.entities.SelfGoal.filter({ status: "completed" }, "-updated_date", limit).catch(() => []),
    base44.entities.HouseholdItem.filter({ status: "done" }, "-updated_date", limit).catch(() => []),
  ]);
  const norm = (list, domain) => (list || []).map((x) => ({ id: x.id, title: x.title || x.activity || x.name || "voltooid", domain, updated: x.updated_date || x.last_done || x.created_date }));
  const merged = [
    ...norm(tasks, "focus"),
    ...norm(routines, "self"),
    ...norm(social, "life"),
    ...norm(goals, "self"),
    ...norm(household, "life"),
  ];
  merged.sort((a, b) => new Date(b.updated || 0) - new Date(a.updated || 0));
  return merged.slice(0, limit);
}