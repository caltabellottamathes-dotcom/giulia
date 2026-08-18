import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const ROUTINES = [
  { title: "Ochtend ademruimte", streak: 12, done: true },
  { title: "Stretches", streak: 7, done: true },
  { title: "Lezen 10 min", streak: 3, done: false },
];

/** Routines — "How consistent?" · streak number + 7-dot grids + photo. */
export default function RoutinesGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[220px]">
      <div className="flex h-full gap-3 p-4">
        <div className="flex-1 flex flex-col min-w-0">
          <GalleryLabel label="Routines" count="3 vandaag" />
          <h2 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">2/3</h2>
          <div className="mt-2 flex items-end gap-2">
            <CountUp value={21} className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" />
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mb-1">langste<br />streak</p>
          </div>
          <div className="mt-3 space-y-2.5 flex-1 min-h-0">
            {ROUTINES.map((r, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[11px] truncate flex-1 opacity-85">{r.title}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <motion.span key={j} className="h-2 w-2 rounded-full"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: delay + 0.2 + j * 0.04 + i * 0.08 }}
                      style={{ background: j < Math.min(7, r.streak) ? (r.done ? "var(--gallery-accent)" : "var(--gallery-accent)") : "currentColor", opacity: j < Math.min(7, r.streak) ? 0.9 : 0.15 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[32%] shrink-0 rounded-xl overflow-hidden">
          <img src={SELF_PHOTO.routines} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </GalleryShell>
  );
}