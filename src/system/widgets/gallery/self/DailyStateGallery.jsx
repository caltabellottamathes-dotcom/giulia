import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const TIMELINE = [62, 55, 70, 48, 80, 78, 72, 81];

/** Daily State — "How am I?" · energy column + 8-point timeline. Tall narrow. */
export default function DailyStateGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[300px]">
      <div className="flex flex-col h-full gap-2 p-4 pb-0">
        <div className="rounded-xl overflow-hidden h-14 shrink-0">
          <img src={SELF_PHOTO.dailyState} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 flex flex-col min-h-0 pb-3">
          <GalleryLabel label="Daily State" count="07:12" />
          <h2 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">IN RHYTHM</h2>
          <div className="mt-3 flex items-stretch gap-3 flex-1 min-h-0">
            <div className="relative w-3.5 rounded-full overflow-hidden">
              <div className="absolute inset-0 rounded-full" style={{ background: "var(--gallery-accent)", opacity: 0.15 }} />
              <motion.div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ background: "var(--gallery-accent)" }}
                initial={{ height: 0 }} animate={{ height: "78%" }} transition={{ duration: 1.1, delay: delay + 0.2, ease: "easeOut" }} />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">Energy</p>
                <span className="text-[36px] leading-none font-display font-semibold tabular-nums">78</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">Capacity</p>
                  <span className="text-[10px] tabular-nums font-semibold">64%</span>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden">
                  <div className="absolute inset-0 rounded-full" style={{ background: "var(--gallery-accent)", opacity: 0.2 }} />
                  <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--gallery-accent)" }}
                    initial={{ width: 0 }} animate={{ width: "64%" }} transition={{ duration: 1.1, delay: delay + 0.3 }} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-end gap-1 h-8">
            {TIMELINE.map((v, i) => (
              <motion.span key={i} className="flex-1 rounded-full" style={{ background: "var(--gallery-accent)" }}
                initial={{ height: 0 }} animate={{ height: `${Math.max(20, v)}%`, opacity: 0.85 }}
                transition={{ duration: 0.6, delay: delay + 0.3 + i * 0.05 }} />
            ))}
          </div>
        </div>
      </div>
    </GalleryShell>
  );
}