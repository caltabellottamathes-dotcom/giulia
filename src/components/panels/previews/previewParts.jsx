import React from "react";
import { ArrowUpRight } from "lucide-react";

/** Shared L02 (Onderdeelpaneel) building blocks — quick-context surface. */

export function Stat({ label, value, accent }) {
  return (
    <div className="glass-1 rounded-2xl px-4 py-3 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-semibold">{label}</span>
      <span
        className="text-2xl font-display font-semibold text-foreground leading-none"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export function Row({ title, sub, onClick, accent, right }) {
  return (
    <button onClick={onClick} className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition group">
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: accent || "hsl(var(--smoke))" }} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground truncate">{title}</span>
        {sub && <span className="block text-xs text-foreground/50 truncate mt-0.5">{sub}</span>}
      </span>
      {right}
      <ArrowUpRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground/60 transition shrink-0" />
    </button>
  );
}

export function Empty({ text }) {
  return (
    <div className="rounded-2xl glass-1 px-5 py-10 text-center">
      <p className="text-sm text-foreground/50">{text}</p>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/40 font-semibold px-1">{children}</p>
  );
}