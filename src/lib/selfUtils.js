/**
 * selfUtils.js — gedeelde helpers voor de SELF-laag.
 * Kleuren, labels en formatting voor state, energy, capacity, mood, routines,
 * time blocks en insights. Gebruikt de SELF-palette tokens.
 */

const PLUM = "hsl(var(--self-primary))";
const PLUM_LIGHT = "hsl(var(--self-primary-light))";
const SAGE = "hsl(var(--self-accent))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const URGENT = "hsl(var(--self-urgent))";

export const SELF_COLORS = {
  primary: PLUM,
  primaryLight: PLUM_LIGHT,
  accent: SAGE,
  accentDeep: SAGE_DEEP,
  urgent: URGENT,
};

/* ── State ─────────────────────────────────────────────────── */
export function stateColor(state) {
  const map = {
    calm: SAGE,
    charged: URGENT,
    neutral: "rgba(255,255,255,0.55)",
    low: "hsl(var(--self-accent-deep))",
    overwhelmed: URGENT,
  };
  return map[state] || "rgba(255,255,255,0.55)";
}

export function stateLabel(state) {
  const map = {
    calm: "Rustig",
    charged: "Geladen",
    neutral: "Neutraal",
    low: "Laag",
    overwhelmed: "Overweldigd",
  };
  return map[state] || "—";
}

/* ── Energy / Capacity ────────────────────────────────────── */
export function energyColor(val) {
  if (val == null) return "rgba(255,255,255,0.3)";
  if (val < 25) return URGENT;
  if (val < 50) return SAGE_DEEP;
  return SAGE;
}

export function capacityColor(val) {
  if (val == null) return "rgba(255,255,255,0.3)";
  if (val < 30) return URGENT;
  if (val < 60) return SAGE_DEEP;
  return SAGE;
}

export function levelLabel(val) {
  if (val == null) return "—";
  if (val < 25) return "Laag";
  if (val < 50) return "Gemiddeld";
  if (val < 75) return "Goed";
  return "Hoog";
}

/* ── Mood ─────────────────────────────────────────────────── */
export function moodColor(mood) {
  const map = {
    good: SAGE,
    energetic: SAGE,
    neutral: "rgba(255,255,255,0.55)",
    low: SAGE_DEEP,
    anxious: URGENT,
    tired: "hsl(var(--self-accent-deep))",
  };
  return map[mood] || "rgba(255,255,255,0.55)";
}

export function moodLabel(mood) {
  const map = {
    good: "Goed",
    neutral: "Neutraal",
    low: "Laag",
    anxious: "Gespannen",
    tired: "Moe",
    energetic: "Energiek",
  };
  return map[mood] || "—";
}

/* ── Routines ─────────────────────────────────────────────── */
export function routineStatusColor(status) {
  const map = {
    active: SAGE,
    completed: SAGE,
    paused: "rgba(255,255,255,0.4)",
    skipped: URGENT,
    archived: "rgba(255,255,255,0.25)",
  };
  return map[status] || "rgba(255,255,255,0.4)";
}

export function routineStatusLabel(status) {
  const map = {
    active: "Actief",
    completed: "Gedaan",
    paused: "Gepauzeerd",
    skipped: "Overgeslagen",
    archived: "Gearchiveerd",
  };
  return map[status] || status;
}

export function isRoutineToday(r) {
  if (!r || r.status === "archived" || r.status === "paused") return false;
  if (r.status === "completed") {
    if (!r.last_done) return false;
    const d = new Date(r.last_done);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }
  if (r.next_due) {
    const d = new Date(r.next_due);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }
  return r.status === "active";
}

export function todayRoutines(list) {
  return (list || []).filter(isRoutineToday);
}

export function completedToday(list) {
  return todayRoutines(list).filter((r) => r.status === "completed");
}

