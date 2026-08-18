import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const TYPES = [
  { label: "Balans", n: 2 },
  { label: "Patroon", n: 2 },
  { label: "Capaciteit", n: 1 },
  { label: "Overload", n: 1 },
];
const MAX_T = Math.max(1, ...TYPES.map((t) => t.n));

/** Self Insights — "What patterns do I see?" · balance spectrum + type bars + photo. */
export default function SelfInsightsGallery({ delay = 0 }) {
  const balance = 71;
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[240px]">
      <div className="flex flex-col h-full gap-2 p-4 pb-0">
        <div className="flex flex-col flex-1 min-h-0">
          <GalleryLabel label="Self Insights" count="5 actief" />
          <h2 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">5 INZICHTEN</h2>
          <div className="mt-3">
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(90deg, var(--gallery-accent), var(--gallery-urgent))" }}>
              <motion.div className="absolute top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full"
                style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
                initial={{ left: "0%" }} animate={{ left: `${balance}%` }}
                transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] uppercase tracking-wider opacity-55">negatief</span>
              <CountUp value={balance} className="text-[20px] font-display font-semibold tabular-nums" />
              <span className="text-[9px] uppercase tracking-wider opacity-55">positief</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 flex-1 min-h-0">
            {TYPES.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider w-20 shrink-0 opacity-75">{t.label}</span>
                <div className="relative flex-1 h-2 rounded-full overflow-hidden">
                  <div className="absolute inset-0 rounded-full" style={{ background: "var(--gallery-accent)", opacity: 0.15 }} />
                  <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--gallery-accent)" }}
                    initial={{ width: 0 }} animate={{ width: `${(t.n / MAX_T) * 100}%` }}
                    transition={{ duration: 0.9, delay: delay + 0.3 + i * 0.08 }} />
                </div>
                <span className="text-[9px] tabular-nums opacity-65 w-3 text-right">{t.n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl overflow-hidden h-14 shrink-0 mb-3">
          <img src={SELF_PHOTO.insights} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </GalleryShell>
  );
}