import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { IMAGES } from "@/lib/images";

const WEEKS = [3, 5, 2, 8, 4, 6, 7, 9];
const MAXW = Math.max(...WEEKS);

/** Social Pulse — "How connected?" · hero number + 8-week activity bars + photo. */
export default function SocialPulseGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="life" delay={delay} className="min-h-[280px]">
      <div className="flex flex-col h-full p-6 pb-0">
        <GalleryLabel label="Social Pulse" count="3 wacht" />
        <h2 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.02em]">CONNECTED</h2>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">Je netwerk voelt warm</p>
        <div className="mt-5 flex items-end gap-4">
          <CountUp value={42} className="text-[64px] leading-[0.85] font-display font-semibold tracking-[-0.04em]" />
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3 max-w-[90px] leading-tight">meaningful interactions</p>
        </div>
        <div className="mt-auto pt-5 pb-5 flex items-end gap-1.5 h-20">
          {WEEKS.map((v, i) => (
            <motion.span key={i} className="flex-1 rounded-full" style={{ background: "var(--gallery-accent)", opacity: v ? 0.85 : 0.12 }}
              initial={{ height: 0 }} animate={{ height: `${Math.max(8, (v / MAXW) * 100)}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }} />
          ))}
        </div>
      </div>
      <div className="h-14 overflow-hidden">
        <img src={IMAGES.lifeSocialPulse} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
    </GalleryShell>
  );
}