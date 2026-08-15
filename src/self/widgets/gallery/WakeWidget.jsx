import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { PhotoCard, BehindCard } from "@/self/widgets/gallery/GlassPhoto";

const PLUM = "hsl(var(--self-primary))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const URGENT = "hsl(var(--self-urgent))";
const INK = "hsl(var(--foreground))";
const PHASES = ["wake", "orient", "getup", "routine", "briefing", "complete"];

/** WakeWidget — glas + fotokaarten. Atmospheric progress-arc op het glas;
 *  SELF-foto onder (matglas) + crisp kaart boven. */
export default function WakeWidget() {
  const { openModule } = usePanel();
  const { data: sessions } = useEntityList("WakeSession", { realtime: true, sort: "-created_date", limit: 1 });
  const s = (sessions || [])[0];
  const phase = s?.phase || "wake";
  const idx = Math.max(0, PHASES.indexOf(phase));
  const pct = Math.round((idx / (PHASES.length - 1)) * 100);
  const now = new Date();
  const time = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const day = now.toLocaleDateString("nl-NL", { weekday: "long" });

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfwake")}
      className="lg:col-span-2 min-h-[340px] text-foreground"
      style={{ "--tile-accent": SAGE_DEEP }}>
      <div className="relative h-full p-6 overflow-hidden">
        <BehindCard src={IMAGES.selfWake} className="absolute -left-4 top-4 w-[44%] h-[44%] z-0" dim={0.16} />

        <div className="relative z-10 flex flex-col h-full">
          <WidgetHeader label="Wake" count={phase} />
          <h3 className="text-[42px] leading-[0.82] font-display font-semibold tracking-[-0.04em] mt-3" style={{ color: INK }}>GOOD<br />MORNING</h3>
          <div className="flex items-end gap-4 mt-2">
            <span className="text-[28px] font-display font-semibold tabular-nums" style={{ color: PLUM }}>{time}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-1" style={{ color: INK }}>{day}</span>
          </div>

          <div className="relative flex-1 flex items-center justify-center min-h-[140px] mt-2">
            <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
              <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(40,30,40,0.14)" strokeWidth="10" strokeLinecap="round" />
              <motion.path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={pct >= 80 ? SAGE_DEEP : URGENT} strokeWidth="10" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: pct / 100 }} transition={{ duration: 1.3, ease: "easeInOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-[38px] font-display font-semibold tabular-nums leading-none" style={{ color: PLUM }}>{pct}%</span>
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1" style={{ color: INK }}>wake</span>
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] opacity-55 text-center" style={{ color: INK }}>Phase · {phase}</p>
        </div>

        <PhotoCard src={IMAGES.selfHallway} className="absolute right-5 bottom-5 w-[28%] h-[24%] z-20" />
      </div>
    </WidgetShell>
  );
}