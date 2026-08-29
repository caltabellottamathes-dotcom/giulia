import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { bumpRefresh } from "@/lib/refreshBus";

/**
 * RenewOverviewCard — editorial glaskaart met grote bewegende live-knop.
 * Eén tik roept bumpRefresh() aan: alles (useEntityList + useLearningSync +
 * mediatheek) haalt de meest recente data op, in dit tabblad én de volgende.
 * Stijl sluit aan bij de AdminCard-editorial: uppercase display, mono-labels,
 * stuitende accentdot, continue ademende/roterende live-knop.
 */
export default function RenewOverviewCard() {
  const [spinKey, setSpinKey] = useState(0);
  const trigger = () => {
    bumpRefresh();
    setSpinKey((k) => k + 1);
    window.dispatchEvent(new CustomEvent("giulia:renew-editorial"));
  };

  return (
    <div className="relative w-full h-full rounded-[18px] glass-2 overflow-hidden flex flex-col justify-between p-5">
      {/* boven: eyebrow + LIVE-indicator */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55">
          <span className="font-bold">Personal Admin</span> | renew_
        </p>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-olive opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-olive" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/45">live</span>
        </div>
      </div>

      {/* midden: grote editorial titel */}
      <div>
        <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.9] text-foreground" style={{ fontSize: "clamp(26px, 2.4vw, 42px)" }}>
          Renew<br />overview
          <span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-olive ml-1.5 align-baseline" style={{ width: "clamp(8px,0.7vw,12px)", height: "clamp(8px,0.7vw,12px)" }} />
        </h2>
        <p className="font-body text-[12px] leading-snug text-foreground/55 mt-3 max-w-[16rem]">
          Eén tik ververst het hele overzicht — alle tabbladen, nu en straks, met de meest recente data.
        </p>
      </div>

      {/* onder: grote bewegende live-knop */}
      <div className="flex items-end justify-between">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40">tap to sync</p>
        <button onClick={trigger} className="relative h-16 w-16 rounded-full flex items-center justify-center group" aria-label="Vernieuw overzicht">
          {/* roterende conic ring */}
          <span className="absolute inset-0 rounded-full opacity-40 renew-ring" style={{ background: "conic-gradient(from 0deg, hsl(var(--olive)), hsl(var(--ridge-deep)), hsl(var(--olive)))" }} />
          {/* ademende halo */}
          <span className="absolute -inset-1 rounded-full animate-pulse-soft" style={{ boxShadow: "0 0 0 2px hsl(var(--olive) / 0.25)" }} />
          {/* witte kern */}
          <span className="absolute inset-[3px] rounded-full" style={{ background: "hsl(var(--warm-white))" }} />
          <RefreshCw key={spinKey} className="relative h-6 w-6 text-foreground/75 renew-spin transition-transform duration-300 group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}