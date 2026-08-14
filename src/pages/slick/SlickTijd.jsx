import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const HOURS = [
  { t: "Marktanalyse Q3", h: 18, bill: true },
  { t: "Identiteit pakket", h: 12, bill: true },
  { t: "Concept Brons pitch", h: 6, bill: false },
  { t: "Onderzoek doelgroep", h: 9, bill: true },
  { t: "Wervingscampagne", h: 3, bill: false },
  { t: "Concurrentieanalyse", h: 7, bill: true },
];
const MAX = Math.max(...HOURS.map((x) => x.h));

export default function SlickTijd() {
  return (
    <div>
      <Head title="Tijdsregistratie" tag="Tijd" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat l="Totaal" v="55u" />
        <Stat l="Factureerbaar" v="46u" />
        <Stat l="Intern" v="9u" />
      </div>
      <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-1">
        <span className="tabular-nums">(1)</span> Uren per project
      </p>
      <p className="text-marble/50 text-[11px] mb-3">
        <span className="tabular-nums">(2)</span> Specificatie
      </p>
      <div className="space-y-2">
        {HOURS.map((x) => (
          <div key={x.t} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3 flex items-center gap-3">
            <span className="text-slickstorm text-sm flex-1 truncate">{x.t}</span>
            <div className="w-32 h-1.5 rounded-full bg-marble/15 overflow-hidden">
              <div className={`h-full rounded-full ${x.bill ? "bg-sky" : "bg-clay"}`} style={{ width: `${(x.h / MAX) * 100}%` }} />
            </div>
            <span className="text-slickstorm text-xs tabular-nums w-10 text-right">{x.h}u</span>
            <span className="text-marble/50 text-[10px] w-3">{x.bill ? "€" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ l, v }) {
  return (
    <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4 text-center">
      <p className="text-slickstorm text-2xl font-bold tabular-nums">{v}</p>
      <p className="text-marble/60 text-[10px] uppercase tracking-wider mt-1">{l}</p>
    </div>
  );
}