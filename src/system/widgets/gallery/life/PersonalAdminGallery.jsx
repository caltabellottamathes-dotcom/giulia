import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import CountUp from "@/system/widgets/CountUp";
import { IMAGES } from "@/lib/images";

const EVENTS = [
  { label: "Belasting", days: "vandaag", urgent: true },
  { label: "Zorgverzekering", days: "3 dagen", urgent: false },
  { label: "Huur", days: "8 dagen", urgent: false },
  { label: "Abonnement", days: "12 dagen", urgent: false },
];

/** Personal Admin — "What's due?" · photo header + vertical deadline timeline + stats. */
export default function PersonalAdminGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="life" delay={delay} className="min-h-[340px]">
      <div className="relative h-16 overflow-hidden shrink-0">
        <img src={IMAGES.lifePersonalAdmin} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(48,23,40,0.82), transparent)" }} />
        <div className="absolute inset-0 px-5 flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.28em] font-bold opacity-90">Personal Admin</h3>
          <span className="text-[10px] uppercase tracking-[0.18em] tabular-nums font-semibold" style={{ color: "var(--gallery-urgent)" }}>1 vandaag</span>
        </div>
      </div>
      <div className="flex-1 p-5 flex flex-col">
        <h2 className="text-[22px] leading-[1.02] font-display font-semibold tracking-[-0.02em]">EEN DING KLOPT</h2>
        <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1">vandaag opletten</p>
        <div className="mt-4 flex-1 relative">
          <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: "var(--gallery-accent)", opacity: 0.25 }} />
          {EVENTS.map((e, i) => (
            <motion.div key={i} className="relative flex items-center gap-3 pl-5 mb-3"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: delay + 0.15 + i * 0.08 }}>
              <span className="absolute left-0 h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: e.urgent ? "var(--gallery-urgent)" : "var(--gallery-accent)", border: e.urgent ? "none" : "2px solid transparent" }} />
              <span className="text-[12px] flex-1 opacity-90">{e.label}</span>
              <span className="text-[9px] uppercase tracking-wider tabular-nums" style={{ color: e.urgent ? "var(--gallery-urgent)" : undefined, opacity: e.urgent ? 1 : 0.5 }}>{e.days}</span>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
          <Stat n={1} l="vandaag" urgent />
          <Stat n="€240" l="op komst" />
          <Stat n={0} l="te laat" />
        </div>
      </div>
    </GalleryShell>
  );
}

function Stat({ n, l, urgent }) {
  return (
    <div className="text-center">
      <p className="text-xl font-display font-semibold tabular-nums leading-none" style={{ color: urgent ? "var(--gallery-urgent)" : undefined }}>{n}</p>
      <p className="text-[9px] uppercase tracking-wide opacity-50 mt-1">{l}</p>
    </div>
  );
}