import React from "react";
import { motion } from "framer-motion";
import { accentVars } from "@/lib/widgetAccent2";

/** Alt F — Timeline ribbon (16:7 wide landscape). Event nodes along a
 *  horizontal ribbon with a sweeping playhead looping left→right. */
export default function AltTimelineRibbon({ widget }) {
  const nodes = (widget.items && widget.items.length)
    ? widget.items
    : [
        { time: "01", label: widget.sub },
        { time: "02", label: widget.page2?.title },
        { time: "03", label: widget.actions?.[0] || "Meer" },
      ];
  return (
    <div className="relative rounded-[24px] overflow-hidden glass-3 px-4 py-3 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/7", ...accentVars(widget.accent) }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">{widget.label}</span>
        <span className="text-[10px] tabular-nums opacity-55">{widget.value != null ? `${widget.value} ${widget.unit}` : widget.sub}</span>
      </div>
      <div className="relative mt-4 h-8">
        <div className="absolute inset-x-0 top-2.5 h-[2px] bg-ivory/15" />
        {nodes.map((it, idx) => {
          const left = nodes.length === 1 ? 50 : (idx / (nodes.length - 1)) * 100;
          return (
            <div key={idx} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${left}%`, top: 0 }}>
              <span className="h-3 w-3 rounded-full" style={{ background: "var(--tile-accent)" }} />
              <span className="text-[8px] mt-1 text-ivory/70 tabular-nums">{it.time}</span>
            </div>
          );
        })}
        <motion.div animate={{ left: ["0%", "100%"] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 bottom-5 w-[2px] rounded-full" style={{ background: "var(--tile-accent)" }} />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-ivory/65 line-clamp-1">{widget.sub}</span>
        <button className="rounded-full px-3 py-1 text-[10px] font-semibold transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{widget.actions?.[0] || "Open"}</button>
      </div>
    </div>
  );
}