import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * GalleryShell — shared container voor alle galerij-widgets (LIFE + SELF).
 *  • Drie modi via de kleur-toggle rechtsboven: glas / domain-deep / domain-sage.
 *  • Voorziet --gallery-accent, --gallery-on-accent, --gallery-urgent CSS vars
 *    zodat widget-internals altijd leesbaar blijven in elke modus.
 *  • Framer Motion entrance met stagger-delay.
 *  • Hover-lift voor tactiele feedback.
 */
const PALETTES = {
  life: [
    { bg: "rgba(48,23,40,0.16)", blur: true,  text: "#f5f5f0", accent: "#d8dab3", onAccent: "#301728", dot: "transparent" },
    { bg: "#301728",             blur: false, text: "#f5f5f0", accent: "#d8dab3", onAccent: "#301728", dot: "#301728" },
    { bg: "#d8dab3",             blur: false, text: "#301728", accent: "#301728", onAccent: "#f5f5f0", dot: "#d8dab3" },
  ],
  self: [
    { bg: "rgba(92,117,132,0.16)", blur: true,  text: "#f5f5f0", accent: "#d8dab3", onAccent: "#5c7584", dot: "transparent" },
    { bg: "#5c7584",               blur: false, text: "#f5f5f0", accent: "#d8dab3", onAccent: "#5c7584", dot: "#5c7584" },
    { bg: "#d8dab3",               blur: false, text: "#5c7584", accent: "#5c7584", onAccent: "#f5f5f0", dot: "#d8dab3" },
  ],
};

export function GalleryLabel({ label, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="flex items-end gap-[2px] h-3">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="w-[2.5px] rounded-full" style={{ background: "var(--gallery-accent)" }}
              animate={{ height: ["28%", "100%", "42%", "78%", "28%"] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.24 }} />
          ))}
        </span>
        <h3 className="text-[10px] uppercase tracking-[0.28em] font-bold opacity-60">{label}</h3>
      </div>
      {count != null && count !== "" && (
        <span className="text-[10px] font-mono opacity-45 tabular-nums">{count}</span>
      )}
    </div>
  );
}

export default function GalleryShell({ domain = "life", delay = 0, className, children, onClick }) {
  const [idx, setIdx] = useState(0);
  const p = PALETTES[domain][idx];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/12 cursor-pointer transition-transform duration-500 hover:-translate-y-1.5",
        className
      )}
      style={{
        "--gallery-accent": p.accent,
        "--gallery-on-accent": p.onAccent,
        "--gallery-urgent": "#d5e24a",
        color: p.text,
        background: p.bg,
        backdropFilter: p.blur ? "blur(28px) saturate(1.4)" : "none",
        WebkitBackdropFilter: p.blur ? "blur(28px) saturate(1.4)" : "none",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 20px 48px -24px rgba(0,0,0,0.42), inset 0 1px 0 0 rgba(255,255,255,0.16)",
      }}
    >
      {/* refraction light from top-left */}
      <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(130% 90% at 0% 0%, rgba(255,255,255,0.10), transparent 46%)" }} />
      {/* color toggle — transparent / deep / sage */}
      <div className="absolute top-3 right-3 z-30 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        {PALETTES[domain].map((opt, i) => (
          <button key={i} onClick={() => setIdx(i)} className="w-3 h-3 rounded-full transition-all duration-300" style={{
            background: opt.dot,
            border: opt.dot === "transparent" ? "1px solid rgba(255,255,255,0.35)" : "none",
            transform: idx === i ? "scale(1.25)" : "scale(1)",
            opacity: idx === i ? 1 : 0.4,
            boxShadow: idx === i ? "0 0 0 2px rgba(255,255,255,0.22)" : "none",
          }} />
        ))}
      </div>
      {children}
    </motion.div>
  );
}