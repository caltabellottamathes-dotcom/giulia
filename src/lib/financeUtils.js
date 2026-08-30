// financeUtils.js — client-side finance computation, mirrors base44/shared/financeEngine.ts.
// Pure functions for instant UI (no backend round-trip needed for display).

export const PERIODS_PER_YEAR = {
  weekly: 52, biweekly: 26, monthly: 12, bimonthly: 6,
  quarterly: 4, semiannual: 2, annual: 1, once: 1, variable: 12,
};

export const FREQ_LABELS = {
  weekly: "Wekelijks", biweekly: "Tweewekelijks", monthly: "Maandelijks", bimonthly: "Tweemaandelijks",
  quarterly: "Per kwartaal", semiannual: "Halfjaarlijks", annual: "Jaarlijks", once: "Eenmalig", variable: "Variabel",
};

export const STATUS_LABEL = { safe: "SAFE", on_track: "ON TRACK", watch: "WATCH", short: "SHORT", critical: "CRITICAL" };
export const STATUS_COLOR = {
  safe: "hsl(var(--life-dew))",
  on_track: "hsl(var(--life-pistachio))",
  watch: "hsl(var(--life-ridge))",
  short: "hsl(var(--smoke))",
  critical: "hsl(var(--life-urgent))",
};
export const STATUS_TEXT = {
  safe: "text-foreground", on_track: "text-foreground", watch: "text-foreground", short: "text-ivory", critical: "text-charcoal",
};

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const fmtEuro = (n) => `€${Math.round((Number(n) || 0) * 100) / 100}`;

export function normalizeMonthly(amount, freq, nextDate) {
  const a = Number(amount) || 0;
  const f = freq || "monthly";
  if (f === "once") {
    if (nextDate) {
      const months = Math.max(1, Math.round((new Date(nextDate).getTime() - Date.now()) / MONTH_MS));
      return a / months;
    }
    return a;
  }
  const ppy = PERIODS_PER_YEAR[f] ?? 12;
  return (a * ppy) / 12;
}

export function freqFromRecurrence(rec) {
  switch (rec) {
    case "monthly": return "monthly";
    case "quarterly": return "quarterly";
    case "annual": return "annual";
    default: return "once";
  }
}

export function monthsUntil(dateStr) {
  if (!dateStr) return null;
  return Math.round((new Date(dateStr).getTime() - Date.now()) / MONTH_MS);
}

export function calcPortfolio(p, expenses) {
  const linked = (expenses || []).filter((e) => e.portfolio_id === p.id && e.status !== "done");
  let recommended = 0;
  for (const e of linked) {
    const freq = e.frequency || freqFromRecurrence(e.recurrence);
    const amt = e.expected_amount ?? e.amount ?? 0;
    recommended += normalizeMonthly(amt, freq, e.next_payment_date);
  }
  recommended = Math.round(recommended * 100) / 100;

  let nextExpected = 0;
  let earliestDate = null;
  const now = Date.now();
  for (const e of linked) {
    const amt = e.expected_amount ?? e.amount ?? 0;
    const d = e.next_payment_date;
    if (d) {
      const t = new Date(d).getTime();
      if (t - now <= 31 * DAY_MS) nextExpected += Number(amt) || 0;
      if (!earliestDate || new Date(d).getTime() < new Date(earliestDate).getTime()) earliestDate = d;
    } else {
      nextExpected += Number(amt) || 0;
    }
  }
  nextExpected = Math.round(nextExpected * 100) / 100;

  const balance = Number(p.current_balance) || 0;
  const required = Math.max(0, Math.round((nextExpected - balance) * 100) / 100);
  let status = healthStatus(balance, nextExpected, Number(p.desired_buffer) || 0, earliestDate);
  const actual = Number(p.monthly_reservation_actual) || 0;
  if (recommended > 0 && actual < recommended * 0.8) status = degrade(status);

  return { recommended_monthly: recommended, next_expected_payment: nextExpected, next_payment_date: earliestDate || p.next_payment_date || "", required_reservation: required, status };
}

