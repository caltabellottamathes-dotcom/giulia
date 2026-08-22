import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader, URGENT } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusTodo;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const NEUT = "hsl(var(--smoke))";
const IVORY = "hsl(var(--ivory))";
const DUR_MIN = 15, DUR_MAX = 240, H_MIN = 18, H_MAX = 78;

const durHeight = (dur) => {
  const d = Math.max(DUR_MIN, Math.min(DUR_MAX, dur || 60));
  return Math.round(H_MIN + ((d - DUR_MIN) / (DUR_MAX - DUR_MIN)) * (H_MAX - H_MIN));
};

function PlanningBars({ items }) {
  return (
    <div className="flex items-end gap-2 h-[96px] w-full">
      {items.map((it, i) => {
        const num = String(i + 1).padStart(2, "0");
        const color = it.color || LIGHT;
        const status = it.active ? "active" : it.done ? "done" : "idle";
        const targetH = status === "done" ? durHeight(it.duration) : 16;
        return (
          <div key={it.id || i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span className="text-[12px] font-display font-bold tabular-nums leading-none mb-1" style={{ color: status === "done" ? color : "rgba(255,255,255,0.4)" }}>{num}</span>
            {status === "active" && (
              <motion.span className="mb-1 h-4 w-4 rounded-full" style={{ background: color }} animate={{ y: [0, -9, 0] }} transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }} />
            )}
            <motion.div className="w-full rounded-[10px]" animate={{ height: targetH }} transition={{ type: "spring", stiffness: 180, damping: 20 }} style={{ height: 16, backgroundColor: status === "done" ? color : "rgba(255,255,255,0.16)" }} />
          </div>
        );
      })}
    </div>
  );
}

/** TasksBloomFocusWidget — "To Do!" · 9:16 · JeDag-systeem.
 *  PhotoShell (boven): header + titel + datum + glaspill-items (open Focus-taken).
 *  GlassShell (onder): staafgrafiek met bounce-dots per taak. Afvinken via de
 *  pillen (idle → active → done). Focus-kleuren: plum / pistachio / urgent. */
export default function TasksBloomFocusWidget() {
  const { openModule } = usePanel();
  const { data: tasks } = useEntityList("Task", { sort: "-created_date", limit: 80, realtime: true });
  const [states, setStates] = useState({});

  const focus = useMemo(() => (tasks || []).filter((t) => t.domain === "focus" && !["completed", "archived"].includes(t.status)).slice(0, 5), [tasks]);
  const total = (tasks || []).filter((t) => t.domain === "focus").length;
  const doneCount = (tasks || []).filter((t) => t.domain === "focus" && t.status === "completed").length;

  const PALETTE = [LIGHT, NEUT, LIGHT];
  const items = focus.map((t, i) => {
    const st = states[i] || "idle";
    const overdue = t.deadline && new Date(t.deadline) < new Date(new Date().toDateString());
    const color = overdue ? URGENT : PALETTE[i % 3];
    return { id: t.id, title: t.title, duration: t.estimated_duration || 60, urgent: overdue, done: st === "done", active: st === "active", color };
  });

  const toggle = (i, t) => {
    setStates((s) => {
      const cur = s[i] || "idle";
      const next = cur === "idle" ? "active" : cur === "active" ? "done" : "idle";
      if (next === "done") base44.entities.Task.update(t.id, { status: "completed" }).catch(() => {});
      if (next === "idle") base44.entities.Task.update(t.id, { status: "todo" }).catch(() => {});
      return { ...s, [i]: next };
    });
  };

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  const weekday = now.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayNum = now.getDate();
  const month = now.toLocaleDateString("nl-NL", { month: "short" });
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return (
    <WidgetShell domain="focus" radius="large" className="w-full h-[480px] min-h-0">
      <img src={PHOTO} alt="To Do" className="absolute inset-0 w-full h-full object-cover" />
      <button type="button" onClick={() => openModule("tasks")} aria-label="Open Tasks" className="absolute inset-0 z-0 cursor-pointer" />

      {/* PhotoShell — glaspill items bovenin */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-3 flex flex-col" style={{ color: IVORY, height: "56%", background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))" }}>
        <WidgetHeader type="tasks" label="To Do!" count={total ? `${doneCount}/${total}` : ""} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">GET IT DONE.</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{weekday} {dayNum} {month} · {hh}:{mm}</p>
        <div className="mt-2.5 flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
          {items.length === 0 ? (
            <p className="text-[11px] text-ivory/55">Geen open taken.</p>
          ) : items.map((it, i) => {
            const st = states[i] || "idle";
            return (
              <button key={it.id} onClick={() => toggle(i, it)} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-left transition-colors"
                style={{ background: st === "active" ? "rgba(216,218,179,0.18)" : "rgba(255,255,255,0.06)", border: `1px solid ${st === "done" || st === "active" ? it.color : "rgba(255,255,255,0.16)"}` }}>
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: it.color }} />
                <span className="text-[12px] truncate flex-1" style={{ color: st === "done" ? "rgba(255,255,255,0.5)" : LIGHT, textDecoration: st === "done" ? "line-through" : "none" }}>{it.title}</span>
                {it.urgent && <span className="text-[8px] uppercase font-bold" style={{ color: URGENT }}>!</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[44%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      {/* Glass Shell — staafgrafiek met bounce dots */}
      <div className="absolute inset-x-0 bottom-0 h-[44%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: LIGHT }}>Planning</span>
          <span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{doneCount}/{total} gedaan</span>
        </div>
        <div className="flex-1 flex items-end" onClick={(e) => e.stopPropagation()}>
          {items.length === 0 ? <p className="text-[11px] text-ivory/55 m-auto">Geen taken.</p> : <PlanningBars items={items} />}
        </div>
      </div>
    </WidgetShell>
  );
}