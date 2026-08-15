import React from "react";
import { cn } from "@/lib/utils";

/**
 * LifeOverviewCards — compacte grafische kaartjes-strip bovenaan elke
 * LIFE-pagina. Geeft meteen de staat van de module in één blik, zodat je
 * niet hoeft te scrollen door de detailtabbladen om te weten waar je staat.
 *
 * cards: [{ label, value, hint?, accent? ("blue"|"sand") }]
 */
const ACCENTS = {
  blue: "hsl(var(--life-blue-deep))",
  sand: "hsl(var(--life-sand-deep))",
};

export default function LifeOverviewCards({ cards = [], className }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {cards.map((c, i) => {
        const bar = ACCENTS[c.accent] || ACCENTS.blue;
        return (
          <div key={i} className="relative overflow-hidden rounded-[20px] border border-border bg-card/70 px-4 py-3.5 backdrop-blur-sm">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${bar} 18%, ${bar} 82%, transparent)` }} />
            <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-1.5">{c.label}</p>
            <p className="text-2xl font-display font-semibold tracking-[-0.02em] leading-none">{c.value}</p>
            {c.hint && <p className="text-[11px] text-muted-foreground/80 mt-1.5 truncate">{c.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}