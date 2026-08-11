import React, { useEffect, useState } from "react";

const CIRC = 2 * Math.PI * 34; // r = 34

/**
 * ProgressGauge — widget-family glass card with an olive progress ring.
 * Same glass-2 material, app fonts (Space Grotesk display / Inter body) and
 * palette as the dashboard widgets.
 */
export default function ProgressGauge({ label, percent = 0, title, subtitle, pillLabel, onPillClick, actionIcon: ActionIcon, onAction }) {
  const [on, setOn] = useState(false);
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const offset = on ? CIRC * (1 - pct / 100) : CIRC;

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="glass-2 rounded-3xl p-6 text-foreground w-full max-w-[360px] mx-auto">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground pt-1">{label}</span>
        <div className="relative h-[76px] w-[76px] shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--foreground) / 0.12)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="hsl(var(--olive))" strokeWidth="6" strokeLinecap="round"
              style={{ strokeDasharray: CIRC, strokeDashoffset: offset, transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-display font-semibold tabular-nums">{pct}%</span>
        </div>
      </div>
      <div className="pt-6">
        <h3 className="font-display text-xl font-semibold tracking-tight leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="flex gap-2">
            {ActionIcon && (
              <button onClick={onAction} className="h-9 w-9 rounded-full border border-foreground/15 bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition" aria-label="Actie">
                <ActionIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <button onClick={onPillClick} className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-foreground/90 transition">
            {pillLabel} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}