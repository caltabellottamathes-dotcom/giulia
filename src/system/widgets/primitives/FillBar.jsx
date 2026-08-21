import React from "react";
import { motion } from "framer-motion";

/** FillBar — grote visuele voortgangsbalk die volloopt naarmate er wordt
 *  afgevinkt. Gradient: begin = pistachio (licht), hoe verder gevuld hoe meer
 *  olive groen. Toppersheen + gloeiend eindpunt voor een grafisch leesbare
 *  voortgang. */
export default function FillBar({
  value = 0,
  height = 20,
  from = "hsl(var(--giulia-pistachio))",
  to = "hsl(var(--d-giulia-deep))",
  track = "rgba(255,255,255,0.12)",
  showDot = true,
  className,
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`relative w-full overflow-hidden rounded-full ${className || ""}`} style={{ height, background: track }}>
      <motion.div
        className="relative h-full rounded-full overflow-hidden"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="absolute inset-x-0 top-0 h-1/2 rounded-full"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.38), transparent)" }}
        />
      </motion.div>
      {showDot && pct > 0 && (
        <motion.span
          className="absolute top-1/2 h-3.5 w-3.5 rounded-full -translate-y-1/2"
          style={{ background: to, boxShadow: `0 0 16px 4px ${to}` }}
          initial={{ left: "0%" }}
          animate={{ left: `calc(${pct}% - 7px)` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </div>
  );
}