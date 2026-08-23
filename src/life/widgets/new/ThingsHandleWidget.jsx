import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { adminWeather, comingUp, overdueList, daysUntil, fmtDate } from "@/lib/adminUtils";

const PHOTO = IMAGES.lifeW3Handle;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const IVORY = "hsl(var(--ivory))";

/** ThingsHandleWidget — P·2x3·B·SIDE · "Things to Handle!"
 *  PhotoShell (boven): header + admin-weather headline. GlassShell (onder):
 *  radar — komende verplichtingen met dagen-tot-staafjes + te-laat badge.
 *  Data: AdminObligation. */
export default function ThingsHandleWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []).slice(0, 4), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);

  return (
    <div className="relative w-[300px] h-[450px] rounded-[28px] overflow-hidden" onClick={() => openModule("personaladmin")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="Things to Handle" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-3 flex flex-col" style={{ color: IVORY, height: "42%", background: "linear-gradient(to bottom, rgba(0,0,0,0.42), rgba(0,0,0,0))" }}>
        <WidgetHeader type="briefing" label="Things to Handle!" count={weather.counts.coming ? String(weather.counts.coming) : "—"} />
        <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{weather.headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.16em] mt-1" style={{ color: LIGHT }}>{weather.sub}</p>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[58%] bg-gradient-to-t from-black/52 via-black/24 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[58%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: LIGHT }}>Op komst</span>
          {overdue.length > 0 && <span className="text-[8px] uppercase tracking-[0.14em] font-bold px-2 py-0.5 rounded-full" style={{ background: URGENT + "22", color: URGENT, border: `1px solid ${URGENT}55` }}>{overdue.length} te laat</span>}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5">
          {coming.length === 0 ? (
            <p className="text-[11px] py-2" style={{ color: "rgba(255,255,255,0.6)" }}>Alles is bij — niets op komst.</p>
          ) : coming.map((o, i) => {
            const d = daysUntil(o.due_date);
            const hot = d < 0;
            const soon = d <= 7;
            const color = hot ? URGENT : soon ? LIGHT : DEEP;
            const frac = Math.max(0.05, Math.min(1, 1 - Math.abs(d) / 30));
            return (
              <div key={o.id}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[12px] truncate flex-1" style={{ color: IVORY }}>{o.title}</span>
                  <span className="text-[10px] tabular-nums shrink-0" style={{ color }}>{d < 0 ? `${Math.abs(d)}d te laat` : d === 0 ? "vandaag" : `${d}d`}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${frac * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.06 }} style={{ background: color }} />
                </div>
                <p className="text-[8px] uppercase tracking-[0.14em] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{fmtDate(o.due_date)}{o.recurrence ? ` · ${o.recurrence}` : ""}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}