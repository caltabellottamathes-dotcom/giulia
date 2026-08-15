import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";

const SAGE = "hsl(var(--self-accent))";

/** PersonalDevelopmentWidget — "growth map". Radiale map: centraal punt met
 *  takken naar development-areas; lijn-dikte en node-grootte groeien met
 *  gemiddelde progress per gebied. Nodes evolueren zichtbaar. */
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
      className="lg:col-span-2 min-h-[320px]"
      style={{ background: "linear-gradient(150deg, hsl(var(--self-primary)) 0%, hsl(var(--self-primary-light)) 100%)", "--tile-accent": SAGE }}>
      <div className="p-6 h-full flex flex-col text-ivory">
        <WidgetHeader label="Personal Development" count={`${active.length} actief`} />
        <h3 className="text-[34px] leading-none font-display font-semibold tracking-[-0.03em] mt-2">DEVELOPING</h3>

        <div className="relative flex-1 min-h-[150px] mt-2">
          <svg viewBox="0 0 200 140" className="w-full h-full">
            {placed.map((a, i) => {
              const grow = a.avg / 100;
              return (
                <g key={a.area}>
                  <motion.line x1="100" y1="70" x2={a.x} y2={a.y} stroke={SAGE} strokeWidth={1 + grow * 4}
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.55 }} transition={{ duration: 1, delay: i * 0.1 }} />
                  <motion.circle cx={a.x} cy={a.y} r={6 + grow * 10} fill={SAGE} fillOpacity={0.22} stroke={SAGE} strokeWidth="1.5"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} />
                </g>
              );
            })}
            <circle cx="100" cy="70" r="5" fill="hsl(var(--ivory))" />
          </svg>
          {placed.map((a) => (
            <span key={a.area} className="absolute text-[8px] uppercase tracking-wider font-semibold whitespace-nowrap"
              style={{ left: `${(a.x / 200) * 100}%`, top: `${(a.y / 140) * 100}%`, transform: "translate(-50%, -140%)", color: SAGE }}>{a.area}</span>
          ))}
        </div>

        <div className="flex items-end gap-4 pt-3 border-t border-ivory/10">
          <p className="text-[28px] font-display font-semibold tabular-nums" style={{ color: SAGE }}>{areas.length}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1.5">development areas</p>
        </div>
      </div>
    </WidgetShell>
  );
}