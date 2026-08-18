import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { IMAGES } from "@/lib/images";

const R = 42;
const C = 2 * Math.PI * R;

/** Food — "What's the food status?" · animated budget donut + meal count + photo. */
export default function FoodGallery({ delay = 0 }) {
  const cost = 32, budget = 50, pct = cost / budget;
  return (
    <GalleryShell domain="life" delay={delay} className="min-h-[240px]">
      <div className="flex flex-col h-full p-5 pb-0">
        <GalleryLabel label="Food" count="wk 33" />
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col">
            <h2 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.02em]">WEEK LOOPT</h2>
            <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1">€32 / €50</p>
            <div className="mt-3 flex items-end gap-2">
              <CountUp value={12} className="text-[44px] leading-[0.8] font-display font-semibold tracking-[-0.04em]" />
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mb-1.5 leading-tight">maaltijden<br />deze week</p>
            </div>
          </div>
          <div className="relative w-[100px] h-[100px] shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeWidth="7" opacity="0.12" />
              <motion.circle cx="50" cy="50" r={R} fill="none" stroke="var(--gallery-accent)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={C} initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C * (1 - pct) }}
                transition={{ duration: 1.3, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[20px] font-display font-semibold tabular-nums">{Math.round(pct * 100)}<span className="text-[12px] opacity-50">%</span></span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-12 overflow-hidden">
        <img src={IMAGES.lifeFood} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
    </GalleryShell>
  );
}