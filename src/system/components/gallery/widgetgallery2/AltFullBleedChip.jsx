import React from "react";
import { motion } from "framer-motion";
import CountUp from "@/system/widgets/CountUp";
import { accentVars } from "@/lib/widgetAccent2";

/** Alt A — Full-bleed photo (3:4 portrait) with a floating glass chip.
 *  Motion: slow Ken-Burns zoom on the photo, chip slides up on mount. */
export default function AltFullBleedChip({ widget }) {
  return (
    <div className="relative rounded-[24px] overflow-hidden shadow-[0_28px_60px_-26px_rgba(0,0,0,0.5)]" style={{ aspectRatio: "3/4", ...accentVars(widget.accent) }}>
      <motion.img
        src={widget.photo} alt="" draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 7, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/12 to-charcoal/25" />
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-ivory/90">{widget.label}</span>
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--tile-accent)" }} />
      </div>
      <motion.div
        initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-4 left-4 right-4 glass-3 rounded-2xl p-4 text-ivory"
      >
        <div className="flex items-end gap-2">
          <CountUp value={widget.value ?? 0} className="text-5xl font-display font-bold leading-none" />
          <p className="text-[10px] uppercase tracking-[0.2em] mb-1.5 opacity-60">{widget.unit}</p>
        </div>
        <p className="text-xs text-ivory/70 mt-2 line-clamp-2">{widget.sub}</p>
        <button className="mt-3 w-full rounded-xl py-2.5 text-xs font-semibold transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{widget.actions?.[0] || "Openen"}</button>
      </motion.div>
    </div>
  );
}