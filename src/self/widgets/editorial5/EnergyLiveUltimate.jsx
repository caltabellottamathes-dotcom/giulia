import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";
import { stateHeadline } from "./helpers";

const R = 26, C = 2 * Math.PI * R;

function Gauge({ value, label, color }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value || 0), 200); return () => clearTimeout(t); }, [value]);
  const off = C - (v / 100) * C;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 60 60" className="h-14 w-14">
        <circle cx="30" cy="30" r={R} fill="none" stroke={PLUM_FAINT} strokeWidth="5" />
        <motion.circle cx="30" cy="30" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" transform="rotate(-90 30 30)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <span className="text-[14px] font-display font-semibold tabular-nums leading-none">{value || 0}</span>
      <span className="text-[7px] uppercase tracking-[0.18em] opacity-55">{label}</span>
    </div>
  );
}

/** EnergyLiveUltimate — grote state-headline + dubbele gauge (energy/
 *  capacity) van echte SelfCheckIn + recente-energie tijdlijn. · 9:16 */
export default function EnergyLiveUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 12, externalTick: learnTick });
  const latest = (data || [])[0];
  const recent = useMemo(() => { const a = Array.from({ length: 8 }, () => null); (data || []).slice(0, 8).forEach((c, i) => { a[7 - i] = c.energy ?? 0; }); return a; }, [data]);
  const headline = latest ? stateHeadline(latest.state) : "STEADY";

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("dailystate")} className="min-h-0" style={{ aspectRatio: "9 / 16", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <WidgetHeader label="How I'm Doing." count={loading ? "…" : "live"} />
        <motion.h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>{headline}</motion.h3>
        <div className="flex justify-around">
          <Gauge value={latest?.energy} label="energy" color={SAGE} />
          <Gauge value={latest?.capacity} label="capacity" color={PLUM} />
        </div>
        <div className="flex-1 flex flex-col justify-end min-h-0 gap-1">
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">recente energie</p>
          <div className="flex items-end gap-1 h-12">
            {recent.map((v, i) => (
              <motion.span key={i} className="flex-1 rounded-full" style={{ background: PLUM }} animate={{ height: v != null ? `${Math.max(20, v)}%` : "20%", opacity: v != null ? 0.9 : 0.18 }} transition={{ duration: 0.7, delay: i * 0.05 }} />
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}