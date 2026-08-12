import React from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/widgets/CountUp";
import { accentVars } from "@/lib/widgetAccent2";

/** Alt B — Vertical split (3:2 landscape): photo rail left, content right
 *  with an animated horizontal meter that sweeps in. */
export default function AltVerticalSplit({ widget }) {
  const pct = Math.min(100, Math.max(10, (widget.value ?? 50)));
  return (
    <div className="relative rounded-[24px] overflow-hidden glass-3 flex shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/2", ...accentVars(widget.accent) }}>
      <div className="relative w-[38%] shrink-0 overflow-hidden">
        <img src={widget.photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/45 to-transparent" />
        <div className="absolute left-3 top-3 text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/90">{widget.label}</div>
        <div className="absolute left-3 bottom-3 text-ivory">
          <CountUp value={widget.value ?? 0} className="block text-3xl font-display font-bold leading-none" />
          <span className="text-[9px] uppercase tracking-[0.2em] opacity-70">{widget.unit}</span>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col text-ivory min-w-0">
        <div className="flex items-center justify-between text-[10px] opacity-55">
          <span className="uppercase tracking-[0.2em]">{widget.page2?.title || "details"}</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="relative mt-2 h-2 rounded-full bg-ivory/12 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--tile-accent)" }} />
        </div>
        <p className="text-[11px] text-ivory/70 mt-3 line-clamp-3">{widget.sub}</p>
        <div className="mt-auto flex gap-1.5 pt-3">
          {(widget.actions || []).slice(0, 2).map((a, i) => (
            <button key={a} className={`flex-1 rounded-full py-2 text-[11px] font-semibold transition hover:-translate-y-0.5 ${i === 0 ? "" : "border border-ivory/25 text-ivory"}`} style={i === 0 ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" } : undefined}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}