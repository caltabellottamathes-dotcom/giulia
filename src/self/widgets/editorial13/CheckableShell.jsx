import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";

/* ── Reeks 13 — interactieve, afvinkbare widgets (glas-op-foto) ────────── */

/** Lokale checklist met check & sluiten. */
export function useChecklist(seed) {
  const [items, setItems] = useState(() => seed.map((s) => ({ ...s, done: false })));
  const [closed, setClosed] = useState(false);
  const toggle = (i) => setItems((arr) => arr.map((it, k) => (k === i ? { ...it, done: !it.done } : it)));
  const doneCount = items.filter((it) => it.done).length;
  const allDone = items.length > 0 && doneCount === items.length;
  const close = () => setClosed(true);
  const reopen = () => { setClosed(false); setItems(seed.map((s) => ({ ...s, done: false }))); };
  return { items, toggle, doneCount, total: items.length, allDone, closed, close, reopen };
}

const SAMPLE = [
  { label: "Eerste focus-blok", sub: "09:00 · diep werk" },
  { label: "Belafspraak voorbereiden", sub: "11:00" },
  { label: "Mail wegwerken", sub: "13:00" },
  { label: "Review met team", sub: "15:30" },
];

/** Checklist gekoppeld aan echte Task-records (status today/todo → completed). */
export function useTaskChecklist() {
  const [items, setItems] = useState([]);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    let m = true;
    (async () => {
      let tasks = [];
      try {
        tasks = await base44.entities.Task.filter({ status: { $in: ["today", "todo", "upcoming", "in_progress"] } }, "-created_date", 7);
      } catch { /* ignore */ }
      if (!m) return;
      setItems(tasks.length
        ? tasks.map((t) => ({ id: t.id, label: t.title, sub: t.category || t.deadline || "vandaag", done: t.status === "completed" }))
        : SAMPLE.map((s) => ({ ...s })));
    })();
    return () => { m = false; };
  }, []);
  const toggle = (i) => {
    const it = items[i];
    const next = !it.done;
    setItems((arr) => arr.map((x, k) => (k === i ? { ...x, done: next } : x)));
    if (it.id) { base44.entities.Task.update(it.id, { status: next ? "completed" : "today" }).catch(() => {}); }
  };
  const doneCount = items.filter((x) => x.done).length;
  const allDone = items.length > 0 && doneCount === items.length;
  const close = () => setClosed(true);
  const reopen = () => { setClosed(false); setItems((arr) => arr.map((x) => ({ ...x, done: false }))); };
  return { items, toggle, doneCount, total: items.length, allDone, closed, close, reopen };
}

/** Checklist gekoppeld aan de agenda van vandaag (CalendarEvent). Geen taken,
 *  geen andere dingen — enkel wat er vandaag op de agenda staat. Afvinken is
 *  lokaal (agenda-afspraken zijn geen "taak" die afgesloten wordt). */
export function useAgendaChecklist() {
  const [items, setItems] = useState([]);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    let m = true;
    (async () => {
      const n = new Date();
      const startISO = new Date(n.getFullYear(), n.getMonth(), n.getDate()).toISOString();
      const endISO = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).toISOString();
      let evs = [];
      try {
        evs = await base44.entities.CalendarEvent.filter({ start: { $gte: startISO, $lt: endISO } }, "start", 30);
      } catch { /* ignore */ }
      if (!m) return;
      setItems(
        evs.map((e) => {
          const t = e.start ? new Date(e.start) : null;
          const time = t ? t.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "";
          return { id: e.id, label: e.title, sub: [time, e.location].filter(Boolean).join(" · "), done: false };
        })
      );
    })();
    return () => { m = false; };
  }, []);
  const toggle = (i) => setItems((arr) => arr.map((x, k) => (k === i ? { ...x, done: !x.done } : x)));
  const doneCount = items.filter((x) => x.done).length;
  const total = items.length;
  const allDone = total > 0 && doneCount === total;
  const close = () => setClosed(true);
  const reopen = () => { setClosed(false); setItems((arr) => arr.map((x) => ({ ...x, done: false }))); };
  return { items, toggle, doneCount, total, allDone, closed, close, reopen };
}

/** Grote geanimeerde voortgangsring. */
function ProgressRing({ value, size = 84, stroke = 8, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} animate={{ strokeDashoffset: off }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-display font-semibold tabular-nums text-white">{Math.round(value * 100)}%</span>
      </div>
    </div>
  );
}

function Row({ it, onToggle, accent }) {
  return (
    <motion.button type="button" onClick={onToggle} layout
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 mb-1.5 text-left transition-colors"
      style={{ background: it.done ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      <span className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        style={{ borderColor: it.done ? accent : "rgba(255,255,255,0.55)", background: it.done ? accent : "transparent" }}>
        {it.done && <Check className="h-3 w-3" style={{ color: "rgba(20,22,26,0.8)" }} strokeWidth={3} />}
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-medium leading-tight truncate ${it.done ? "text-white/45 line-through" : "text-white"}`}>{it.label}</p>
        {it.sub && <p className={`text-[10px] truncate ${it.done ? "text-white/30" : "text-white/55"}`}>{it.sub}</p>}
      </div>
    </motion.button>
  );
}

/** CheckableShell — foto + glas + grote ring + afvinklijst + sluiten. */
export default function CheckableShell({ photo, title, subtitle, accent, items, toggle, doneCount, total, allDone, closed, close, reopen, ratio = "aspect-[3/4]" }) {
  const pct = total ? doneCount / total : 0;
  return (
    <div className={`relative w-full ${ratio} rounded-[28px] overflow-hidden`}>
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,24,0.88) 6%, rgba(18,20,24,0.30) 46%, rgba(18,20,24,0.58) 100%)" }} />
      <div className="absolute inset-0" style={{ background: accent, mixBlendMode: "multiply", opacity: 0.16 }} />
      {/* grote ghosted index */}
      <span className="absolute right-3 bottom-2 text-[88px] font-display font-bold leading-none text-white/10 select-none pointer-events-none">{Math.round(pct * 100)}</span>

      <div className="relative h-full flex flex-col p-4">
        {!closed ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60">{subtitle}</p>
                <h3 className="text-2xl font-display font-semibold text-white leading-tight mt-0.5 truncate">{title}</h3>
              </div>
              <ProgressRing value={pct} color={accent} />
            </div>
            <div className="mt-3 flex-1 min-h-0 overflow-auto -mr-1 pr-1">
              <AnimatePresence>
                {items.map((it, i) => <Row key={i} it={it} onToggle={() => toggle(i)} accent={accent} />)}
              </AnimatePresence>
            </div>
            <div className="mt-2">
              {allDone ? (
                <motion.button onClick={close} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-full py-2.5 text-sm font-bold text-black shadow-lg" style={{ background: accent }}>
                  Markeer als gedaan & sluiten
                </motion.button>
              ) : (
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-white/60">{doneCount} van {total} stappen</span>
                  <span className="text-xs font-semibold text-white/80">{Math.round(pct * 100)}%</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="h-20 w-20 rounded-full flex items-center justify-center mb-4" style={{ background: accent }}>
              <Check className="h-10 w-10" style={{ color: "rgba(20,22,26,0.85)" }} strokeWidth={3} />
            </motion.div>
            <h3 className="text-2xl font-display font-semibold text-white">Gedaan</h3>
            <p className="text-sm text-white/60 mt-1 mb-5 max-w-[220px]">{title} is afgerond en gesloten.</p>
            <button onClick={reopen} className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)" }}>
              <RotateCcw className="h-3.5 w-3.5" /> Heropenen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}