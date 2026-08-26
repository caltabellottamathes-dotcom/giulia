import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ── v2 shared atoms — licht OS-glas, framer-motion, count-up ── */

/** CountUp — telt van 0 naar target bij mount, via rAF. */
export function CountUp({ value = 0, duration = 1.1, className = "", suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(value);
  useEffect(() => {
    const from = ref.current;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else ref.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={className}>{n}{suffix}</span>;
}

/** SignalDots — N van 5 gevulde dots, afzonderlijke signalen (geen score). */
export function SignalDots({ value = 0, total = 5, size = "h-1.5 w-1.5" }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className={`${size} rounded-full`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
          style={{ background: i < value ? "hsl(var(--olive))" : "hsl(var(--muted))" }}
        />
      ))}
    </span>
  );
}

/** GhostIndex — vette decoratieve index-cijfer, lage dekking. */
export function GhostIndex({ children, className = "" }) {
  return (
    <span
      className={`pointer-events-none absolute select-none font-display font-bold ${className}`}
      style={{ opacity: 0.08, letterSpacing: "-0.04em", lineHeight: 0.78 }}
    >
      {children}
    </span>
  );
}

/** SectionLabel — kleine uppercase met brede letterspacing. */
export function SectionLabel({ children, className = "" }) {
  return <p className={`text-[10px] uppercase tracking-[0.25em] text-muted-foreground ${className}`}>{children}</p>;
}

/** AnimatedBar — balk die van 0 naar pct groeit. */
export function AnimatedBar({ pct = 0, color = "hsl(var(--olive))", track = "hsl(var(--muted))", height = "h-2", delay = 0 }) {
  return (
    <div className={`${height} w-full rounded-full overflow-hidden`} style={{ background: track }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(3, Math.min(100, pct))}%` }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/** ChangeChip — visuele change indicator (↑↓→ + label). */
export function ChangeChip({ dir = "up", name, label, onClick }) {
  const Icon = dir === "up" ? "↑" : dir === "down" ? "↓" : "→";
  const color = dir === "up" ? "hsl(var(--olive))" : dir === "down" ? "hsl(var(--urgent))" : "hsl(var(--smoke))";
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="inline-flex items-center gap-2 text-[12px] rounded-full px-3.5 py-1.5 glass-1"
    >
      <span className="font-bold text-base leading-none" style={{ color }}>{Icon}</span>
      <span className="font-medium text-foreground/85">{name}</span>
      <span className="text-muted-foreground">{label}</span>
    </motion.button>
  );
}

/** EmptyState — visueel empty-object (OPEN SPACE / YOUR NETWORK / QUIET). */
export function EmptyState({ title = "OPEN SPACE", line = "", subtitle = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center py-10"
    >
      <motion.p
        className="font-display text-lg font-bold tracking-tight text-foreground/70"
        initial={{ letterSpacing: "0.2em", opacity: 0 }}
        animate={{ letterSpacing: "0.05em", opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {title}
      </motion.p>
      <motion.div className="h-px w-12 bg-border my-3" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
      {line && <p className="text-sm text-foreground/55 mb-1">{line}</p>}
      {subtitle && <p className="text-sm text-muted-foreground italic">{subtitle}</p>}
    </motion.div>
  );
}

/** GlassSection — één overkoepelende glas-container met dunne scheidingslijn. */
export function GlassSection({ children, className = "", level = 2 }) {
  const cls = level === 1 ? "glass-1" : level === 3 ? "glass-3" : "glass-2";
  return <div className={`${cls} rounded-[24px] ${className}`}>{children}</div>;
}

/** StatusPill — status-chip met kleur per status. */
const STATUS_COLOR = {
  confirmed: "bg-olive text-white",
  planned: "bg-smoke/30 text-foreground",
  proposed: "bg-ridge/40 text-foreground/70",
  done: "bg-muted text-muted-foreground",
  cancelled: "bg-urgent/20 text-urgent line-through",
};
export function StatusPill({ status = "planned", className = "" }) {
  return <span className={`text-[9px] uppercase tracking-wider font-semibold rounded-full px-2.5 py-1 ${STATUS_COLOR[status] || STATUS_COLOR.planned} ${className}`}>{status}</span>;
}