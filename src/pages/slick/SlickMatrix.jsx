import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const QUADS = [
  {
    label: "Doen",
    sub: "Urgent · Belangrijk",
    items: ["Marktanalyse Q3 voorbereiden", "Klantgesprek Giulia", "Identiteit-richting uitwerken"],
  },
  {
    label: "Delegeren",
    sub: "Urgent · Niet belangrijk",
    items: ["Concept Brons review", "Briefing wervingscampagne", "Telefoonafspraak leverancier"],
  },
  {
    label: "Plannen",
    sub: "Niet urgent · Belangrijk",
    items: ["Marktonderzoek rapport opstellen", "Identiteit kleurenpallet finaliseren", "Concept Brons pitch voorbereiden"],
  },
  {
    label: "Laten",
    sub: "Geen van beide",
    items: ["Concurrentieonderzoek notities", "Logo-iteraties Concept Brons", "Wekelijkse afstemming Giulia"],
  },
];

export default function SlickMatrix() {
  return (
    <div>
      <Head title="Prioriteiten Matrix" tag="Strategie" />
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
        <div />
        <p className="text-center text-marble/60 text-[10px] uppercase tracking-wider">Belangrijk →</p>
        <p className="text-center text-marble/60 text-[10px] uppercase tracking-wider">← Niet belangrijk</p>

        <p className="flex items-center justify-center text-marble/60 text-[10px] uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
          Urgent ↓
        </p>
        <Quad q={QUADS[0]} />
        <Quad q={QUADS[1]} />

        <p className="flex items-center justify-center text-marble/60 text-[10px] uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
          ↑ Niet urgent
        </p>
        <Quad q={QUADS[2]} />
        <Quad q={QUADS[3]} />
      </div>
    </div>
  );
}

function Quad({ q }) {
  return (
    <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4 min-h-[180px]">
      <p className="text-slickstorm text-sm font-semibold">{q.label}</p>
      <p className="text-marble/50 text-[10px] mb-3">{q.sub}</p>
      <div className="space-y-1.5">
        {q.items.map((t) => (
          <div key={t} className="rounded-lg border border-marble/20 bg-marble/5 px-3 py-2 text-slickstorm/80 text-xs">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}