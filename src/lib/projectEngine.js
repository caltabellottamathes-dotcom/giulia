// Deterministic GIULIA project intelligence — progress, breakdown,
// context interpretation and task extraction. Runs without LLM credits.
//
// Theme-aware: when ProjectTheme records exist and tasks carry theme_id,
// the breakdown groups by theme (themes → subthemes). Tasks without a
// theme fall into an "Algemeen" bucket. Falls back to the legacy
// context-based (onderdeel · sub) grouping when no themes are present.

import { parseContext, isTaskDone } from "./projectStatus";

/** Nested breakdown — theme hierarchy when themes exist, else context-based. */
export function buildBreakdown(tasks, themes = []) {
  const themeMap = new Map((themes || []).map((t) => [t.id, t]));
  const hasThemed = (tasks || []).some((t) => t.theme_id && themeMap.has(t.theme_id));
  if (hasThemed) return buildThemeBreakdown(tasks || [], themes || [], themeMap);
  return buildContextBreakdown(tasks || []);
}

function buildThemeBreakdown(tasks, themes, themeMap) {
  const topLevel = themes
    .filter((t) => !t.parent_theme_id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const subthemesByParent = {};
  themes.filter((t) => t.parent_theme_id).forEach((t) => {
    (subthemesByParent[t.parent_theme_id] ||= []).push(t);
  });

  const buckets = topLevel.map((th) => {
    const all = tasks.filter((t) => t.theme_id === th.id);
    const subsForTheme = (subthemesByParent[th.id] || [])
      .map((st) => {
        const ts = tasks.filter((t) => t.theme_id === st.id);
        const d = ts.filter(isTaskDone).length;
        return { name: st.title, total: ts.length, done: d, pct: ts.length ? Math.round((d / ts.length) * 100) : 0 };
      })
      .filter((s) => s.total > 0);
    // tasks directly under the top theme (not under a subtheme) → "Algemeen" sub
    const direct = all.filter((t) => !subthemesByParent[th.id]?.some((st) => st.id === t.theme_id));
    if (direct.length) {
      const d = direct.filter(isTaskDone).length;
      subsForTheme.unshift({ name: "Algemeen", total: direct.length, done: d, pct: direct.length ? Math.round((d / direct.length) * 100) : 0 });
    }
    const done = all.filter(isTaskDone).length;
    return { id: th.id, name: th.title, isTheme: true, total: all.length, done, pct: all.length ? Math.round((done / all.length) * 100) : 0, subs: subsForTheme };
  });

  // unthemed / orphan bucket
  const unthemed = tasks.filter((t) => !t.theme_id || !themeMap.has(t.theme_id));
  if (unthemed.length) {
    const subs = {};
    unthemed.forEach((t) => {
      const { sub } = parseContext(t.context);
      (subs[sub] ||= []).push(t);
    });
    const subArr = Object.entries(subs).map(([name, ts]) => {
      const d = ts.filter(isTaskDone).length;
      return { name, total: ts.length, done: d, pct: ts.length ? Math.round((d / ts.length) * 100) : 0 };
    });
    const done = unthemed.filter(isTaskDone).length;
    buckets.push({ id: "_algemeen", name: "Algemeen", isTheme: false, total: unthemed.length, done, pct: unthemed.length ? Math.round((done / unthemed.length) * 100) : 0, subs: subArr });
  }
  return buckets;
}

function buildContextBreakdown(tasks) {
  const map = {};
  tasks.forEach((t) => {
    const { ond, sub } = parseContext(t.context);
    if (!map[ond]) map[ond] = { name: ond, tasks: [], subs: {} };
    map[ond].tasks.push(t);
    if (!map[ond].subs[sub]) map[ond].subs[sub] = [];
    map[ond].subs[sub].push(t);
  });
  return Object.values(map).map((o) => {
    const total = o.tasks.length;
    const done = o.tasks.filter(isTaskDone).length;
    const subs = Object.entries(o.subs).map(([name, ts]) => {
      const d = ts.filter(isTaskDone).length;
      return { name, total: ts.length, done: d, pct: ts.length ? Math.round((d / ts.length) * 100) : 0 };
    });
    return { name: o.name, total, done, pct: total ? Math.round((done / total) * 100) : 0, subs };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

/** Weighted progress — each bucket counts equally so a giant open bucket
 *  isn't drowned out. Reflects ALL tasks (themed + unthemed), avoiding the
 *  misleading 0% when unthemed tasks exist alongside themed ones. */
export function weightedProgress(tasks, themes = []) {
  const bd = buildBreakdown(tasks, themes);
  if (!bd.length) return 0;
  return Math.round(bd.reduce((a, o) => a + o.pct, 0) / bd.length);
}

const PROJECT_NOTES = {
  "GIULIA": "Groot ontwikkeltraject — OS, agent en interface lopen parallel.",
  "BOGÈST": (tasks) => {
    const open = tasks.filter((t) => (t.context || "").toLowerCase().includes("laatste fase") && !isTaskDone(t)).length;
    return `Website en Digital Host zijn vrijwel afgerond. ${open} punten uit de laatste klantmeeting moeten nog worden verwerkt.`;
  },
  "RHYTHMS OF REGULATION": "Boekontwikkeling is ver gevorderd. Fashion film en subsidieaanvraag zijn de belangrijkste actieve onderdelen.",
  "WOVEN MEMORIES": "Volgende kritieke stap: subsidieaanvraag afronden. Productie is afhankelijk van subsidie.",
  "AMOR VITAE": "Concept 2 is volledig uitgewerkt en werkend. Wacht op een afspraak met de klant voor feedback. Geen technische blokkades.",
  "TIM": "Huisstijl en website zijn volledig afgerond.",
};

/** GIULIA interprets the whole project into a short, human summary + next step. */
export function giuliaInterpret(project, tasks, themes = []) {
  const bd = buildBreakdown(tasks, themes);
  const progress = weightedProgress(tasks, themes);
  const done = tasks.filter(isTaskDone).length;
  const active = tasks.filter((t) => ["actief", "in_progress", "today"].includes(t.status));
  const waiting = tasks.filter((t) => ["wacht", "waiting"].includes(t.status));
  const spec = tasks.filter((t) => ["te_specifieren", "todo"].includes(t.status));

  const sorted = bd.slice().sort((a, b) => b.pct - a.pct);
  const leader = sorted[0] || null;
  const laggard = sorted[sorted.length - 1] || null;

  const noteRaw = PROJECT_NOTES[project.title];
  const note = typeof noteRaw === "function" ? noteRaw(tasks) : noteRaw || (project.next_milestone ? `Volgende stap: ${project.next_milestone}.` : "");

  const parts = [];
  parts.push(`Dit project staat op ${progress}% — ${done} van ${tasks.length} taken klaar.`);
  if (leader && laggard && leader.name !== laggard.name && leader.pct !== laggard.pct) {
    parts.push(`${leader.name} loopt voor (${leader.pct}%), ${laggard.name} volgt (${laggard.pct}%).`);
  }
  if (waiting.length) parts.push(`${waiting.length} taken wachten op vervolg.`);
  if (spec.length) parts.push(`${spec.length} onderdelen moeten nog worden gespecificeerd.`);
  if (note) parts.push(note);

  let nextStep = "";
  if (project.status === "waiting") nextStep = "Inplannen van de klantafspraak";
  else if (project.status === "afwerking") nextStep = "Openstaande puntjes uit de laatste meeting afronden";
  else if (project.status === "completed") nextStep = "Project is afgerond";
  else if (project.status === "paused") nextStep = "Project staat gepauzeerd";
  else if (laggard && laggard.pct < 50) nextStep = `Focus op ${laggard.name}`;
  else if (active.length) nextStep = `${active.length} actieve taken oppakken`;
  else if (waiting.length) nextStep = `Vervolg geven aan ${waiting.length} wachtende taken`;

  const insight = note
    || (laggard && laggard.pct < 50 ? `${laggard.name} heeft prioriteit.`
    : (active.length ? `${active.length} taken lopen nu.`
    : (tasks.length ? `${done} van ${tasks.length} taken klaar.` : "Project staat klaar om te starten.")));

  return { progress, done, total: tasks.length, active: active.length, waiting: waiting.length, spec: spec.length, summary: parts.join(" "), insight, nextStep };
}

/** Deterministic "Laat GIULIA dit toevoegen" parser — splits free text into
 *  actionable tasks on common Dutch connectors. (LLM refinement available
 *  when integration credits reset.) */
export function parseTasksFromText(text) {
  if (!text || !text.trim()) return [];
  return text
    .replace(/\s+(en|daarna|vervolgens|dan|eerst|toen)\s+/gi, "|||")
    .replace(/,\s*/g, "|||")
    .split("|||")
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
}