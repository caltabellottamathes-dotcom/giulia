import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial/selfEditorial";
import { daysSince } from "./helpers";

/** PeopleOrbitUltimate — echte Contacten in een baan rond een foto-medaillon;
 *  plum = over tijd (dagen > gewenste frequentie), sage = up-to-date. · 1:1 */
export default function PeopleOrbitUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("Contact", { sort: "-last_contact_date", limit: 60, externalTick: learnTick });
  const scored = useMemo(() => (data || []).map((c) => {
    const d = daysSince(c.last_contact_date);
    const freq = c.desired_frequency_days || 30;
    return { ...c, days: d, overdue: d > freq };
  }).sort((a, b) => b.days - a.days).slice(0, 8), [data]);
  const overdue = scored.filter((c) => c.overdue).length;
  const N = Math.max(1, scored.length);
  const R = 38;

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("people")} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <WidgetHeader label="People Around Me." count={overdue ? `${overdue} over tijd` : "up-to-date"} />
        <div className="flex-1 relative min-h-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute h-full w-full max-w-[170px] max-h-[170px]">
            <circle cx="50" cy="50" r={R} fill="none" stroke={PLUM_FAINT} strokeWidth="0.4" strokeDasharray="2 2" />
            {scored.map((c, i) => {
              const a = (i / N) * 2 * Math.PI - Math.PI / 2;
              const x = 50 + Math.cos(a) * R, y = 50 + Math.sin(a) * R;
              return <motion.line key={c.id} x1="50" y1="50" x2={x} y2={y} stroke={c.overdue ? PLUM : SAGE} strokeWidth="0.4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: c.overdue ? 0.7 : 0.35 }} transition={{ delay: 0.3 + i * 0.06, duration: 0.6 }} />;
            })}
          </svg>
          <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.4)]" style={{ "--tw-ring-color": PLUM }}>
            <img src={SELF_PHOTO.dailyState} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          {scored.map((c, i) => {
            const a = (i / N) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + Math.cos(a) * R, y = 50 + Math.sin(a) * R;
            return (
              <motion.span key={c.id} className="absolute h-2.5 w-2.5 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%`, background: c.overdue ? PLUM : SAGE }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: "backOut" }} title={`${c.name} · ${c.days}d`} />
            );
          })}
          {loading && <div className="absolute h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: PLUM_FAINT, borderTopColor: PLUM }} />}
        </div>
        <div className="flex items-end justify-between">
          <motion.h3 className="text-[26px] leading-none font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>MENSEN</motion.h3>
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-55">{scored.length} in view</span>
        </div>
      </div>
    </WidgetShell>
  );
}