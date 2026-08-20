import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";
import { fmtEuro } from "@/self/widgets/editorial5/helpers";

const R = 26, C = 2 * Math.PI * R;

/** FoodPhotoCard — grote foto + glas-kaart met budget-ring + maaltijden. · 1:1 */
export default function FoodPhotoCard() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("FoodWeek", { sort: "-date_start", limit: 1, externalTick: learnTick });
  const week = (data || [])[0];
  const budget = week?.budget || 0, spent = week?.total_cost || 0;
  const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
  const over = spent > budget && budget > 0;
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(pct), 250); return () => clearTimeout(t); }, [pct]);
  const meals = week?.meals_count || 0;
  return (
    <PhotoCard photo={SELF_PHOTO.routines} onClick={() => openModule("food")} aspectRatio="1 / 1" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">What's for Dinner?</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">FOOD</h3></>}>
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 60 60" className="h-full w-full">
            <circle cx="30" cy="30" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="5" />
            <motion.circle cx="30" cy="30" r={R} fill="none" stroke={over ? "#e08a6a" : SAGE} strokeWidth="5" strokeLinecap="round" transform="rotate(-90 30 30)" strokeDasharray={C} animate={{ strokeDashoffset: C - (val / 100) * C }} transition={{ duration: 1.3, ease: "easeOut" }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[12px] font-display font-semibold tabular-nums">{Math.round(val)}%</span>
        </div>
        <div className="flex-1">
          <span className="text-[22px] font-display font-semibold tabular-nums leading-none" style={{ color: SAGE }}>{fmtEuro(spent)}</span>
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-60 mt-1">van {fmtEuro(budget)}</p>
          <p className="text-[10px] font-medium mt-1.5">{meals} maaltijden deze week</p>
        </div>
      </div>
    </PhotoCard>
  );
}