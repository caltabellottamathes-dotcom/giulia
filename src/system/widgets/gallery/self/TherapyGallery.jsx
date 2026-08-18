import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

/** Therapy — "How's my trajectory?" · horizontal progress timeline + photo. Wide. */
export default function TherapyGallery({ delay = 0 }) {
  const avg = 45;
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[180px]">
      <div className="flex h-full gap-3 p-4">
        <div className="flex-1 flex flex-col min-w-0">
          <GalleryLabel label="Therapy" count="2 actief" />
          <div className="flex items-end justify-between">
            <h2 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">TRAJECT</h2>
            <CountUp value={avg} className="text-[40px] leading-none font-display font-semibold tabular-nums" />
          </div>
          <div className="mt-3 relative h-8 flex items-center">
            <div className="absolute left-0 right-0 h-1 rounded-full" style={{ background: "var(--gallery-accent)", opacity: 0.2 }} />
            <motion.div className="absolute left-0 h-1 rounded-full" style={{ background: "var(--gallery-accent)" }}
              initial={{ width: 0 }} animate={{ width: `${avg}%` }} transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }} />
            {Array.from({ length: 6 }).map((_, i) => {
              const at = (i / 5) * 100;
              const reached = avg >= at;
              return (
                <motion.span key={i} className="absolute -translate-x-1/2 h-3 w-3 rounded-full"
                  initial={{ scale: 0.6 }} animate={{ scale: reached ? 1.05 : 0.7 }}
                  transition={{ delay: delay + 0.3 + i * 0.08 }}
                  style={{ left: `${at}%`, background: reached ? "var(--gallery-accent)" : "var(--gallery-on-accent)", border: `2px solid var(--gallery-accent)`, opacity: reached ? 1 : 0.35 }} />
              );
            })}
          </div>
          <div className="flex-1" />
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">volgende · vr 21 aug · 14:00</p>
        </div>
        <div className="w-[28%] shrink-0 rounded-xl overflow-hidden">
          <img src={SELF_PHOTO.therapy} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </GalleryShell>
  );
}