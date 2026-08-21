import React from "react";
import { motion } from "framer-motion";

/** FillBar — horizontale voortgangsbalk die volloopt naarmate er wordt
 *  afgevinkt. Gradient: begin = lichte kleur (pistachio), hoe verder gevuld
 *  hoe meer olive groen. Standaardaccent via de domein-tokens. */
export default function FillBar({
  value = 0,
  height = 10,
  from = "hsl(var(--giulia-pistachio))",
  to = "hsl(var(--d-giulia-deep))",
  track = "rgba(255,255,255,0.14)",
  className,
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`relative w-full overflow-hidden rounded-full ${className || ""}`} style={{ height, background: track }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}