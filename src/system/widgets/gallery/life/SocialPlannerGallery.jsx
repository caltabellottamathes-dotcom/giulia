import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import { IMAGES } from "@/lib/images";

const WEEK = [
  { label: "MA", plan: null, open: false },
  { label: "DI", plan: "Diner", open: false },
  { label: "WO", plan: null, open: true },
  { label: "DO", plan: "Borrel", open: false },
  { label: "VR", plan: null, open: true },
  { label: "ZA", plan: "Bezoek", open: false },
  { label: "ZO", plan: null, open: true },
];

/** Social Planner — "What's this week?" · 7-day grid with plan blocks. */
export default function SocialPlannerGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="life" delay={delay} className="min-h-[260px]">
      <div className="flex flex-col h-full p-6 pb-0">
        <GalleryLabel label="Social Planner" count="3 deze week" />
        <h2 className="text-[24px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">JE ZIET MENSEN</h2>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">Deze week staat klaar</p>
        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {WEEK.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[8px] uppercase tracking-wider opacity-45 font-semibold">{d.label}</span>
              <motion.div className="relative w-full h-14 rounded-md flex items-center justify-center overflow-hidden"
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={d.plan
                  ? { background: "var(--gallery-accent)" }
                  : d.open
                    ? { border: "1px dashed currentColor", opacity: 0.7 }
                    : { border: "1px solid currentColor", opacity: 0.2 }}>
                {d.plan
                  ? <span className="text-[9px] font-semibold uppercase tracking-wide text-center leading-tight px-0.5 line-clamp-3" style={{ color: "var(--gallery-on-accent)" }}>{d.plan}</span>
                  : d.open
                    ? <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gallery-accent)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                    : <span className="text-[8px] opacity-40">·</span>}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-12 overflow-hidden">
        <img src={IMAGES.lifeSocialPlanner} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
    </GalleryShell>
  );
}