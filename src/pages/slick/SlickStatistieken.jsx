import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const STATS = [
  { l: "Voltooid", v: "4" },
  { l: "Lopend", v: "3" },
  { l: "Gepland", v: "7" },
  { l: "Totaal uren", v: "19.9" },
];
const CATEGORIES = [
  { l: "Marktonderzoek", min: 400 },
  { l: "Concept Brons", min: 225 },
  { l: "Identiteit", min: 210 },
  { l: "Afspraken", min: 195 },
  { l: "Onderzoek", min: 165 },
];
const STATUS = [
  { l: "Voltooid", n: 4, color: "bg-olive" },
  { l: "Lopend", n: 3, color: "bg-sky" },
  { l: "Gepland", n: 7, color: "bg-clay" },
];
const MAX_CAT = Math.max(...CATEGORIES.map((c) => c.min));
const MAX_ST = Math.max(...STATUS.map((s) => s.n));

export default function SlickStatistieken() {
  return (
    <div>
      <Head title="Statistieken" tag="Privé" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <div key={s.l} className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4 text-center">
            <p className="text-slickstorm text-2xl font-bold tabular-nums">{s.v}</p>
            <p className="text-marble/60 text-[10px] uppercase tracking-wider mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section>
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
            <span className="tabular-nums">(1)</span> Tijd besteed per categorie (minuten)
          </p>
          <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4 space-y-3">
            {CATEGORIES.map((c) => (
              <div key={c.l} className="flex items-center gap-3">
                <span className="text-slickstorm/80 text-xs w-28 truncate">{c.l}</span>
                <div className="flex-1 h-2 rounded-full bg-marble/15 overflow-hidden">
                  <div className="h-full bg-marble/70 rounded-full" style={{ width: `${(c.min / MAX_CAT) * 100}%` }} />
                </div>
                <span className="text-marble/70 text-[11px] tabular-nums w-10 text-right">{c.min}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
            <span className="tabular-nums">(2)</span> Statusverdeling
          </p>
          <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4 space-y-3">
            {STATUS.map((s) => (
              <div key={s.l} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <span className="text-slickstorm/80 text-xs flex-1">{s.l}</span>
                <div className="w-24 h-2 rounded-full bg-marble/15 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.n / MAX_ST) * 100}%` }} />
                </div>
                <span className="text-slickstorm text-[11px] tabular-nums w-6 text-right">{s.n}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}