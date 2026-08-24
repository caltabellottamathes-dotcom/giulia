/**
 * selfEngine.ts — zuiver-deterministische analyse-helpers voor de SELF-laag.
 * Geen LLM, geen integration credits. Wordt gedeeld door:
 *   - runSelfCheckIns   (proactieve check-ins)
 *   - analyzeSelfPatterns (patroon/insight detectie)
 *   - buildDailyJournal  (avondlijk journal)
 *   - detectSelfOverload (capacity/overload + personal-time bescherming)
 *
 * Alle functies zijn pure berekeningen op entity-lijsten die de caller laadt.
 */

export interface CheckIn {
  id?: string;
  state?: string;
  energy?: number;
  capacity?: number;
  mood?: string;
  needs?: string[];
  reflection?: string;
  context?: string;
  timestamp?: string;
  source?: string;
}

export interface Routine {
  id?: string;
  title?: string;
  status?: string;
  streak_count?: number;
  last_done?: string;
  next_due?: string;
  frequency?: string;
}

export interface TimeBlock {
  id?: string;
  title?: string;
  type?: string;
  start?: string;
  end?: string;
  duration_min?: number;
  is_protected?: boolean;
  status?: string;
}

export interface CalEvent {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  status?: string;
  domain?: string;
}

/* ── Trends ──────────────────────────────────────────────────── */

export function capacityTrend(checkIns: CheckIn[] = []) {
  const recent = checkIns.slice(0, 7).filter((c) => c.capacity != null).reverse();
  if (recent.length < 2) return { trend: "unknown", avg: null, latest: recent[0]?.capacity ?? null, low: false };
  const latest = recent[recent.length - 1].capacity;
  const half = Math.floor(recent.length / 2);
  const firstAvg = avg(recent.slice(0, half).map((c) => c.capacity));
  const secondAvg = avg(recent.slice(half).map((c) => c.capacity));
  const diff = secondAvg - firstAvg;
  let trend = "stable";
  if (diff <= -10) trend = "declining";
  else if (diff >= 10) trend = "improving";
  return { trend, avg: avg(recent.map((c) => c.capacity)), latest, low: latest != null && latest < 30 };
}

export function energyTrend(checkIns: CheckIn[] = []) {
  const recent = checkIns.slice(0, 7).filter((c) => c.energy != null).reverse();
  if (recent.length < 2) return { trend: "unknown", avg: null, latest: recent[0]?.energy ?? null, low: false };
  const latest = recent[recent.length - 1].energy;
  const half = Math.floor(recent.length / 2);
  const firstAvg = avg(recent.slice(0, half).map((c) => c.energy));
  const secondAvg = avg(recent.slice(half).map((c) => c.energy));
  const diff = secondAvg - firstAvg;
  let trend = "stable";
  if (diff <= -10) trend = "declining";
  else if (diff >= 10) trend = "improving";
  return { trend, avg: avg(recent.map((c) => c.energy)), latest, low: latest != null && latest < 25 };
}

export function moodPattern(checkIns: CheckIn[] = []) {
  const counts: Record<string, number> = {};
  for (const c of checkIns.slice(0, 14)) {
    if (c.mood) counts[c.mood] = (counts[c.mood] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0]?.[0] || null;
  const recurring = sorted.filter(([, n]) => n >= 3).map(([m]) => m);
  return { dominant, recurring, counts };
}

/* ── Balans (FOCUS / LIFE / SELF) ────────────────────────────── */
export function calculateSelfBalance(focusMin = 0, lifeMin = 0, selfMin = 0) {
  // SELF is gefuseerd in LIFE — zelfzorg-tijd (selfMin) telt nu mee als LIFE.
  const lifeCombined = lifeMin + selfMin;
  const total = focusMin + lifeCombined || 1;
  const focusPct = Math.round((focusMin / total) * 100);
  const lifePct = Math.round((lifeCombined / total) * 100);
  const selfPct = 0;
  // Imbalance: LIFE (incl. zelfzorg) < 15% van totale tijd terwijl FOCUS > 60%
  const imbalance = lifePct < 15 && focusPct > 60;
  const underRecovery = lifePct < 15;
  return { focusPct, lifePct, selfPct, imbalance, underRecovery, total };
}

/* ── Personal-time bescherming ───────────────────────────────── */
export function detectPersonalTimeConflicts(blocks: TimeBlock[] = [], events: CalEvent[] = []) {
  const protectedBlocks = blocks.filter((b) => b.is_protected && b.status !== "cancelled" && b.start && b.end);
  const activeEvents = events.filter((e) => e.status !== "cancelled" && e.start && e.end);
  const conflicts = [];
  for (const b of protectedBlocks) {
    const bs = new Date(b.start).getTime();
    const be = new Date(b.end).getTime();
    for (const ev of activeEvents) {
      const es = new Date(ev.start).getTime();
      const ee = new Date(ev.end).getTime();
      if (es < be && ee > bs) {
        conflicts.push({ block: b, event: ev });
      }
    }
  }
  return conflicts;
}

export function totalProtectedToday(blocks: TimeBlock[] = []) {
  const d = new Date().toDateString();
  return (blocks || [])
    .filter((b) => b.is_protected && b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled")
    .reduce((s, b) => s + (b.duration_min || 0), 0);
}

/* ── Check-in timing ─────────────────────────────────────────── */
export function isCheckInDue(lastCheckIn: CheckIn | null, hoursAgo = 3): boolean {
  if (!lastCheckIn || !lastCheckIn.timestamp) return true;
  const diff = Date.now() - new Date(lastCheckIn.timestamp).getTime();
  return diff >= hoursAgo * 3600000;
}

export function routineCompliance(routines: Routine[] = []) {
  const today = routines.filter((r) => r.status !== "archived" && r.status !== "paused");
  const done = today.filter((r) => r.status === "completed");
  const skipped = today.filter((r) => r.status === "skipped");
  return {
    total: today.length,
    done: done.length,
    skipped: skipped.length,
    rate: today.length ? Math.round((done.length / today.length) * 100) : 0,
  };
}

/* ── Helpers ──────────────────────────────────────────────────── */
function avg(nums: number[]): number {
  const f = nums.filter((n) => n != null && !isNaN(n));
  if (!f.length) return 0;
  return Math.round(f.reduce((s, n) => s + n, 0) / f.length);
}

export function dedupeInsightByTitle(existing: { title: string }[] = [], title: string): boolean {
  const t = title.toLowerCase().trim();
  return existing.some((i) => (i.title || "").toLowerCase().trim() === t);
}