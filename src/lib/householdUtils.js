// Household domain helpers — shared across widget / panel / page.
export const H_ATTENTION = ["overdue", "needs_attention", "due", "open"];
export const isAttention = (s) => H_ATTENTION.includes(s);

const RANK = { overdue: 4, needs_attention: 3, due: 2, open: 1, good: 0, calm: 0, done: 0 };
const rankLabel = (r) => Object.entries(RANK).find(([, v]) => v === r)?.[0] || "good";

export const zoneStatus = (items, pred) => {
  const sub = (items || []).filter(pred);
  if (!sub.length) return "calm";
  const r = sub.reduce((m, i) => Math.max(m, RANK[i.status] ?? 0), 0);
  return r === 0 ? "calm" : rankLabel(r);
};

export const householdZones = (items) => [
  { key: "cleaning", label: "Schoonmaak", status: zoneStatus(items, (i) => i.kind === "routine" && /clean|laundry|was|schoon/i.test(i.category || "")) },
  { key: "shopping", label: "Boodschappen", status: zoneStatus(items, (i) => i.kind === "shopping") },
  { key: "maintenance", label: "Onderhoud", status: zoneStatus(items, (i) => i.kind === "maintenance") },
  { key: "routines", label: "Routines", status: zoneStatus(items, (i) => i.kind === "routine") },
];

export const mattersItems = (items = [], tasks = []) => {
  const fromItems = items.filter((i) => isAttention(i.status));
  const fromTasks = (tasks || [])
    .filter((t) => t.domain === "life" && !["completed", "archived", "done"].includes(t.status))
    .map((t) => ({ title: t.title, kind: "task", status: t.status === "overdue" ? "overdue" : "needs_attention", _task: t, id: t.id }));
  return [...fromItems, ...fromTasks];
};

export const householdHeadline = (matters, items) => {
  if (!items.length) return "RUSTIGE WEEK";
  if (matters.length === 0) return "ONDER CONTROLE";
  if (matters.length >= 4) return "RESET NODIG";
  return "EEN PAAR DINGEN";
};

export const statusLabel = (s) => ({ overdue: "Te laat", needs_attention: "Aandacht", due: "Nu", open: "Open", calm: "Rustig", good: "Goed", done: "Klaar" }[s] || "—");

// Routine cadence: ON TRACK / DUE / UPCOMING / TE LAAT
export const routineState = (item) => {
  if (item.status === "overdue") return { label: "TE LAAT", hot: true };
  if (item.next_due) {
    const days = Math.round((new Date(item.next_due).getTime() - Date.now()) / 86400000);
    if (days <= 0) return { label: "NU", hot: true };
    if (days <= 2) return { label: "BINNENKORT", hot: false };
    return { label: "OP KOERS", hot: false };
  }
  if (item.frequency_days && item.last_done) {
    const since = Math.round((Date.now() - new Date(item.last_done).getTime()) / 86400000);
    if (since >= item.frequency_days) return { label: "NU", hot: true };
    if (since >= item.frequency_days - 1) return { label: "BINNENKORT", hot: false };
    return { label: "OP KOERS", hot: false };
  }
  return { label: "OP KOERS", hot: false };
};

export const nextExpected = (item) => {
  if (item.next_due) return new Date(item.next_due);
  if (item.frequency_days && item.last_done) return new Date(new Date(item.last_done).getTime() + item.frequency_days * 86400000);
  return null;
};