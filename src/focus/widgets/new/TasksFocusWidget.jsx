import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";

const DEEP = "hsl(var(--d-focus-deep))";   // burgundy
const LIGHT = "hsl(var(--d-focus-light))"; // cream
const URGENT = "hsl(var(--d-focus-urgent))";

const PRIO = { high: 0, medium: 1, low: 2 };

/**
 * TasksFocusWidget — P·2x3·B·SIDE · "To Do!"
 * Foto = focusCarrels (gestructureerde werkstations). Foto-kant: header
 * (animatie + titel) + completion-bar. Glass-card: open Focus-taken met
 * prioriteitsdot + deadline; overdues krijgen urgent-geel.
 */
export default function TasksFocusWidget() {
  const { openModule } = usePanel();
  const { data: tasks } = useEntityList("Task", { sort: "-created_date", limit: 80, realtime: true });

  const all = useMemo(() => (tasks || []).filter((t) => t.domain === "focus"), [tasks]);
  const open = useMemo(
    () => all.filter((t) => !["completed", "archived"].includes(t.status)).sort((a, b) => (PRIO[a.priority] ?? 3) - (PRIO[b.priority] ?? 3)).slice(0, 5),
    [all]
  );
  const total = all.length;
  const done = all.filter((t) => t.status === "completed").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="w-full h-[440px]">
      <PhotoGlassLayeredWidget
        shape="2:3"
        photo={IMAGES.focusCarrels}
        glassPosition="bottom"
        glassFraction={0.56}
        overhang={0.06}
        domain="focus"
        radius="large"
        onClick={() => openModule("tasks")}
        overlay="bg-gradient-to-t from-zinc-900/55 via-zinc-900/20 to-transparent"
        photoChildren={
          <div className="absolute inset-0 flex flex-col p-4 text-ivory">
            <WidgetHeader type="tasks" label="To Do!" count={total ? `${done}/${total}` : ""} />
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">GET IT DONE.</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{done} van {total} klaar</p>
            <div className="flex-1" />
            <div className="relative h-1.5 rounded-full bg-white/15">
              <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: DEEP }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {open.length === 0 ? (
            <p className="text-[11px] text-ivory/60 px-1 py-1">Geen open taken.</p>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar -mx-1 px-1">
              {open.map((t, i) => {
                const overdue = t.deadline && new Date(t.deadline) < new Date(new Date().toDateString());
                const dot = overdue ? URGENT : t.priority === "high" ? DEEP : t.priority === "medium" ? LIGHT : "rgba(255,255,255,0.4)";
                return (
                  <div key={t.id || i} className="flex items-start gap-2.5 py-1.5 border-b border-white/10 last:border-0">
                    <span className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ background: dot }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium leading-tight truncate text-ivory">{t.title}</p>
                      {t.deadline && <p className="text-[10px] text-ivory/45">{new Date(t.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>}
                    </div>
                    {overdue && <span className="text-[8px] uppercase tracking-[0.15em] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: URGENT, color: "#1a1a1a" }}>!</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}