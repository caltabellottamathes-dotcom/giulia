import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";

const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const URGENT = "hsl(var(--d-focus-urgent))";

const ACTIVE = ["in_progress", "planning", "review", "afwerking"];

/**
 * ProjectsFocusWidget — P·3x2·R·SIDE · "What I'm Building."
 * Foto = focusConcreteHand (hand op beton). Foto-kant: header + XL telling
 * actieve projecten. Glass-card (rechts): project-rijen met voortgangsbalk;
 * critical-health → urgent-geel.
 */
export default function ProjectsFocusWidget() {
  const { openModule } = usePanel();
  const { data: projects } = useEntityList("Project", { sort: "-created_date", limit: 80, realtime: true });

  const active = useMemo(() => (projects || []).filter((p) => ACTIVE.includes(p.status)).slice(0, 4), [projects]);
  const count = (projects || []).filter((p) => ACTIVE.includes(p.status)).length;

  return (
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget
        shape="3:2"
        photo={IMAGES.focusConcreteHand}
        glassPosition="right"
        glassFraction={0.5}
        overhang={0.08}
        domain="focus"
        radius="large"
        onClick={() => openModule("projects")}
        overlay="bg-gradient-to-t from-zinc-900/55 via-zinc-900/20 to-transparent"
        photoChildren={
          <div className="absolute inset-0 flex flex-col p-4 text-ivory">
            <WidgetHeader type="tasks" label="What I'm Building." count={count ? String(count) : ""} />
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">UNDER CONSTRUCTION.</h3>
            <div className="flex items-end gap-2 mt-2">
              <motion.span className="text-[44px] font-display font-semibold leading-none tabular-nums" style={{ color: LIGHT }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>{count}</motion.span>
              <span className="text-[10px] uppercase tracking-[0.18em] pb-1 text-ivory/50">actieve projecten</span>
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {active.length === 0 ? (
            <p className="text-[11px] text-ivory/60 px-1 py-1">Geen actieve projecten.</p>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar -mx-1 px-1">
              {active.map((p, i) => {
                const crit = p.health === "critical";
                return (
                  <div key={p.id || i} className="py-1.5 border-b border-white/10 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-medium leading-tight truncate text-ivory">{p.title}</p>
                      <span className="text-[9px] font-mono tabular-nums shrink-0" style={{ color: crit ? URGENT : LIGHT }}>{p.progress || 0}%</span>
                    </div>
                    <div className="relative h-1 rounded-full bg-white/15 mt-1">
                      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: crit ? URGENT : DEEP }} initial={{ width: 0 }} animate={{ width: `${p.progress || 0}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                    </div>
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