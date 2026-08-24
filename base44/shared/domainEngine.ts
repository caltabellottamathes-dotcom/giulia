/**
 * domainEngine.ts — generieke, domein-agnostische analyse-engine voor
 * GIULIA OS. Één implementatie, gebruikt door FOCUS / LIFE / SELF achtergrond-
 * functies. selfEngine.ts behoudt SELF-specifieke helpers (mood, personal-time
 * conflicten) maar delegeert de generieke berekeningen (trend, balance,
 * compliance, overdue, neglect, dedupe) hierheen — zodat alle domeinen op
 * dezelfde manier werken in één systeem.
 */

export function trend(values, { window = 7, threshold = 10, lowMark = 25 } = {}) {
  const f = (values || []).filter((v) => v != null && !isNaN(v)).slice(0, window).reverse();
  if (f.length < 2) return { trend: "unknown", avg: f[0] ?? null, latest: f[f.length - 1] ?? null, low: false };
  const latest = f[f.length - 1];
  const half = Math.floor(f.length / 2);
  const firstAvg = avg(f.slice(0, half));
  const secondAvg = avg(f.slice(half));
  const diff = secondAvg - firstAvg;
  let t = "stable";
  if (diff <= -threshold) t = "declining";
  else if (diff >= threshold) t = "improving";
  return { trend: t, avg: avg(f), latest, low: latest != null && latest < lowMark };
}

export function overdueItems(items, { field = "next_due", days = 0 } = {}) {
  const now = Date.now();
  return (items || []).filter((i) => {
    if (!i[field]) return false;
    return new Date(i[field]).getTime() <= now + days * 86400000;
  });
}

export function dueSoon(items, { field = "due_date", days = 7 } = {}) {
  const now = Date.now();
  const horizon = now + days * 86400000;
  return (items || []).filter((i) => {
    if (!i[field]) return false;
    const t = new Date(i[field]).getTime();
    return t >= now && t <= horizon;
  });
}

export function neglectedContacts(contacts, { minDays = 14 } = {}) {
  const now = Date.now();
  return (contacts || []).filter((c) => {
    const freq = c.desired_frequency_days;
    if (!c.last_contact_date) return freq != null;
    const daysSince = (now - new Date(c.last_contact_date).getTime()) / 86400000;
    return freq ? daysSince >= freq : daysSince >= minDays;
  });
}

export function domainBalance(focus = 0, life = 0, self = 0) {
  // SELF is gefuseerd in LIFE — zelfzorg-tijd telt nu mee als LIFE.
  const lifeCombined = life + self;
  const total = focus + lifeCombined || 1;
  const focusPct = Math.round((focus / total) * 100);
  const lifePct = Math.round((lifeCombined / total) * 100);
  return {
    focusPct, lifePct, selfPct: 0, total,
    imbalance: lifePct < 15 && focusPct > 60,
    underRecovery: lifePct < 15,
    lifeNeglected: lifePct < 15 && focusPct > 55,
  };
}

export function compliance(items, doneFn) {
  const active = (items || []).filter((i) => !["archived", "paused", "cancelled"].includes(i.status));
  const done = active.filter(doneFn);
  return {
    total: active.length,
    done: done.length,
    rate: active.length ? Math.round((done.length / active.length) * 100) : 0,
  };
}

export function dedupeByTitle(existing, title) {
  const t = (title || "").toLowerCase().trim();
  return (existing || []).some((i) => (i.title || "").toLowerCase().trim() === t);
}

export function heavySchedule(events, threshold = 4) {
  return (events || []).length >= threshold;
}

export function sumDuration(items, field = "duration_min") {
  return (items || []).reduce((s, i) => s + (i[field] || 0), 0);
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = (Date.now() - new Date(dateStr).getTime()) / 86400000;
  return isNaN(d) ? null : Math.round(d);
}

function avg(nums) {
  const f = nums.filter((n) => n != null && !isNaN(n));
  return f.length ? Math.round(f.reduce((s, n) => s + n, 0) / f.length) : 0;
}