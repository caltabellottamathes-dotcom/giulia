// financeEngine.ts — deterministic finance computation for the Portfolio system.
// Pure functions shared by calcReservations / calcPortfolioHealth / calcForecast /
// runFinanceProactivity. Mirrors src/lib/financeUtils.js (client) intentionally.

export const PERIODS_PER_YEAR: Record<string, number> = {
  weekly: 52, biweekly: 26, monthly: 12, bimonthly: 6,
  quarterly: 4, semiannual: 2, annual: 1, once: 1, variable: 12,
};

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeMonthly(amount: number | undefined, freq: string | undefined, nextDate?: string): number {
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

/** Map legacy recurrence → frequency. */
export function freqFromRecurrence(rec: string | undefined): string {
  switch (rec) {
    case "monthly": return "monthly";
    case "quarterly": return "quarterly";
    case "annual": return "annual";
    default: return "once";
  }
}

export interface ExpenseLike {
  id: string;
  expected_amount?: number;
  amount?: number;
  frequency?: string;
  recurrence?: string;
  next_payment_date?: string;
  status?: string;
  portfolio_id?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface PortfolioLike {
  id: string;
  name: string;
  kind?: string;
  current_balance?: number;
  target_balance?: number;
  desired_buffer?: number;
  monthly_reservation_actual?: number;
  next_payment_date?: string;
  payment_frequency?: string;
}

export interface PortfolioCalc {
  recommended_monthly: number;
  next_expected_payment: number;
  next_payment_date: string;
  required_reservation: number;
  status: string;
}

export function monthsUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.round(ms / MONTH_MS);
}

/** Core per-portfolio computation. expenses = all AdminObligations linked to this portfolio. */
export function calcPortfolio(p: PortfolioLike, expenses: ExpenseLike[]): PortfolioCalc {
  const linked = expenses.filter((e) => e.portfolio_id === p.id && e.status !== "done");

  // recommended monthly = sum of normalized expense amounts
  let recommended = 0;
  for (const e of linked) {
    const freq = e.frequency || freqFromRecurrence(e.recurrence);
    const amt = e.expected_amount ?? e.amount ?? 0;
    recommended += normalizeMonthly(amt, freq, e.next_payment_date);
  }
  recommended = Math.round(recommended * 100) / 100;

  // next expected payment = sum of expense amounts due within next 31 days
  let nextExpected = 0;
  let earliestDate: string | null = null;
  const now = Date.now();
  for (const e of linked) {
    const amt = e.expected_amount ?? e.amount ?? 0;
    const d = e.next_payment_date;
    if (d) {
      const t = new Date(d).getTime();
      if (t - now <= 31 * DAY_MS) nextExpected += Number(amt) || 0;
      if (!earliestDate || new Date(d).getTime() < new Date(earliestDate).getTime()) earliestDate = d;
    } else {
      // no date → assume within month
      nextExpected += Number(amt) || 0;
    }
  }
  nextExpected = Math.round(nextExpected * 100) / 100;

  const balance = Number(p.current_balance) || 0;
  const required = Math.max(0, Math.round((nextExpected - balance) * 100) / 100);

  // health
  let status = healthStatus(balance, nextExpected, Number(p.desired_buffer) || 0, earliestDate);
  // reservation underfunding degrades status
  const actual = Number(p.monthly_reservation_actual) || 0;
  if (recommended > 0 && actual < recommended * 0.8) {
    status = degrade(status);
  }

  return { recommended_monthly: recommended, next_expected_payment: nextExpected, next_payment_date: earliestDate || p.next_payment_date || "", required_reservation: required, status };
}

function healthStatus(balance: number, nextExpected: number, buffer: number, nextDate: string | null): string {
  const coverage = nextExpected > 0 ? balance / nextExpected : 1;
  const mu = nextDate ? monthsUntil(nextDate) : null;
  if (balance <= 0 && (mu === null || mu <= 1)) return "critical";
  if (coverage >= 1 && balance >= nextExpected + buffer) return "safe";
  if (coverage >= 1) return "on_track";
  if (coverage >= 0.5) return "watch";
  if (coverage > 0) return "short";
  return "critical";
}

function degrade(s: string): string {
  const order = ["safe", "on_track", "watch", "short", "critical"];
  const i = order.indexOf(s);
  return order[Math.min(order.length - 1, i + 1)];
}

/** Forecast: project balance per portfolio over N months. */
export function calcForecast(portfolios: PortfolioLike[], expenses: ExpenseLike[], months = 12) {
  const series: { portfolio_id: string; name: string; points: { month: number; balance: number }[] }[] = [];
  for (const p of portfolios) {
    if (p.kind === "onvoorzien" || p.kind === "sparen") {
      // still forecast: reservation in, no scheduled expenses (sparen) / variable (onvoorzien)
    }
    const linked = expenses.filter((e) => e.portfolio_id === p.id && e.status !== "done");
    const monthlyIn = Number(p.monthly_reservation_actual) || 0;
    // build payment schedule per month
    const payments: number[] = new Array(months).fill(0);
    for (const e of linked) {
      const amt = e.expected_amount ?? e.amount ?? 0;
      const freq = e.frequency || freqFromRecurrence(e.recurrence);
      const start = e.next_payment_date ? new Date(e.next_payment_date) : new Date();
      const stepMonths = periodToMonths(freq);
      let m = monthIndex(start);
      for (let k = 0; k < 24 && m < months; k++) {
        if (m >= 0) payments[m] += Number(amt) || 0;
        if (freq === "once") break;
        start.setMonth(start.getMonth() + stepMonths);
        m = monthIndex(start);
      }
    }
    let bal = Number(p.current_balance) || 0;
    const points = [];
    for (let i = 0; i < months; i++) {
      bal += monthlyIn - payments[i];
      points.push({ month: i, balance: Math.round(bal * 100) / 100 });
    }
    series.push({ portfolio_id: p.id, name: p.name, points });
  }
  return series;
}

function periodToMonths(freq: string): number {
  switch (freq) {
    case "weekly": return 0;
    case "biweekly": return 0;
    case "monthly": return 1;
    case "bimonthly": return 2;
    case "quarterly": return 3;
    case "semiannual": return 6;
    case "annual": return 12;
    case "once": return 999;
    default: return 1;
  }
}

function monthIndex(date: Date): number {
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

export interface IncomeLike {
  id: string;
  amount?: number;
  frequency?: string;
  status?: string;
}

/** Monthly income = sum normalized monthly of all incomes (expected + received). */
export function monthlyIncome(incomes: IncomeLike[]): number {
  let total = 0;
  for (const i of incomes) {
    if (i.status === "missed") continue;
    total += normalizeMonthly(Number(i.amount) || 0, i.frequency || "monthly");
  }
  return Math.round(total * 100) / 100;
}

/** Monthly distribution: income → reserved → available. */
export function monthlyDistribution(incomes: IncomeLike[], portfolios: PortfolioLike[], expenses: ExpenseLike[]) {
  const income = monthlyIncome(incomes);
  let reserved = 0;
  const perPortfolio: { id: string; name: string; reservation: number; recommended: number }[] = [];
  for (const p of portfolios) {
    if (p.kind === "sparen") {
      const r = Number(p.monthly_reservation_actual) || 0;
      reserved += r;
      perPortfolio.push({ id: p.id, name: p.name, reservation: r, recommended: r });
      continue;
    }
    const calc = calcPortfolio(p, expenses.filter((e) => e.portfolio_id === p.id));
    const actual = Number(p.monthly_reservation_actual) || calc.recommended_monthly;
    reserved += actual;
    perPortfolio.push({ id: p.id, name: p.name, reservation: actual, recommended: calc.recommended_monthly });
  }
  reserved = Math.round(reserved * 100) / 100;
  const available = Math.round((income - reserved) * 100) / 100;
  return { income, reserved, available, perPortfolio };
}

export const STATUS_ORDER = ["safe", "on_track", "watch", "short", "critical"];
export const STATUS_LABEL: Record<string, string> = {
  safe: "SAFE", on_track: "ON TRACK", watch: "WATCH", short: "SHORT", critical: "CRITICAL",
};