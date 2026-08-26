import React from "react";

/** DistributionBar — gestapelde balk: INCOME → RESERVED → AVAILABLE. */
export default function DistributionBar({ income, reserved, available }) {
  const inc = Math.max(Number(income) || 0, 0.0001);
  const resPct = Math.min(100, (Math.max(0, reserved) / inc) * 100);
  const availPct = Math.max(0, 100 - resPct);
  const overflow = reserved > inc;
  return (
    <div>
      <div className="flex h-16 rounded-xl overflow-hidden shadow-[0_14px_30px_-16px_rgba(0,0,0,0.3)]">
        <div style={{ width: `${resPct}%`, background: "hsl(var(--d-focus-deep))" }} className="flex items-end p-2.5 min-w-0">
          <div className="text-ivory">
            <p className="text-[9px] uppercase tracking-wide font-semibold opacity-80">Reserved</p>
            <p className="text-lg font-display font-semibold tabular-nums leading-none">€{Math.round(reserved)}</p>
          </div>
        </div>
        <div style={{ width: `${availPct}%`, background: "hsl(var(--d-focus-light))" }} className="flex items-end p-2.5 min-w-0">
          <div className="text-foreground">
            <p className="text-[9px] uppercase tracking-wide font-semibold opacity-80">Available</p>
            <p className="text-lg font-display font-semibold tabular-nums leading-none">€{Math.round(Math.max(0, available))}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
        <span>Maandelijks inkomen <strong className="text-foreground tabular-nums">€{Math.round(income)}</strong></span>
        {overflow && <span className="font-semibold" style={{ color: "hsl(var(--d-focus-urgent))" }}>Reserveringen overschrijden inkomen</span>}
      </div>
    </div>
  );
}