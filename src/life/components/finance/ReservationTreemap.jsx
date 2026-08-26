import React, { useMemo } from "react";
import { fmtEuro } from "@/lib/financeUtils";

const RIDGE = "#b1bec6";

function readableTextOn(hex) {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return "hsl(var(--foreground))";
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "hsl(var(--foreground))" : "hsl(var(--ivory))";
}

/** ReservationTreemap — horizontale gestapelde pillen-bar. Elk segment = een
 *  portefeuille, breedte = reservering / totaal inkomen (%). Live: breedtes
 *  animeren mee met de data. Dezelfde ronde pill-vormen + portfolio-kleuren
 *  als de BarChart, maar horizontaal. */
export default function ReservationTreemap({ portfolios, income }) {
  const { segs, availPct, totalResPct, overflow } = useMemo(() => {
    const active = (portfolios || []).filter((p) => !p.archived);
    const inc = Math.max(Number(income) || 0, 0.0001);
    const s = active.map((p) => ({ p, res: Math.max(Number(p.monthly_reservation_actual) || 0, 0), pct: 0 })).filter((x) => x.res > 0);
    const totalRes = s.reduce((a, x) => a + x.res, 0);
    s.forEach((x) => (x.pct = (x.res / inc) * 100));
    return { segs: s, availPct: (Math.max(0, inc - totalRes) / inc) * 100, totalResPct: (totalRes / inc) * 100, overflow: totalRes > inc };
  }, [portfolios, income]);

  return (
    <div>
      <div className="flex h-14 rounded-full overflow-hidden gap-1.5 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.3)]">
        {segs.map((s) => (
          <div key={s.p.id} className="relative rounded-full flex items-center justify-center min-w-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${s.pct}%`, background: s.p.color || RIDGE }}>
            {s.pct > 8 && <span className="text-[10px] font-display font-semibold tabular-nums truncate px-2" style={{ color: readableTextOn(s.p.color || RIDGE) }}>{Math.round(s.pct)}%</span>}
          </div>
        ))}
        {availPct > 0.5 && (
          <div className="relative rounded-full flex items-center justify-center min-w-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-foreground/[0.06]" style={{ width: `${availPct}%` }}>
            {availPct > 8 && <span className="text-[10px] font-display font-semibold tabular-nums text-muted-foreground truncate px-2">{Math.round(availPct)}%</span>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
        <span>Totaal inkomen <strong className="text-foreground tabular-nums">{fmtEuro(income)}</strong></span>
        <span>Besteed <strong className="text-foreground tabular-nums">{Math.round(totalResPct)}%</strong> · Vrij <strong className="text-foreground tabular-nums">{Math.round(availPct)}%</strong></span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {segs.map((s) => (
          <div key={s.p.id} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.p.color || RIDGE }} />
            <span className="text-[11px] text-foreground">{s.p.name} <span className="text-muted-foreground tabular-nums">{fmtEuro(s.res)} · {Math.round(s.pct)}%</span></span>
          </div>
        ))}
        {availPct > 0.5 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full shrink-0 bg-foreground/15" />
            <span className="text-[11px] text-foreground">Vrij <span className="text-muted-foreground tabular-nums">{Math.round(availPct)}%</span></span>
          </div>
        )}
      </div>

      {overflow && <p className="text-[11px] font-semibold mt-2" style={{ color: "hsl(var(--life-urgent))" }}>Reserveringen overschrijden je inkomen.</p>}
    </div>
  );
}