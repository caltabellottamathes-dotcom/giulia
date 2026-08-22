import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { fetchUnifiedCompleted } from "@/lib/unifiedStream";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/cf4a8aa42_AchterdeSchermen.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";
const URGENT = "hsl(var(--d-giulia-urgent))";

/** MeanwhileWidget — "MEANWHILE..." · P·4:3·B·SIDE (gelaagd).
 *  Foto full-bleed (Achter de schermen) als shell, geen tekst erop. Glazen card
 *  onder: header + grote live-tellende count "klaar deze week" + een grafische
 *  7-daagse staafgrafiek van voltooide items per dag (deze week). Geen tekst-
 *  lijst meer — alleen een leesbaar overzicht. Vandaag = urgent-geelgroen.
 *  Kleursysteem: GIULIA + Urgent. */

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function MeanwhileWidget() {
  const { openModule } = usePanel();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const list = await fetchUnifiedCompleted(40);
    setCompleted(list);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  // groepeer voltooide items per dag van de huidige week (ma–zo)
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = maandag
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  monday.setHours(0, 0, 0, 0);

  const counts = [0, 0, 0, 0, 0, 0, 0];
  completed.forEach((c) => {
    const t = new Date(c.updated || 0);
    const diff = Math.floor((t - monday) / 86400000);
    if (diff >= 0 && diff < 7) counts[diff]++;
  });
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...counts);
  const todayIdx = dow;

  return (
    <div className="w-full max-w-[620px]">
      <PhotoGlassLayeredWidget
        shape="4:3"
        photo={PHOTO}
        glassPosition="bottom"
        glassFraction={0.42}
        overhang={0.06}
        domain="giulia"
        radius="large"
        glassBlur={8}
        overlay="bg-gradient-to-t from-black/40 via-black/10 to-transparent"
      >
        <WidgetHeader type="pulse" label="MEANWHILE..." />

        <div className="flex items-end gap-3 mt-1">
          {loading ? (
            <div className="h-9 w-16 rounded-lg bg-white/10 animate-pulse" />
          ) : (
            <CountUp value={total} className="text-[40px] font-display font-bold leading-none tracking-[-0.03em]" />
          )}
          <span className="text-[10px] uppercase tracking-[0.24em] opacity-70 mb-1.5">klaar deze week</span>
        </div>

        <div className="flex-1 min-h-2" />

        {/* 7-daagse staafgrafiek */}
        <button onClick={() => openModule("updates")} className="flex items-end justify-between gap-2 h-[74px] w-full text-left">
          {counts.map((c, i) => {
            const h = loading ? 6 : Math.max(4, (c / max) * 64);
            const isToday = i === todayIdx;
            const color = c === 0 ? "rgba(255,255,255,0.10)" : isToday ? URGENT : DEEP;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end" style={{ height: 64 }}>
                  <motion.div
                    className="w-full rounded-[6px]"
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                    style={{ backgroundColor: color }}
                  />
                </div>
                <span className="text-[8px] uppercase tracking-wider opacity-50" style={isToday ? { color: URGENT, opacity: 1 } : undefined}>
                  {DAYS[i]}
                </span>
              </div>
            );
          })}
        </button>
      </PhotoGlassLayeredWidget>
    </div>
  );
}