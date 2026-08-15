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
        <span className="flex items-end gap-[2px] h-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[2.5px] rounded-full"
              style={{ background: "var(--tile-accent)" }}
              animate={{ height: ["28%", "100%", "42%", "78%", "28%"] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.24 }}
            />
          ))}
        </span>
        <h3 className="text-[10px] uppercase tracking-[0.28em] font-bold text-current opacity-60">{label}</h3>
      </div>
      {count != null && count !== "" && (
        <span className="text-[10px] font-mono tracking-[0.02em] text-current opacity-45 tabular-nums">{count}</span>
      )}
    </div>
  );
}