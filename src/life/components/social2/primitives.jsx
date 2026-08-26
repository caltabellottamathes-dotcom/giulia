import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────
   social2 / primitives — the visual vocabulary of the Social page.
   Bars, dots, meters, chips, state glyphs, object cards, empty states.
   Numbers support the visualisation; the visualisation leads.
   ────────────────────────────────────────────────────────────────── */

export function Rule({ label, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {label && <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">{label}</span>}
      <span className="h-px flex-1 bg-foreground/15" />
    </div>
  );
}

export function Kicker({ children, className }) {
  return <span className={cn("text-[10px] uppercase tracking-[0.2em] text-muted-foreground", className)}>{children}</span>;
}

export function StateGlyph({ label, sub, dots = 4, accent = "olive", size = "lg" }) {
  const filled = Math.max(0, Math.min(7, dots));
  const big = size === "lg";
  const colorVar = accent === "olive" ? "--olive" : accent === "urgent" ? "--urgent" : "--smoke";
  return (
    <div className="flex flex-col items-center text-center select-none">
      <div className={cn("font-display font-bold tracking-tight leading-none", big ? "text-5xl lg:text-6xl" : "text-3xl")} style={{ color: `hsl(var(${colorVar}))` }}>
        {label}
      </div>
      <div className="flex gap-1.5 my-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: i < filled ? 1 : 0.18, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className={cn("rounded-full", big ? "w-2.5 h-2.5" : "w-1.5 h-1.5")}
            style={{ background: i < filled ? `hsl(var(${colorVar}))` : "hsl(var(--foreground) / 0.18)" }}
          />
        ))}
      </div>
      {sub && <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground max-w-[28ch] leading-relaxed">{sub}</div>}
    </div>
  );
}

export function BarField({ rows = [], accent = "olive", showValues = true, className }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className={cn("space-y-2", className)}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground w-8 shrink-0 tabular-nums">{r.label}</span>
          <div className="flex-1 h-4 rounded-sm bg-foreground/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={cn("h-full rounded-sm", r.highlight ? "bg-olive" : accent === "sand" ? "bg-sand/70" : "bg-foreground/35")}
            />
          </div>
          {showValues && <span className="text-[11px] tabular-nums text-foreground/70 w-6 text-right">{r.value}</span>}
        </div>
      ))}
    </div>
  );
}

export function Meter({ value, max = 100, label, sub, accent = "olive", className }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = accent === "urgent" ? "bg-urgent" : accent === "sand" ? "bg-sand" : accent === "smoke" ? "bg-smoke" : "bg-olive";
  return (
    <div className={className}>
      {(label || sub) && (
        <div className="flex items-baseline justify-between mb-2">
          {label && <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>}
          {sub && <span className="text-[11px] text-foreground/70 tabular-nums">{sub}</span>}
        </div>
      )}
      <div className="h-3 rounded-full bg-foreground/[0.06] overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={cn("h-full rounded-full", fill)} />
      </div>
    </div>
  );
}

export function SignalDots({ value = 0, max = 5, label, className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground w-24 shrink-0">{label}</span>}
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < value ? "hsl(var(--olive))" : "hsl(var(--foreground) / 0.16)" }} />
        ))}
      </div>
    </div>
  );
}

export function Chip({ children, tone = "neutral", className }) {
  const tones = {
    neutral: "bg-foreground/[0.06] text-foreground/70 border-foreground/10",
    olive: "bg-olive/15 text-olive border-olive/30",
    sand: "bg-sand/20 text-sand-deep border-sand/40",
    urgent: "bg-urgent/20 text-urgent border-urgent/40",
    ridge: "bg-ridge/20 text-ridge border-ridge/40",
  };
  return <span className={cn("inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-medium px-2 py-1 rounded-full border", tones[tone], className)}>{children}</span>;
}

export function ObjectCard({ title, kicker, action, children, className, bodyClass }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn("rounded-2xl border border-foreground/10 bg-card p-5 flex flex-col", className)}
    >
      {(title || kicker || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {kicker && <Kicker className="block mb-1">{kicker}</Kicker>}
            {title && <h3 className="font-display font-semibold text-sm tracking-tight">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("flex-1 min-h-0", bodyClass)}>{children}</div>
    </motion.section>
  );
}

export function EmptyVisual({ title, subtitle, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-10", className)}>
      <div className="font-display font-bold tracking-tight text-2xl text-foreground/35">{title}</div>
      <span className="h-px w-16 bg-foreground/15 my-4" />
      <p className="text-[11px] text-muted-foreground max-w-[26ch] leading-relaxed">{subtitle}</p>
    </div>
  );
}

export function PeopleCard({ person, state, since, trend, onClick }) {
  const initials = (person?.name || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const stateTone = state === "CLOSE" || state === "ACTIVE" ? "olive" : state === "QUIETER THAN USUAL" || state === "QUIET" ? "sand" : state === "EMERGING" || state === "RECONNECTING" ? "ridge" : "neutral";
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left w-full rounded-2xl border border-foreground/10 bg-card p-4 flex flex-col gap-2"
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-olive/15 text-olive font-display font-semibold flex items-center justify-center text-sm shrink-0 overflow-hidden">
          {person?.avatar ? <img src={person.avatar} alt="" className="h-full w-full object-cover" /> : initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{person?.name}</p>
          <Chip tone={stateTone} className="mt-1">{state || "UNKNOWN"}</Chip>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="uppercase tracking-wide">{since === Infinity ? "never" : `${since}d ago`}</span>
        {trend && <span className={trend === "up" ? "text-olive" : trend === "down" ? "text-urgent" : ""}>{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>}
      </div>
    </motion.button>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">{title}</h3>
          <button onClick={onClose} className="h-7 w-7 rounded-full hover:bg-foreground/10 flex items-center justify-center text-muted-foreground">✕</button>
        </div>
        <div className="space-y-3">{children}</div>
        {footer && <div className="flex justify-end gap-2 mt-5">{footer}</div>}
      </motion.div>
    </div>
  );
}

export function TextInput({ ...props }) {
  return <input {...props} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-olive/50" />;
}

export function FieldLabel({ children }) {
  return <label className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">{children}</label>;
}