import React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared L02 (Onderdeelpaneel) building blocks — branded, animated quick-context.
 *  Accent bars, soft glows, hover lift and mount fade-up keep every panel
 *  consistent with the GIULIA editorial system. */

export function Stat({ label, value, accent, hint }) {
  return (
    <div className="relative animate-fade-up glass-1 rounded-2xl px-4 py-3.5 flex flex-col gap-1.5 overflow-hidden">
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: accent || "hsl(var(--smoke))" }} />
      <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-[0.08] blur-2xl" style={{ background: accent || "hsl(var(--smoke))" }} />
      <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-semibold">{label}</span>
      <span className="text-2xl font-display font-semibold text-foreground leading-none tabular-nums" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
      {hint && <span className="text-[10px] text-foreground/40">{hint}</span>}
    </div>
  );
}

export function Row({ title, sub, onClick, accent, right, action }) {
  return (
    <div
      onClick={onClick}
      className="group animate-fade-up relative flex items-center gap-3 rounded-2xl pl-4 pr-3 py-3 glass-1 hover:bg-foreground/[0.04] transition-all duration-300 hover:translate-x-0.5 cursor-pointer"
    >
      <span
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 group-hover:top-2 group-hover:bottom-2"
        style={{ background: accent || "hsl(var(--smoke))" }}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground truncate">{title}</span>
        {sub && <span className="block text-xs text-foreground/50 truncate mt-0.5">{sub}</span>}
      </span>
      {action}
      {right}
      <ArrowUpRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/70 transition shrink-0" />
    </div>
  );
}

/** Multi-line clickable card for richer context (category + title + body). */
export function Card({ onClick, accent, children, trailing, action }) {
  return (
    <div
      onClick={onClick}
      className="group animate-fade-up relative rounded-2xl pl-4 pr-3 py-3 glass-1 hover:bg-foreground/[0.04] transition-all duration-300 hover:translate-x-0.5 cursor-pointer"
    >
      <span
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 group-hover:top-2 group-hover:bottom-2"
        style={{ background: accent || "hsl(var(--smoke))" }}
      />
      <div className="flex items-start gap-2 min-w-0">
        <div className="min-w-0 flex-1">{children}</div>
        {trailing}
      </div>
      {action && <div className="mt-2.5 flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className="rounded-2xl glass-1 px-5 py-12 text-center flex flex-col items-center gap-3 animate-fade-up">
      <span className="relative h-10 w-10 rounded-full border border-foreground/15 flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-foreground/25" />
        <span className="absolute inset-0 rounded-full border border-foreground/10 scale-125" />
      </span>
      <p className="text-sm text-foreground/50">{text}</p>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span className="h-px flex-1 bg-gradient-to-r from-foreground/15 to-transparent" />
      <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/45 font-semibold whitespace-nowrap">{children}</p>
    </div>
  );
}

export function ActionBtn({ onClick, label, icon: Icon, tone = "ghost" }) {
  const tones = {
    ghost: "glass-1 text-foreground/70 hover:text-foreground hover:bg-foreground/5",
    olive: "bg-olive text-ivory hover:bg-olive/90",
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
      aria-label={label}
      className={cn("inline-flex items-center justify-center rounded-full transition shrink-0 h-7 w-7", tones[tone])}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
    </button>
  );
}

export function Progress({ value, accent }) {
  return (
    <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value || 0))}%`, background: accent || "hsl(var(--olive))" }}
      />
    </div>
  );
}

export function Pill({ children, accent }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: accent || "hsl(var(--foreground))", background: "hsl(var(--foreground) / 0.06)" }}
    >
      {children}
    </span>
  );
}