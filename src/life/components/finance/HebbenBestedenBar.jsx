import React from "react";

/** HebbenBestedenBar — maakt "geld hebben vs. besteden" heel duidelijk:
 *  één balk die het TOTAAL splitst in BESTEMD (rook, heeft een bestemming) en
 *  VRIJ TE BESTEDEN (ridge). LIFE-palet. */
export default function HebbenBestedenBar({ total, reserved, available }) {
  const tot = Math.max(Number(total) || 0, 0.0001);
  const resPct = Math.min(100, (Math.max(0, reserved) / tot) * 100);
  const availPct = Math.max(0, 100 - resPct);
  const overflow = Number(reserved) > Number(total);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-smoke">Geld hebben</p>
        <p className="text-2xl font-display font-semibold tabular-nums text-foreground">€{Math.round(total)}</p>
      </div>
      <div className="flex h-20 rounded-xl overflow-hidden shadow-[0_14px_30px_-16px_rgba(0,0,0,0.3)] mt-2">
        <div style={{ width: `${resPct}%`, background: "hsl(var(--smoke))" }} className="flex flex-col justify-end p-3 min-w-0">
          <p className="text-[9px] uppercase tracking-wide font-semibold text-ivory/80">Bestemd</p>
          <p className="text-xl font-display font-semibold tabular-nums leading-none text-ivory">€{Math.round(reserved)}</p>
        </div>
        <div style={{ width: `${availPct}%`, background: "hsl(var(--life-ridge))" }} className="flex flex-col justify-end p-3 min-w-0">
          <p className="text-[9px] uppercase tracking-wide font-semibold text-foreground/70">Vrij te besteden</p>
          <p className="text-xl font-display font-semibold tabular-nums leading-none text-foreground">€{Math.round(Math.max(0, available))}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
        <span>Geld met een bestemming is <strong className="text-foreground">niet vrij</strong> besteedbaar — het wacht op een vaste last of doel.</span>
        {overflow && <span className="font-semibold" style={{ color: "hsl(var(--life-urgent))" }}>bestemd &gt; aanwezig</span>}
      </div>
    </div>
  );
}