import React from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/widgets/CountUp";
import { accentVars } from "@/lib/widgetAccent2";

/** Alt D — Typographic poster (4:5 portrait). The number IS the design —
 *  oversized display type fills the tile, a thin photo strip carries the
 *  actions. Motion: number springs in with overshoot; accent dot pulses. */
export default function AltTypographicPoster({ widget }) {
  return (
    <div className="relative rounded-[24px] overflow-hidden glass-3 flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/5", ...accentVars(widget.accent) }}>
      <div className="flex-1 flex flex-col justify-center px-5 pt-5 text-ivory min-h-0">
        <div className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-60">{widget.label}</div>
        <motion.div initial={{ scale: 0.78, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 210, damping: 17 }} className="mt-1">
          <CountUp value={widget.value ?? 0} className="block text-[88px] font-display font-bold leading-[0.82] tracking-[-0.04em]" />
        </motion.div>
        <div className="flex items-center gap-2 mt-3">
          <motion.span animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 2.2, repeat: Infinity }} className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--tile-accent)" }} />
          <span className="text-[11px] uppercase tracking-[0.2em] opacity-55">{widget.unit}</span>
        </div>
        <p className="text-xs text-ivory/65 mt-3 line-clamp-2">{widget.sub}</p>
      </div>
      <div className="relative h-20 shrink-0 overflow-hidden">
        <img src={widget.photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex gap-1.5">
          {(widget.actions || []).slice(0, 2).map((a, idx) => (
            <button key={a} className={`flex-1 rounded-full py-1.5 text-[10px] font-semibold transition hover:-translate-y-0.5 ${idx === 0 ? "" : "border border-ivory/25 text-ivory"}`} style={idx === 0 ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" } : undefined}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}