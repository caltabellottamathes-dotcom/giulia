import React from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/widgets/CountUp";
import { accentVars } from "@/lib/widgetAccent2";

/** Alt E — Radial orbit (1:1 square). A central readout with nodes circling
 *  on a slow rotating orbit. Motion: orbit rotates 360°, nodes pulse. */
export default function AltRadial({ widget }) {
  const nodes = (widget.items && widget.items.length)
    ? widget.items
    : (widget.bars || [3, 5, 2, 6, 4]).slice(0, 6);
  const R = 43;
  return (
    <div className="relative rounded-[24px] overflow-hidden glass-3 flex flex-col items-center justify-center text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "1/1", ...accentVars(widget.accent) }}>
      <div className="absolute top-3 left-4 text-[9px] uppercase tracking-[0.3em] font-semibold opacity-65">{widget.label}</div>
      <div className="relative w-[58%] aspect-square">
        <div className="absolute inset-[16%] rounded-full border border-ivory/14" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
          {nodes.map((n, idx) => {
            const ang = (idx / nodes.length) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + R * Math.cos(ang);
            const y = 50 + R * Math.sin(ang);
            return (
              <motion.span key={idx} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: idx * 0.25 }}
                className="absolute h-3 w-3 -ml-1.5 -mt-1.5 rounded-full" style={{ left: `${x}%`, top: `${y}%`, background: "var(--tile-accent)" }} />
            );
          })}
        </motion.div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CountUp value={widget.value ?? 0} className="text-4xl font-display font-bold leading-none" />
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">{widget.unit}</p>
        </div>
      </div>
      <p className="absolute bottom-3 left-4 right-16 text-[11px] text-ivory/65 line-clamp-1">{widget.sub}</p>
      <button className="absolute bottom-3 right-4 rounded-full px-3 py-1.5 text-[10px] font-semibold transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{widget.actions?.[0] || "Open"}</button>
    </div>
  );
}