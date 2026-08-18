import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const BLOCKS = [
  { start: 7, dur: 1.5, protected: true },
  { start: 13, dur: 0.5, protected: false },
  { start: 20.5, dur: 1, protected: true },
];

/** Personal Time — "How much time is mine?" · 24h day bar with blocks + photo. Wide. */
export default function PersonalTimeGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[180px]">
      <div className="flex h-full gap-3 p-4">
        <div className="w-[26%] shrink-0 rounded-xl overflow-hidden">
          <img src={SELF_PHOTO.personalTime} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <GalleryLabel label="Personal Time" count="3 blokken" />
          <div className="flex items-end justify-between">
            <h2 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">BESCHERMD</h2>
            <CountUp value={180} className="text-[34px] leading-none font-display font-semibold tabular-nums" />
          </div>
          <div className="mt-3 relative h-8 rounded-lg overflow-hidden">
            <div className="absolute inset-0 rounded-lg" style={{ background: "var(--gallery-accent)", opacity: 0.12 }} />
            {Array.from({ length: 24 }).map((_, h) => (
              <span key={h} className="absolute top-0 bottom-0 w-px" style={{ left: `${(h / 24) * 100}%`, background: "currentColor", opacity: 0.08 }} />
            ))}
            {BLOCKS.map((b, i) => {
              const left = (b.start / 24) * 100;
              const width = Math.min(100 - left, (b.dur / 24) * 100);
              return (
                <motion.div key={i} className="absolute top-0 bottom-0 rounded-md"
                  style={{ left: `${left}%`, background: "var(--gallery-accent)", opacity: b.protected ? 0.9 : 0.5 }}
                  initial={{ width: 0 }} animate={{ width: `${width}%` }}
                  transition={{ duration: 0.9, delay: delay + 0.2 + i * 0.1, ease: "easeOut" }} />
              );
            })}
          </div>
          <div className="flex-1" />
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">1u 30 beschermd</p>
        </div>
      </div>
    </GalleryShell>
  );
}