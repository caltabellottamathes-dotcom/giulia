import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PhotoCardLight, { BURG, INK, SAGE_SOFT } from "./PhotoCardLight";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtEuro } from "@/self/widgets/editorial5/helpers";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/e4e763ca5_LIFE.jpeg";
const R = 30, C = 2 * Math.PI * R;

/** FoodLight — grote foto + zacht glas met budget-ring + maaltijden. · 1:1 */
export default function FoodLight() {
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
    <PhotoCardLight photo={PHOTO} onClick={() => openModule("food")} aspectRatio="1 / 1"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">What's for Dinner?</p><h3 className="text-[32px] leading-[0.84] font-display font-semibold tracking-[-0.04em] mt-0.5">FOOD</h3></>}>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 70 70" className="h-full w-full">
            <circle cx="35" cy="35" r={R} fill="none" stroke="rgba(45,45,45,0.10)" strokeWidth="6" />
            <motion.circle cx="35" cy="35" r={R} fill="none" stroke={over ? "#c5a09b" : SAGE_SOFT} strokeWidth="6" strokeLinecap="round" transform="rotate(-90 35 35)" strokeDasharray={C} animate={{ strokeDashoffset: C - (val / 100) * C }} transition={{ duration: 1.3, ease: "easeOut" }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[14px] font-display font-semibold tabular-nums">{Math.round(val)}%</span>
        </div>
        <div>
          <span className="text-[26px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{fmtEuro(spent)}</span>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1.5">van {fmtEuro(budget)}</p>
          <p className="text-[11px] font-medium mt-1.5">{meals} maaltijden deze week</p>
        </div>
      </div>
    </PhotoCardLight>
  );
}