/* ── Time formatting ──────────────────────────────────────── */
export function fmtTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export function fmtDuration(min) {
  if (min == null) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtAgo(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "zojuist";
  if (hrs < 24) return `${hrs}u geleden`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "gisteren";
  if (days < 7) return `${days}d geleden`;
  return fmtDate(dateStr);
}

/* ── Personal Time ────────────────────────────────────────── */
export function timeBlockColor(type) {
  const map = {
    rest: SAGE,
    recovery: SAGE_DEEP,
    free: "rgba(255,255,255,0.5)",
    protected: PLUM_LIGHT,
  };
  return map[type] || "rgba(255,255,255,0.5)";
}

export function timeBlockLabel(type) {
  const map = { rest: "Rust", recovery: "Herstel", free: "Vrije tijd", protected: "Beschermd" };
  return map[type] || type;
}

export function sumPersonalTime(list, type) {
  return (list || [])
    .filter((b) => (type ? b.type === type : true) && b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.duration_min || 0), 0);
}

export function totalPersonalTimeToday(list) {
  const today = new Date().toDateString();
  return (list || [])
    .filter((b) => {
      if (!b.start) return false;
      const d = new Date(b.start);
      return d.toDateString() === today && b.status !== "cancelled";
    })
    .reduce((sum, b) => sum + (b.duration_min || 0), 0);
}

/* ── Therapy ──────────────────────────────────────────────── */
export function therapyStatusColor(status) {
  const map = {
    active: SAGE,
    paused: "rgba(255,255,255,0.4)",
    completed: "rgba(255,255,255,0.3)",
    archived: "rgba(255,255,255,0.2)",
  };
  return map[status] || "rgba(255,255,255,0.4)";
}

export function therapyStatusLabel(status) {
  const map = { active: "Actief", paused: "Gepauzeerd", completed: "Afgerond", archived: "Gearchiveerd" };
  return map[status] || status;
}

/* ── Journal ──────────────────────────────────────────────── */
export function journalTypeColor(type) {
  const map = {
    entry: SAGE,
    moment: URGENT,
    reflection: SAGE_DEEP,
    highlight: SAGE,
    thread: "rgba(255,255,255,0.5)",
  };
  return map[type] || "rgba(255,255,255,0.5)";
}

export function journalTypeLabel(type) {
  const map = { entry: "Notitie", moment: "Moment", reflection: "Reflectie", highlight: "Highlight", thread: "Thread" };
  return map[type] || type;
}

/* ── Goals / Development ──────────────────────────────────── */
export function goalStatusColor(status) {
  const map = {
    active: SAGE,
    paused: "rgba(255,255,255,0.4)",
    completed: SAGE,
    archived: "rgba(255,255,255,0.2)",
    cancelled: URGENT,
  };
  return map[status] || "rgba(255,255,255,0.4)";
}

export function goalStatusLabel(status) {
  const map = { active: "Actief", paused: "Gepauzeerd", completed: "Voltooid", archived: "Gearchiveerd", cancelled: "Geannuleerd" };
  return map[status] || status;
}

export function goalTypeLabel(type) {
  const map = { development: "Gebied", goal: "Doel", milestone: "Milestone", learning: "Leren", activity: "Activiteit" };
  return map[type] || type;
}

/* ── Insights ─────────────────────────────────────────────── */
export function insightTypeColor(type) {
  const map = {
    pattern: SAGE,
    balance: SAGE,
    capacity: SAGE_DEEP,
    imbalance: URGENT,
    overload: URGENT,
    under_recovery: URGENT,
    behavior: "rgba(255,255,255,0.5)",
  };
  return map[type] || "rgba(255,255,255,0.5)";
}

export function insightTypeLabel(type) {
  const map = {
    pattern: "Patroon",
    balance: "Balans",
    capacity: "Capaciteit",
    imbalance: "Onbalans",
    overload: "Overbelasting",
    under_recovery: "Onderherstel",
    behavior: "Gedrag",
  };
  return map[type] || type;
}

/* ── Streaks ──────────────────────────────────────────────── */
export function streakLabel(count) {
  if (!count || count === 0) return "—";
  if (count === 1) return "1 dag";
  return `${count} dagen`;
}