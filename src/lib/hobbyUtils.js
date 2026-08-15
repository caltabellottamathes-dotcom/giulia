// hobbyUtils.js — afleiding van hobby-status voor de Hobbies-module (LIFE).
// Status wordt bepaald uit activity_level + last_activity_date + discovered_date.

const DAY = 86400000;

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / DAY);
}

export function hobbyState(h) {
  if (!h) return "quiet";
  if (h.status === "inactive" || h.activity_level === "archived") return "archived";
  const disc = daysSince(h.discovered_date);
  const ds = daysSince(h.last_activity_date);
  if (h.activity_level === "new" || (disc != null && disc <= 7 && (ds == null || ds > 7))) return "new";
  if (h.activity_level === "reactivating") return "reactivating";
  if (h.activity_level === "emerging") return "emerging";
  if (ds == null) return "quiet";
  if (ds <= 14) return "active";
  return "quiet";
}

export function hobbyGroups(hobbies) {
  const out = { active: [], quiet: [], news: [], emerging: [], archived: [] };
  (hobbies || []).forEach((h) => {
    const s = hobbyState(h);
    if (s === "archived") out.archived.push(h);
    else if (s === "new") out.news.push(h);
    else if (s === "reactivating" || s === "emerging") out.emerging.push(h);
    else if (s === "active") out.active.push(h);
    else out.quiet.push(h);
  });
  return out;
}

export function hobbyHeadline(g) {
  const a = g.active.length;
  const n = g.news.length + g.emerging.length;
  if (a === 0 && n === 0) return "QUIETLY CREATIVE";
  if (a >= 3) return `${a} THINGS ARE ALIVE`;
  if (n > 0 && a > 0) return "A LOT ON YOUR MIND";
  if (n > 0) return "SOMETHING NEW";
  if (a > 0) return "YOU'RE MAKING THINGS";
  return "QUIETLY CREATIVE";
}

export function statusLine(g) {
  const parts = [];
  if (g.active.length) parts.push(`${g.active[0].title} is active`);
  if (g.quiet.length) parts.push(`${g.quiet[0].title} is quiet`);
  if (g.news.length + g.emerging.length) parts.push("one new interest appeared");
  return parts.join(" · ") || "Still water.";
}

// 0..1 — hoe "levend" een hobby nu is (bepaalt visuele grootte in het veld)
export function fieldSize(h) {
  const ds = daysSince(h.last_activity_date);
  if (ds == null) return 0.42;
  if (ds <= 1) return 1;
  if (ds <= 3) return 0.86;
  if (ds <= 7) return 0.68;
  if (ds <= 14) return 0.52;
  return 0.34;
}

export function stateColor(state) {
  switch (state) {
    case "active": return "hsl(var(--life-blue-deep))";
    case "reactivating":
    case "emerging": return "hsl(var(--life-sand-deep))";
    case "new": return "hsl(var(--life-sand))";
    case "quiet": return "hsl(var(--muted-foreground))";
    case "archived": return "hsl(var(--smoke))";
    default: return "hsl(var(--life-blue))";
  }
}

export function attentionFlow(hobbies) {
  return (hobbies || [])
    .map((h) => ({ title: h.title, state: hobbyState(h), level: Math.max(1, Math.round(fieldSize(h) * 8)) }))
    .sort((a, b) => b.level - a.level);
}

export function hobbyRhythm(events) {
  const days = ["ZON", "MAA", "DIN", "WOE", "DON", "VRI", "ZAT"];
  const today = new Date();
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const evs = (events || []).filter((e) => {
      const ed = new Date(e.start);
      return ed.toDateString() === d.toDateString() && (e.domain === "life" || e.domain === "self");
    });
    week.push({ day: days[d.getDay()], label: evs.length ? evs[0].title : "—", date: d });
  }
  return week;
}

export function rhythmState(week) {
  const filled = week.filter((w) => w.label !== "—").length;
  if (filled >= 5) return "ACTIVE";
  if (filled >= 3) return "BALANCED";
  if (filled >= 1) return "SCATTERED";
  return "QUIET";
}

export function fmtDaysAgo(dateStr) {
  const ds = daysSince(dateStr);
  if (ds == null) return "—";
  if (ds === 0) return "vandaag";
  if (ds === 1) return "gisteren";
  return `${ds} dagen geleden`;
}