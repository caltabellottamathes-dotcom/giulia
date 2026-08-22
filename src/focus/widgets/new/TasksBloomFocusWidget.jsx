import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const IVORY = "hsl(var(--ivory))";

/** TasksBloomFocusWidget — "To Do!" · 9:16 foto-shell + glas.
 *  Boven: header + titel + eerstvolgende open Focus-taken. Glas-onder:
 *  ademende bloom met het aantal open taken. Tik opent Tasks.
 *  Data: Task (domain focus, status ≠ completed/archived). */
export default function TasksBloomFocusWidget() {
  const { openModule } = usePanel();
  const { data: tasks } = useEntityList("Task", { sort: "-created_date", limit: 80, realtime: true });

  const open = useMemo(
    () => (tasks || []).filter((t) => t.domain === "focus" && !["completed", "archived"].includes(t.status)),
    [tasks]
  );
  const count = open.length;
  const recent = open.slice(0, 3);

  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const loop = () => {
      const t = performance.now() / 1000;
      const speed = count > 0 ? 1.8 : 1.0;
      const breath = 0.10 * Math.sin(t * speed);
      const scale = 0.9 + (count > 0 ? 0.16 : 0.05) + breath;
      const opacity = 0.6 + (count > 0 ? 0.25 : 0.05) + 0.04 * Math.sin(t * speed);
      const el = bloomRef.current;
      if (el) { el.style.transform = `scale(${scale})`; el.style.opacity = String(opacity); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count]);

  const statusLabel = count > 0 ? `${count} TE DOEN` : "GEREED";
  const statusColor = count > 0 ? LIGHT : "rgba(255,255,255,0.55)";

  return (
    <WidgetShell domain="focus" radius="large" className="w-full h-[480px] min-h-0">
      <img src={IMAGES.focusTodo} alt="To Do" className="absolute inset-0 w-full h-full object-cover" />
      <button type="button" onClick={() => openModule("tasks")} aria-label="Open Tasks" className="absolute inset-0 z-0 cursor-pointer" />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-10 bg-gradient-to-b from-black/50 to-transparent" style={{ color: IVORY }}>
        <WidgetHeader label="To Do!" type="tasks" count={count ? String(count) : ""} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">GET IT DONE.</h3>
        <div className="mt-2 space-y-1.5">
          {recent.length === 0 ? (
            <p className="text-[11px] text-ivory/55">Geen open taken.</p>
          ) : recent.map((t, i) => (
            <div key={t.id || i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: t.priority === "high" ? LIGHT : DEEP }} />
              <p className="text-[11px] leading-tight line-clamp-2 text-ivory/80">{t.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[64%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[200px] rounded-t-[28px] flex flex-col items-center px-4 pt-3.5 pb-4 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <div className="flex items-center gap-2 shrink-0 self-start">
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: count > 0 ? LIGHT : "rgba(255,255,255,0.4)" }} animate={count > 0 ? { scale: [1, 1.7, 1], opacity: [1, 0.5, 1] } : {}} transition={{ duration: 0.9, repeat: count > 0 ? Infinity : 0, ease: "easeInOut" }} />
          <span className="text-[9px] uppercase tracking-[0.32em] font-bold" style={{ color: statusColor }}>{statusLabel}</span>
        </div>
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          <button onClick={() => openModule("tasks")} aria-label="Open Tasks" className="relative h-[150px] w-[150px] rounded-full cursor-pointer" style={{ border: "none", background: "transparent" }}>
            <span ref={bloomRef} className="absolute inset-0 rounded-full will-change-transform" style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 48%, transparent 72%)`, filter: "blur(2px)", opacity: 0.92 }} />
            <span className="absolute inset-0 flex items-center justify-center text-[44px] font-display font-bold tabular-nums" style={{ color: IVORY }}>{count}</span>
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}