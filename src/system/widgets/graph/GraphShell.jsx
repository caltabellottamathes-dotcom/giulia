import React from "react";

/** GraphShell — neutraal editorial kaartje (tokens) voor één graphisch element. */
export default function GraphShell({ label, caption, accent = "hsl(var(--olive))", children, className = "" }) {
  return (
    <div className={`relative rounded-2xl border border-foreground/10 bg-card/60 p-3 flex flex-col gap-2 min-h-[176px] overflow-hidden ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: accent }} />
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-foreground/55 truncate">{label}</span>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0">{children}</div>
      {caption && <p className="text-[9px] text-foreground/45 text-center -mt-1">{caption}</p>}
    </div>
  );
}