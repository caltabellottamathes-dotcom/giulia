import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const CHIPS = [
  "Marktanalyse Q3 voorbereiden",
  "Klantgesprek Giulia",
  "Identiteit-richting uitwerken",
  "Concept Brons review",
  "Concurrentieonderzoek notities",
  "Briefing wervingscampagne",
  "Marktonderzoek rapport opstellen",
  "Logo-iteraties Concept",
];
const SUB = ["Data verzamelen", "Giulia interviewen", "Concept opstellen", "Rapport schrijven"];

export default function SlickTaakDetails() {
  return (
    <div>
      <Head title="Taak Details" tag="Taak" />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {CHIPS.map((c, i) => (
          <button
            key={i}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
              i === 0
                ? "border-marble/50 bg-marble/25 text-slickstorm"
                : "border-marble/30 bg-marble/10 text-marble/70 hover:bg-marble/20"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-5">
        <h2 className="text-slickstorm text-lg font-semibold">Marktanalyse Q3 voorbereiden</h2>
        <p className="text-marble/60 text-xs mt-0.5">Marktonderzoek</p>
        <div className="inline-block mt-2 text-[10px] uppercase tracking-wider rounded-full border border-olive/40 bg-olive/15 text-olive px-2 py-0.5">
          Voltooid
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Meta l="Datum" v="2026-08-13" />
          <Meta l="Tijd" v="09:00" />
          <Meta l="Duur" v="120 min" />
          <Meta l="Type" v="task" />
        </div>
        <div className="mt-6">
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2">
            <span className="tabular-nums">(1)</span> Notities
          </p>
          <p className="text-slickstorm/80 text-sm mt-2 leading-relaxed">
            Klant wil focus op Q3 cijfers en concurrentiepositie. Verzamel data uit marktrapporten en interview Giulia
            voor extra context. Rapport uiterlijk vrijdag klaar.
          </p>
        </div>
        <div className="mt-5">
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2">
            <span className="tabular-nums">(2)</span> Subtaken
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {SUB.map((s, i) => (
              <div key={s} className="rounded-xl border border-marble/30 bg-marble/10 p-3 flex items-center gap-3">
                <span className="h-5 w-5 rounded-full bg-olive/20 text-olive text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-slickstorm text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ l, v }) {
  return (
    <div>
      <p className="text-marble/50 text-[10px] uppercase tracking-wider">{l}</p>
      <p className="text-slickstorm text-sm mt-0.5 tabular-nums">{v}</p>
    </div>
  );
}