function healthStatus(balance, nextExpected, buffer, nextDate) {
  const coverage = nextExpected > 0 ? balance / nextExpected : 1;
  const mu = nextDate ? monthsUntil(nextDate) : null;
  if (balance <= 0 && (mu === null || mu <= 1)) return "critical";
  if (coverage >= 1 && balance >= nextExpected + buffer) return "safe";
  if (coverage >= 1) return "on_track";
  if (coverage >= 0.5) return "watch";
  if (coverage > 0) return "short";
  return "critical";
}

const ORDER = ["safe", "on_track", "watch", "short", "critical"];
function degrade(s) { const i = ORDER.indexOf(s); return ORDER[Math.min(ORDER.length - 1, i + 1)]; }

function periodToMonths(freq) {
  switch (freq) {
    case "monthly": return 1; case "bimonthly": return 2; case "quarterly": return 3;
    case "semiannual": return 6; case "annual": return 12; case "once": return 999; default: return 1;
  }
}
function monthIndex(date) {
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

export function calcForecast(portfolios, expenses, months = 12) {
  const series = [];
  for (const p of portfolios) {
    const linked = (expenses || []).filter((e) => e.portfolio_id === p.id && e.status !== "done");
    const monthlyIn = Number(p.monthly_reservation_actual) || 0;
    const payments = new Array(months).fill(0);
    for (const e of linked) {
      const amt = e.expected_amount ?? e.amount ?? 0;
      const freq = e.frequency || freqFromRecurrence(e.recurrence);
      const start = e.next_payment_date ? new Date(e.next_payment_date) : new Date();
      const step = periodToMonths(freq);
      let m = monthIndex(start);
      let guard = 0;
      while (m < months && guard < 48) {
        if (m >= 0) payments[m] += Number(amt) || 0;
        if (freq === "once") break;
        start.setMonth(start.getMonth() + step);
        m = monthIndex(start);
        guard++;
      }
    }
    let bal = Number(p.current_balance) || 0;
    const points = [];
    for (let i = 0; i < months; i++) {
      bal += monthlyIn - payments[i];
      points.push({ month: i, label: monthLabel(i), balance: Math.round(bal * 100) / 100 });
    }
    series.push({ portfolio_id: p.id, name: p.name, kind: p.kind, points });
  }
  return series;
}

export function monthLabel(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("nl-NL", { month: "short" });
}

export function monthlyIncome(incomes) {
  let total = 0;
  for (const i of incomes || []) {
    if (i.status === "missed") continue;
    total += normalizeMonthly(Number(i.amount) || 0, i.frequency || "monthly");
  }
  return Math.round(total * 100) / 100;
}

export function monthlyDistribution(incomes, portfolios, expenses) {
  const income = monthlyIncome(incomes);
  let reserved = 0;
  const perPortfolio = [];
  for (const p of portfolios) {
    if (p.kind === "sparen") {
      const r = Number(p.monthly_reservation_actual) || 0;
      reserved += r;
      perPortfolio.push({ id: p.id, name: p.name, reservation: r, recommended: r });
      continue;
    }
    const calc = calcPortfolio(p, (expenses || []).filter((e) => e.portfolio_id === p.id));
    const actual = Number(p.monthly_reservation_actual) || calc.recommended_monthly;
    reserved += actual;
    perPortfolio.push({ id: p.id, name: p.name, reservation: actual, recommended: calc.recommended_monthly });
  }
  reserved = Math.round(reserved * 100) / 100;
  return { income, reserved, available: Math.round((income - reserved) * 100) / 100, perPortfolio };
}

/** Total money = sum of portfolio balances (all money actually present in the wallets). */
export function totalMoney(portfolios, incomes, expenses) {
  return Math.round((portfolios || []).reduce((s, p) => s + (Number(p.current_balance) || 0), 0) * 100) / 100;
}

/** Reserved = sum of portfolio balances (each has a destination). */
export function totalReserved(portfolios) {
  return Math.round((portfolios || []).reduce((s, p) => s + (Number(p.current_balance) || 0), 0) * 100) / 100;
}

export function upcomingExpenses(expenses, days = 30) {
  const now = Date.now();
  return (expenses || [])
    .filter((e) => e.status !== "done" && e.next_payment_date)
    .map((e) => ({ ...e, amount: e.expected_amount ?? e.amount ?? 0, daysUntil: Math.round((new Date(e.next_payment_date).getTime() - now) / DAY_MS) }))
    .filter((e) => e.daysUntil <= days)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}