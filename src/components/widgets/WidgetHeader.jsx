import React from "react";
import { motion } from "framer-motion";

/**
 * WidgetHeader — quiet label line with a small animated equalizer pictogram
 * (a branded "moving diagram" motif) that gently pulses beside the label.
 */
export default function WidgetHeader({ label, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="flex items-end gap-[2px] h-3.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full"
              style={{ background: "var(--tile-accent)" }}
              animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.22 }}
            />
          ))}
        </span>
        <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-current opacity-55">{label}</h3>
      </div>
      {count != null && count !== "" && (
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-current opacity-40 tabular-nums">{count}</span>
      )}
    </div>
  );
}