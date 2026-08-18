import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const GOALS = [
  { title: "Hardloopschema 10km", progress: 80 },
  { title: "Wekelijks schrijven", progress: 55 },
  { title: "Lezen: 12 boeken", progress: 30 },
];
const RINGS = [{ r: 42, p: 80 }, { r: 32, p: 55 }, { r: 22, p: 30 }];

/** Personal Development — "How am I growing?" · concentric rings + goal list + photo. */
export default function DevelopmentGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[220px]">
      <div className="flex h-full gap-3 p-4">
        <div className="w-[30%] shrink-0 rounded-xl overflow-hidden">
          <img src={SELF_PHOTO.development} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <GalleryLabel label="Development" count="3 doelen" />
          <h2 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em]">3 DOELEN</h2>
          <div className="mt-2 flex items-center gap-3 flex-1 min-h-0">
            <div className="relative w-[92px] h-[92px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {RINGS.map((ring, i) => {
                  const c = 2 * Math.PI * ring.r;
                  return (
                    <g key={i} transform="rotate(-90 50 50)">
                      <circle cx="50" cy="50" r={ring.r} fill="none" stroke="currentColor" strokeWidth="4" opacity="0.12" />
                      <motion.circle cx="50" cy="50" r={ring.r} fill="none" stroke="var(--gallery-accent)" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={c} initial={{ strokeDashoffset: c }}
                        animate={{ strokeDashoffset: c * (1 - ring.p / 100) }}
                        transition={{ duration: 1.3, delay: delay + 0.2 + i * 0.12, ease: "easeOut" }} />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CountUp value={55} className="text-[22px] font-display font-semibold tabular-nums" />
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              {GOALS.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: i === 0 ? "var(--gallery-accent)" : "currentColor", opacity: i === 0 ? 1 : 0.4 }} />
                  <span className="text-[10px] truncate flex-1 opacity-85">{g.title}</span>
                  <span className="text-[9px] tabular-nums opacity-65">{g.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GalleryShell>
  );
}