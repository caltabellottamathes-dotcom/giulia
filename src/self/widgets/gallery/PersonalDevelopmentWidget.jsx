import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { PhotoCard, BehindCard } from "@/self/widgets/gallery/GlassPhoto";

const PLUM = "hsl(var(--self-primary))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const INK = "hsl(var(--foreground))";

/** PersonalDevelopmentWidget — glas + fotokaarten. Growth map op het glas;
 *  SELF-foto onder, crisp kaart boven. Nodes groeien met progress. */
export default function PersonalDevelopmentWidget() {
  const { openModule } = usePanel();
  const { data: goals } = useEntityList("SelfGoal", { realtime: true });
  const active = useMemo(() => (goals || []).filter((g) => g.status === "active"), [goals]);
  const areas = useMemo(() => {
    const m = {};
    active.forEach((g) => { const a = g.area || "Overig"; (m[a] = m[a] || []).push(g); });
    return Object.entries(m).map(([area, gs]) => ({ area, avg: gs.reduce((s, g) => s + (g.progress || 0), 0) / gs.length, count: gs.length }));
  }, [active]);
  const placed = areas.slice(0, 6).map((a, i, arr) => {
    const ang = (i / Math.max(1, arr.length)) * Math.PI * 2 - Math.PI / 2;
    return { ...a, x: 100 + Math.cos(ang) * 72, y: 70 + Math.sin(ang) * 52 };
  });

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdevelopment")}
      className="lg:col-span-2 min-h-[320px] text-foreground"
      style={{ "--tile-accent": SAGE_DEEP }}>
      <div className="relative h-full p-6 overflow-hidden">
        <BehindCard src={IMAGES.selfDevelopment} className="absolute left-3 top-3 w-[40%] h-[34%] z-0" dim={0.16} />

        <div className="relative z-10 flex flex-col h-full">
          <WidgetHeader label="Personal Development" count={`${active.length} actief`} />
          <h3 className="text-[34px] leading-none font-display font-semibold tracking-[-0.03em] mt-2" style={{ color: INK }}>DEVELOPING</h3>

          <div className="relative flex-1 min-h-[150px] mt-2">
            <svg viewBox="0 0 200 140" className="w-full h-full">
              {placed.map((a, i) => {
                const grow = a.avg / 100;
                return (
                  <g key={a.area}>
                    <motion.line x1="100" y1="70" x2={a.x} y2={a.y} stroke={SAGE_DEEP} strokeWidth={1 + grow * 4}
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ duration: 1, delay: i * 0.1 }} />
                    <motion.circle cx={a.x} cy={a.y} r={6 + grow * 10} fill={SAGE_DEEP} fillOpacity={0.22} stroke={SAGE_DEEP} strokeWidth="1.5"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} />
                  </g>
                );
              })}
              <circle cx="100" cy="70" r="5" fill={PLUM} />
            </svg>
            {placed.map((a) => (
              <span key={a.area} className="absolute text-[8px] uppercase tracking-wider font-semibold whitespace-nowrap" style={{ left: `${(a.x / 200) * 100}%`, top: `${(a.y / 140) * 100}%`, transform: "translate(-50%, -140%)", color: INK }}>{a.area}</span>
            ))}
          </div>

          <div className="flex items-end gap-4 pt-3 border-t border-foreground/10">
            <p className="text-[28px] font-display font-semibold tabular-nums" style={{ color: PLUM }}>{areas.length}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1.5" style={{ color: INK }}>development areas</p>
          </div>
        </div>

        <PhotoCard src={IMAGES.selfBlazers} className="absolute right-5 bottom-5 w-[26%] h-[24%] z-20" />
      </div>
    </WidgetShell>
  );
}