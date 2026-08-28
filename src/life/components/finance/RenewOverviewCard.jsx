import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { bumpRefresh } from "@/lib/refreshBus";

/**
 * RenewOverviewCard — lege zwevende glaskaart met een geanimeerde
 * vernieuwknop. Eén tik roept bumpRefresh() aan: alles (useEntityList +
 * useLearningSync + mediatheek) haalt de meest recente data op, in dit
 * tabblad én de volgende.
 */
export default function RenewOverviewCard() {
  const [spinKey, setSpinKey] = useState(0);
  const trigger = () => {
    bumpRefresh();
    setSpinKey((k) => k + 1);
  };

  return (
    <div className="relative w-full h-full rounded-[18px] glass-2 flex flex-col items-center justify-center overflow-hidden">
      <p className="absolute top-3 left-4 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">Renew Overview</p>
      <p className="absolute top-3 right-4 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">alle tabs</p>

      <button onClick={trigger} className="relative h-20 w-20 rounded-full flex items-center justify-center group" aria-label="Vernieuw overzicht">
        <span className="absolute inset-0 rounded-full opacity-30 renew-ring" style={{ background: "conic-gradient(from 0deg, hsl(var(--olive)), hsl(var(--ridge-deep)), hsl(var(--olive)))" }} />
        <span className="absolute inset-[3px] rounded-full" style={{ background: "hsl(var(--warm-white))" }} />
        <span className="absolute inset-0 rounded-full animate-pulse-soft" style={{ boxShadow: "0 0 0 2px hsl(var(--olive) / 0.22)" }} />
        <RefreshCw key={spinKey} className="relative h-7 w-7 text-foreground/75 renew-spin" />
      </button>

      <p className="mt-4 font-display font-semibold text-[15px] text-foreground/80 tracking-[-0.01em]">Vernieuw overzicht</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/45 mt-1">dit + volgende tabs · laatste data</p>
    </div>
  );
}