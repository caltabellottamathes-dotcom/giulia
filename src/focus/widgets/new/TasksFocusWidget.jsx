import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PhotoGlassLayeredWidget, WidgetHeader, URGENT } from "@/system/widgets/primitives";
import { layeredContentPad } from "@/system/widgets/primitives/shellCode";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusCarrels;
const LIGHT = "hsl(var(--d-focus-light))";
const NEUT = "hsl(var(--smoke))";
const DUR_MIN = 15, DUR_MAX = 240, H_MIN = 18, H_MAX = 78;

function durHeight(dur) {
  const d = Math.max(DUR_MIN, Math.min(DUR_MAX, dur || 60));
  return Math.round(H_MIN + ((d - DUR_MIN) / (DUR_MAX - DUR_MIN)) * (H_MAX - H_MIN));
}

function PlanningBars({ items }) {
  return (
    <div className="flex items-end gap-2 h-[92px]">
      {items.map((it, i) => {
        const num = String(i + 1).padStart(2, "0");
        const color = it.color || "var(--tile-accent)";
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

/** TasksFocusWidget — P·16x9·L·SIDE · "To Do!"
 *  Foto = focusCarrels. Live staafgrafiek per taak (done → staaf groeit op
 *  basis van estimated_duration) + afvinkbare checklist. Data: Task (focus).
 *  Afvinken zet de taak op completed. Burgundy/cream. */
export default function TasksFocusWidget() {
  const { openModule } = usePanel();
  const { data: tasks } = useEntityList("Task", { sort: "-created_date", limit: 80, realtime: true });
  const [states, setStates] = useState({});

  const focus = useMemo(() => (tasks || []).filter((t) => t.domain === "focus" && !["completed", "archived"].includes(t.status)).slice(0, 6), [tasks]);
  const total = (tasks || []).filter((t) => t.domain === "focus").length;
  const doneCount = (tasks || []).filter((t) => t.domain === "focus" && t.status === "completed").length;

  const PALETTE = ["var(--tile-accent)", NEUT, LIGHT];
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
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget shape="16:9" photo={PHOTO} glassPosition="left" glassFraction={0.40} overhang={0} domain="focus" radius="large" onClick={() => openModule("tasks")} overlay="bg-gradient-to-t from-black/45 via-black/22 to-black/12"
        photoChildren={
          <div className="absolute inset-0 flex flex-col gap-2" style={layeredContentPad("left", 0.40)}>
            <WidgetHeader type="tasks" label="To Do!" count={total ? `${doneCount}/${total}` : ""} />
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">GET IT DONE.</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{weekday} {dayNum} {month} · {hh}:{mm}</p>
            <div className="flex-1 min-h-2" />
            <PlanningBars items={items} />
          </div>
        }
      >
        <div className="flex flex-col gap-0.5 h-full overflow-hidden -mx-1 px-1" onClick={(e) => e.stopPropagation()}>
          {items.length === 0 ? (
            <p className="text-[11px] text-white/70 px-2 py-1">Geen open taken.</p>
          ) : items.map((it, i) => (
            <button key={it.id || i} onClick={() => toggle(i, it)} className="flex items-center gap-2 py-1 text-left">
              <span className="h-4 w-4 rounded-full border shrink-0 flex items-center justify-center" style={{ borderColor: it.done ? it.color : "rgba(255,255,255,0.3)", background: it.done ? it.color : "transparent" }}>
                {it.done && <Check className="h-2.5 w-2.5 text-ivory" />}
              </span>
              <span className="text-[12px] truncate" style={{ color: it.done ? "rgba(255,255,255,0.5)" : "hsl(var(--ivory))", textDecoration: it.done ? "line-through" : "none" }}>{it.title}</span>
            </button>
          ))}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}