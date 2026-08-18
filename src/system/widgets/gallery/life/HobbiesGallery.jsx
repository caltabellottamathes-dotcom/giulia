import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import { IMAGES } from "@/lib/images";

const HOBBIES = [
  { title: "LEZEN", size: 1.0, state: "active" },
  { title: "HARDLOPEN", size: 0.82, state: "active" },
  { title: "KOKEN", size: 0.68, state: "active" },
  { title: "SCHILDEREN", size: 0.52, state: "new" },
  { title: "YOGA", size: 0.4, state: "quiet" },
  { title: "TUIN", size: 0.32, state: "quiet" },
];

const colorFor = (s) => s === "new" ? "var(--gallery-urgent)" : s === "active" ? "var(--gallery-accent)" : "currentColor";

/** Hobbies — "What's alive?" · word field where size = activity. Photo bleed. */
export default function HobbiesGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="life" delay={delay} className="min-h-[220px]">
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.lifeHobbies} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(48,23,40,0.55), transparent 70%)" }} />
        <div className="relative z-10 h-full p-6 flex flex-col">
          <GalleryLabel label="Hobby's" count="3 levend" />
          <h2 className="text-[24px] leading-[1.0] font-display font-semibold tracking-[-0.02em]">DRIE LEVEND</h2>
          <div className="flex-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 content-center py-3">
            {HOBBIES.map((h, i) => (
              <motion.span key={i}
                className="font-display font-semibold tracking-tight rounded-full px-2.5 leading-none"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: `${10 + Math.round(h.size * 13)}px`,
                  color: h.state === "quiet" ? "currentColor" : colorFor(h.state),
                  opacity: h.state === "quiet" ? 0.4 : 1,
                  border: h.state === "quiet" ? "1px solid rgba(255,255,255,0.18)" : "none",
                  paddingTop: `${Math.round(h.size * 4)}px`,
                  paddingBottom: `${Math.round(h.size * 4)}px`,
                }}>
                {h.title}
              </motion.span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <Stat n={3} l="actief" />
            <Stat n={1} l="nieuw" urgent />
            <Stat n={2} l="stil" />
          </div>
        </div>
      </div>
    </GalleryShell>
  );
}

function Stat({ n, l, urgent }) {
  return (
    <div>
      <p className="text-xl font-display font-semibold tabular-nums leading-none" style={{ color: urgent ? "var(--gallery-urgent)" : "var(--gallery-accent)" }}>{n}</p>
      <p className="text-[9px] uppercase tracking-wide opacity-50 mt-1">{l}</p>
    </div>
  );
}