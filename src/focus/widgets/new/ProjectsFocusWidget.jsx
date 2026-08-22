import React from "react";
import { motion } from "framer-motion";
import { GlassPhotoLayeredWidget, WidgetHeader, CountUp, URGENT } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusBuild;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const IVORY = "hsl(var(--ivory))";
const ACTIVE = ["in_progress", "planning", "review", "afwerking"];

/** ProjectsFocusWidget — G·4:3·R·SIDE · "What I'm Building."
 *  Foto = focusConcreteHand. Ghost-getal actieve projecten + project-rijen
 *  met voortgangsbalk (critical → urgent-geel). Data: Project. */
export default function ProjectsFocusWidget() {
  const { openModule } = usePanel();
  const { data: projects, loading } = useEntityList("Project", { sort: "-created_date", limit: 80, realtime: true });

  const active = (projects || []).filter((p) => ACTIVE.includes(p.status));
  const total = active.length;
  const top4 = active.slice(0, 4);

  return (
    <div className="w-full h-[340px]">
      <GlassPhotoLayeredWidget shape="4:3" photo={PHOTO} photoPosition="right" photoFraction={0.42} overhang={0} domain="focus" radius="large" onClick={() => openModule("projects")} photoOverlay="bg-gradient-to-t from-black/45 via-black/12 to-transparent">
        <div className="pointer-events-none absolute" style={{ left: "44%", bottom: "0%", transform: "translateX(-50%)" }}>
          <span style={{ color: LIGHT, opacity: 0.32 }}>
            <CountUp value={total} className="text-[320px] font-display font-black leading-none tracking-[-0.06em]" />
          </span>
        </div>

        <WidgetHeader type="tasks" label="What I'm Building." count={total ? String(total) : ""} />
        <div className="flex-1 min-h-2" />

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-5"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : top4.length > 0 ? (
            top4.map((p, i) => {
              const crit = p.health === "critical";
              const color = crit ? URGENT : LIGHT;
              return (
                <motion.button key={p.id} onClick={(e) => { e.stopPropagation(); openModule("projects"); }} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }} className="group w-full text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[14px] font-display font-bold uppercase tracking-[0.01em] leading-tight truncate" style={{ color: IVORY }}>{p.title}</span>
                    <span className="text-[11px] font-mono tabular-nums shrink-0" style={{ color: crit ? URGENT : LIGHT }}>{p.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${p.progress || 0}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.08 }} style={{ backgroundColor: color }} />
                  </div>
                </motion.button>
              );
            })
          ) : (
            <p className="text-[12px] py-4 font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Geen actieve projecten.</p>
          )}
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}