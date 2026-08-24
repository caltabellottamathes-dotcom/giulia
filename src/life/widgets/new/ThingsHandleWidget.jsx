import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { adminWeather, comingUp, overdueList } from "@/lib/adminUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const IVORY = "hsl(var(--ivory))";
const URGENT = "#d5e24a";
const R = 30, C = 2 * Math.PI * R;

/** ThingsHandleWidget — P·9x16·B·SIDE · "Things to Handle!"
 *  Full-bleed admin-foto + donkere gradient, kleine label boven, grote
 *  display-type "TO HANDLE" onder met een capacity-ring (on-track %).
 *  Urgent #d5e24a kleurt de ring zodra er iets te laat is. Data: AdminObligation. */
export default function ThingsHandleWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);

  const total = (obs || []).filter((o) => o.status !== "done").length;
  const clearPct = total === 0 ? 100 : Math.max(0, Math.round((1 - overdue.length / total) * 100));

  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(clearPct), 300); return () => clearTimeout(t); }, [clearPct]);
  const off = C - (val / 100) * C;
  const ringColor = overdue.length ? URGENT : "#b1bec6";

  return (
    <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden" onClick={() => openModule("personaladmin")} style={{ cursor: "pointer" }}>
      <motion.img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 8%, rgba(20,22,26,0.35) 48%, rgba(20,22,26,0.15) 100%)" }} />

      <div className="absolute inset-0 p-4 flex flex-col justify-between" style={{ color: IVORY }}>
        <div className="flex items-center justify-between">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-80" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Things to Handle!</motion.p>
          {overdue.length > 0 && <span className="text-[8px] uppercase tracking-[0.14em] font-bold px-2 py-0.5 rounded-full" style={{ background: URGENT + "22", color: URGENT, border: `1px solid ${URGENT}55` }}>{overdue.length} te laat</span>}
        </div>

        <div className="flex flex-col gap-3">
          <motion.h2 className="text-[32px] leading-[0.9] font-display font-bold tracking-[-0.04em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>TO<br />HANDLE</motion.h2>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 80 80" className="h-14 w-14 shrink-0">
              <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" />
              <motion.circle cx="40" cy="40" r={R} fill="none" stroke={ringColor} strokeWidth="5" strokeLinecap="round" transform="rotate(-90 40 40)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }} />
            </svg>
            <div>
              <CountUp value={val} className="text-[28px] font-display font-semibold tabular-nums leading-none block text-ivory" />
              <span className="text-[8px] uppercase tracking-[0.2em] opacity-65">on track</span>
            </div>
          </div>
          <p className="text-[9px] uppercase tracking-[0.16em] opacity-60">{coming.length} op komst · {weather.sub}</p>
        </div>
      </div>
    </div>
  );
}