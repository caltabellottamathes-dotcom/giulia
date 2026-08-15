import React from "react";
import { statusLabel } from "@/lib/householdUtils";

const SAND = "hsl(var(--life-sand))";
const BLUE = "hsl(var(--life-blue))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";

const loadFor = (s) => ({ overdue: 1, needs_attention: 0.85, due: 0.7, open: 0.5, calm: 0.18, good: 0.18, done: 0 }[s] ?? 0.2);
const hot = (s) => ["overdue", "needs_attention", "due", "open"].includes(s);

/** HouseholdStateViz — abstracte, levende compositie van vier huishoudelijke
 *  zones. Vormen veranderen in schaal/beweging naargelang de status; alles
 *  kalm → rustige uitgebalanceerde compositie. */
export default function HouseholdStateViz({ zones = [], compact = false, tone = "light" }) {
  const dark = tone === "dark";
  const muted = dark ? "text-ivory/45" : "text-foreground/50";
  const labelCls = compact ? "text-[8px] uppercase tracking-wide font-semibold" : "text-[10px] uppercase tracking-[0.18em] font-semibold";
  const subCls = compact ? "text-[8px]" : "text-[10px]";
  return (
    <div className={compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-4 gap-3"}>
      {zones.map((z) => {
        const load = loadFor(z.status);
        const h = hot(z.status);
        return (
          <div key={z.key} className="flex flex-col items-center gap-2">
            <div className="relative w-full flex items-end justify-center" style={{ height: compact ? 56 : 120 }}>
              <div
                className={`rounded-full transition-all duration-700 ${h ? "animate-pulse-soft" : ""}`}
                style={{
                  width: compact ? `${42 + load * 28}%` : `${46 + load * 38}%`,
                  height: `${22 + load * 78}%`,
                  background: h ? SAND : BLUE,
                  opacity: h ? 0.95 : 0.5,
                  boxShadow: h ? `0 0 22px ${SAND}` : "none",
                }}
              />
            </div>
            <span className={`${labelCls} ${dark ? "text-ivory/55" : "text-foreground/55"}`}>{z.label}</span>
            <span className={`${subCls} ${muted}`} style={h ? { color: SAND_DEEP } : {}}>{statusLabel(z.status)}</span>
          </div>
        );
      })}
    </div>
  );
}