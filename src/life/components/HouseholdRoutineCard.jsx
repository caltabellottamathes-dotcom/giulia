import React from "react";
import { routineState, nextExpected } from "@/lib/householdUtils";

const SAND = "hsl(var(--life-sand))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";
const BLUE_DEEP = "hsl(var(--life-blue-deep))";

const fmt = (d) => d ? new Date(d).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "—";
const ago = (d) => { if (!d) return "—"; const n = Math.round((Date.now() - new Date(d).getTime()) / 86400000); return n <= 0 ? "vandaag" : n === 1 ? "gisteren" : `${n} dagen geleden`; };

/** HouseholdRoutineCard — visuele routine card met frequentie, laatste en
 *  volgende verwachte moment, en een cadence-status. */
export default function HouseholdRoutineCard({ item, onOpen, selected, onDone }) {
  if (!item) return null;
  const state = routineState(item);
  const next = nextExpected(item);
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{ background: "hsl(var(--card))", boxShadow: selected ? `0 18px 44px -22px rgba(0,0,0,0.30), 0 0 0 2px ${BLUE_DEEP}` : "0 18px 44px -28px rgba(0,0,0,0.30)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-display font-semibold tracking-tight text-foreground truncate">{item.title}</h3>
          <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/45 mt-1 font-semibold">
            {item.frequency_days ? `Elke ${item.frequency_days} dagen` : item.next_due ? "Vaste dag" : "Eenmalig"}
          </p>
        </div>
        <span className="inline-block rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide font-semibold shrink-0" style={{ background: state.hot ? SAND : "hsl(var(--foreground) / 0.06)", color: state.hot ? "hsl(var(--charcoal))" : "hsl(var(--muted-foreground))" }}>{state.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-foreground/8">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-foreground/40 font-semibold">Laatst gedaan</p>
          <p className="text-sm mt-0.5">{ago(item.last_done)}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide text-foreground/40 font-semibold">Volgende verwacht</p>
          <p className="text-sm mt-0.5" style={{ color: state.hot ? SAND_DEEP : "hsl(var(--foreground))" }}>{next ? fmt(next) : "—"}</p>
        </div>
      </div>

      {onDone && (
        <div className="mt-3 flex justify-end">
          <span onClick={(e) => { e.stopPropagation(); onDone(item); }} className="text-xs font-semibold text-life-blue-deep hover:underline">Markeer voltooid</span>
        </div>
      )}
    </button>
  );
}