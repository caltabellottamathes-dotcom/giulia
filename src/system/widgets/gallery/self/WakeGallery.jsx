import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const PHASES = ["Ontwaken", "Oriënt", "Ritueel", "Opstaan"];
const STEPS = 2;

/** Wake — "Am I awake?" · 4-phase ladder. Tall narrow. */
export default function WakeGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[300px]">
      <div className="flex flex-col h-full gap-2 p-4 pb-0">
        <div className="rounded-xl overflow-hidden h-14 shrink-0">
          <img src={SELF_PHOTO.wake} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 flex flex-col min-h-0 pb-3">
          <GalleryLabel label="Wake" count="07:12" />
          <h2 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">ONTWAKEN</h2>
          <div className="mt-3 flex-1 flex flex-col justify-between gap-2.5 min-h-0">
            {PHASES.map((p, i) => {
              const filled = i < STEPS;
              return (
                <div key={p} className="flex items-center gap-2">
                  <motion.span className="h-3 w-3 rounded-full shrink-0"
                    animate={{ scale: filled ? 1.1 : 0.8 }}
                    transition={{ delay: delay + 0.2 + i * 0.1 }}
                    style={{ background: filled ? "var(--gallery-accent)" : "currentColor", opacity: filled ? 1 : 0.2 }} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ opacity: filled ? 0.95 : 0.45 }}>{p}</span>
                  <div className="relative flex-1 h-1 rounded-full overflow-hidden">
                    <div className="absolute inset-0 rounded-full" style={{ background: "var(--gallery-accent)", opacity: 0.2 }} />
                    <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--gallery-accent)" }}
                      initial={{ width: 0 }} animate={{ width: filled ? "100%" : "0%" }}
                      transition={{ duration: 0.7, delay: delay + 0.2 + i * 0.1 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GalleryShell>
  );
}