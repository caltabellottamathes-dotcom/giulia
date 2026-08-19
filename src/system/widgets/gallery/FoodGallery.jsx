import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT, FILL } from "./palette";

const A = ACCENT.life;
const SAND = FILL.life;
const DAYS = ["M", "D", "W", "D", "V", "Z", "Z"];

/** Food — "Wat kook je deze week?" Week-grid met maaltijd-blokjes. */
export default function FoodGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: meals } = useEntityList("Meal", { sort: "date", realtime: true, externalTick: t });
  const weekStart = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }, []);
  const weekMeals = (meals || []).filter(m => { if (!m.date) return false; const d = new Date(m.date); return d >= weekStart && d < new Date(weekStart.getTime() + 7 * 86400000); });
  const planned = weekMeals.filter(m => m.status === "planned" || m.status === "eaten");
  const count = planned.length;
  const headline = count === 0 ? "NIETS GEPLAND" : count <= 7 ? "EEN KEUZE" : "VOLLE WEEK";
  const sub = count === 0 ? "Nog geen maaltijden" : `${count} maaltijden gepland`;

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("food")} className="min-h-[160px]" style={{ "--tile-accent": A }}>
      <div className="flex h-full gap-2.5 p-3">
        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="What's for Dinner?" count={count ? `${count} maaltijden` : ""} />
          <div className="flex items-end justify-between mt-0.5">
            <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          </div>
          <p className="text-[9px] uppercase tracking-[0.18em] opacity-50 mt-1">{sub}</p>
          <div className="mt-2.5 grid grid-cols-7 gap-1 flex-1 items-end">
            {DAYS.map((d, i) => {
              const dayMeals = planned.filter(m => { const md = new Date(m.date).getDay(); return ((md + 6) % 7) === i; });
              return (
                <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                  <motion.span className="w-full rounded-sm" style={{ background: dayMeals.length ? SAND : "rgba(255,255,255,0.06)" }}
                    initial={{ height: "10%" }} animate={{ height: `${Math.max(10, dayMeals.length * 33)}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} />
                  <span className="text-[7px] uppercase opacity-40 font-semibold">{d}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-[24%] shrink-0 rounded-xl overflow-hidden">
          <img src={IMAGES.lifeFood} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </WidgetShell>
  );
}