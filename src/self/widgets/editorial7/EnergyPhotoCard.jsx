import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";
import { stateHeadline } from "@/self/widgets/editorial5/helpers";

const R = 22, C = 2 * Math.PI * R;
function MiniGauge({ value, label, color }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value || 0), 200); return () => clearTimeout(t); }, [value]);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg viewBox="0 0 50 50" className="h-12 w-12">
        <circle cx="25" cy="25" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="4.5" />
        <motion.circle cx="25" cy="25" r={R} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" transform="rotate(-90 25 25)" strokeDasharray={C} animate={{ strokeDashoffset: C - (v / 100) * C }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <span className="text-[13px] font-display font-semibold tabular-nums leading-none">{value || 0}</span>
      <span className="text-[7px] uppercase tracking-[0.16em] opacity-60">{label}</span>
    </div>
  );
}

/** EnergyPhotoCard — grote foto + glas-kaart met state + energy/capacity gauges. · 9:16 */
export default function EnergyPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 12, externalTick: learnTick });
  const latest = (data || [])[0];
  const recent = useMemo(() => { const a = Array.from({ length: 8 }, () => null); (data || []).slice(0, 8).forEach((c, i) => { a[7 - i] = c.energy ?? 0; }); return a; }, [data]);
  const headline = latest ? stateHeadline(latest.state) : "STEADY";
  return (
    <PhotoCard photo={SELF_PHOTO.insights} onClick={() => openModule("dailystate")} aspectRatio="9 / 16" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">How I'm Doing.</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">{headline}</h3></>}>
      <div className="flex justify-around mb-2">
        <MiniGauge value={latest?.energy} label="energy" color={SAGE} />
        <MiniGauge value={latest?.capacity} label="capacity" color={PLUM} />
      </div>
      <div className="flex items-end gap-1 h-10">
        {recent.map((v, i) => (
          <motion.span key={i} className="flex-1 rounded-full" style={{ background: SAGE }} animate={{ height: v != null ? `${Math.max(20, v)}%` : "20%", opacity: v != null ? 0.9 : 0.2 }} transition={{ duration: 0.7, delay: i * 0.05 }} />
        ))}
      </div>
    </PhotoCard>
  );
}