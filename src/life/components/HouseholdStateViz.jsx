import React from "react";
import { statusLabel, accentFor, isAttention, isVeryUrgent } from "@/lib/householdUtils";

const loadFor = (s) => ({ overdue: 1, needs_attention: 0.85, due: 0.7, open: 0.5, calm: 0.18, good: 0.18, done: 0 }[s] ?? 0.2);

/** HouseholdStateViz — abstracte huishoudstaat. Twee vormen:
 *  "bars"    — horizontale staafjes gestapeld (panel, grafisch/minimaal)
 *  "columns" — verticale pijlers (widget & page hero)
 *  Kleur: life-blue (kalm) → life-sand #d8dab3 (aandacht) → urgent #d5e24a (heel dringend). */
export default function HouseholdStateViz({ zones = [], variant = "columns", compact = false, tone = "light" }) {
  const dark = tone === "dark";
  const labelCls = compact ? "text-[8px] uppercase tracking-wide font-semibold" : "text-[10px] uppercase tracking-[0.18em] font-semibold";
  const subCls = compact ? "text-[8px]" : "text-[10px]";
  const muted = dark ? "hsl(var(--ivory) / 0.42)" : "hsl(var(--muted-foreground))";

  if (variant === "bars") {
    return (
      <div className="space-y-3.5">
        {zones.map((z) => {
          const load = loadFor(z.status);
          const hot = isAttention(z.status);
          const color = accentFor(z.status);
          return (
            <div key={z.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`${labelCls} ${dark ? "text-ivory/60" : "text-foreground/55"}`}>{z.label}</span>
                <span className={`${subCls} font-semibold`} style={{ color: hot ? color : muted }}>{statusLabel(z.status)}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-foreground/8"}`}>
                <div className={`h-full rounded-full transition-all duration-700 ${hot ? "animate-pulse-soft" : ""}`} style={{ width: `${15 + load * 85}%`, background: color, boxShadow: isVeryUrgent(z.status) ? `0 0 14px ${color}` : "none" }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={compact ? "grid grid-cols-4 gap-2 h-full" : "grid grid-cols-4 gap-3"}>
      {zones.map((z) => {
        const load = loadFor(z.status);
        const hot = isAttention(z.status);
        const color = accentFor(z.status);
        return (
          <div key={z.key} className="flex flex-col items-center gap-2 h-full">
            <div className="relative w-full flex items-end justify-center flex-1" style={{ minHeight: compact ? 48 : 110 }}>
              <div className={`rounded-full transition-all duration-700 ${hot ? "animate-pulse-soft" : ""}`} style={{ width: compact ? `${44 + load * 26}%` : `${48 + load * 36}%`, height: `${22 + load * 78}%`, background: color, opacity: hot ? 0.98 : 0.55, boxShadow: isVeryUrgent(z.status) ? `0 0 22px ${color}` : "none" }} />
            </div>
            <span className={`${labelCls} ${dark ? "text-ivory/55" : "text-foreground/55"}`}>{z.label}</span>
            <span className={`${subCls} font-semibold`} style={{ color: hot ? color : muted }}>{statusLabel(z.status)}</span>
          </div>
        );
      })}
    </div>
  );
}