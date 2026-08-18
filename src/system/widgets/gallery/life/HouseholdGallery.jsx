import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { IMAGES } from "@/lib/images";

const CATS = [
  { label: "taak", n: 2, h: 65 },
  { label: "boodschap", n: 1, h: 38 },
  { label: "onderhoud", n: 1, h: 28 },
  { label: "issue", n: 0, h: 12 },
];

/** Household — "What needs attention?" · hero number + category bars + photo. */
export default function HouseholdGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="life" delay={delay} className="min-h-[260px]">
      <div className="flex flex-col h-full p-6 pb-0">
        <GalleryLabel label="Household" count="3 aandacht" />
        <h2 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em]">EEN PAAR DINGEN</h2>
        <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">deze week</p>
        <div className="mt-auto pt-6 pb-5 flex items-end gap-5">
          <div>
            <CountUp value={3} className="text-[56px] leading-[0.8] font-display font-semibold tracking-[-0.04em]" />
            <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">dingen waard</p>
          </div>
          <div className="flex items-end gap-3 h-20 flex-1">
            {CATS.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <motion.span className="w-full max-w-[28px] rounded-full"
                  style={{ background: c.n ? "var(--gallery-accent)" : "currentColor", opacity: c.n ? 0.85 : 0.12 }}
                  initial={{ height: 0 }} animate={{ height: `${c.h}%` }}
                  transition={{ duration: 0.8, delay: delay + 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
                <span className="text-[8px] uppercase tracking-wider opacity-50 whitespace-nowrap">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-12 overflow-hidden">
        <img src={IMAGES.lifeHousehold} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
    </GalleryShell>
  );
}