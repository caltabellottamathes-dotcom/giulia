import React, { useState } from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync
import { Plus } from "lucide-react";

const TABS = ["alle", "gepland", "lopend", "voltooid"];
const TASKS = [
  { d: "aug12", t: "Marktanalyse Q3 voorbereiden", cat: "Marktonderzoek", time: "09:00 · 120 min", st: "Voltooid" },
  { d: "aug12", t: "Klantgesprek Giulia", cat: "Afspraken", time: "11:30 · 60 min", st: "Voltooid" },
  { d: "aug13", t: "Identiteit-richting uitwerken", cat: "Identiteit", time: "10:00 · 90 min", st: "Lopend" },
  { d: "aug13", t: "Concept Brons review", cat: "Concept Brons", time: "14:00 · 45 min", st: "Gepland" },
  { d: "aug14", t: "Concurrentieonderzoek notities", cat: "Onderzoek", time: "08:30 · 75 min", st: "Voltooid" },
  { d: "aug14", t: "Briefing wervingscampagne", cat: "Afspraken", time: "13:00 · 60 min", st: "Gepland" },
  { d: "aug15", t: "Marktonderzoek rapport opstellen", cat: "Marktonderzoek", time: "09:30 · 150 min", st: "Lopend" },
  { d: "aug16", t: "Logo-iteraties Concept Brons", cat: "Concept Brons", time: "11:00 · 100 min", st: "Gepland" },
  { d: "aug17", t: "Telefoonafspraak leverancier", cat: "Afspraken", time: "15:30 · 30 min", st: "Gepland" },
  { d: "aug18", t: "Identiteit kleurenpallet finaliseren", cat: "Identiteit", time: "10:00 · 120 min", st: "Gepland" },
  { d: "aug19", t: "Onderzoek doelgroep samenvatten", cat: "Onderzoek", time: "09:00 · 90 min", st: "Voltooid" },
  { d: "aug20", t: "Concept Brons pitch voorbereiden", cat: "Concept Brons", time: "14:30 · 80 min", st: "Gepland" },
  { d: "aug21", t: "Wekelijkse afstemming Giulia", cat: "Afspraken", time: "16:00 · 45 min", st: "Gepland" },
  { d: "aug23", t: "Marktonderzoek data analyse", cat: "Marktonderzoek", time: "09:30 · 130 min", st: "Lopend" },
];
const ST_STYLE = { Voltooid: "text-olive", Lopend: "text-sky", Gepland: "text-clay" };

export default function SlickTakenoverzicht() {
  const [tab, setTab] = useState("alle");
  const list = TASKS.filter((x) => tab === "alle" || x.st.toLowerCase() === tab);
  return (
    <div>
      <Head title="Takenoverzicht" tag="Privé" />
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs border capitalize transition-colors ${
              tab === t ? "border-marble/50 bg-marble/25 text-slickstorm" : "border-marble/30 bg-marble/10 text-marble/70 hover:bg-marble/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
        <span className="tabular-nums">(1)</span> Geplande taken <span className="text-marble/50">({list.length})</span>
      </p>
      <div className="space-y-2">
        {list.map((x, i) => (
          <div key={i} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3 flex items-center gap-3">
            <div className="text-center shrink-0 w-12">
              <p className="text-marble/50 text-[10px] uppercase">{x.d.slice(0, 3)}</p>
              <p className="text-slickstorm text-base font-bold tabular-nums leading-none">{x.d.slice(3)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slickstorm text-sm font-medium truncate">{x.t}</p>
              <p className="text-marble/60 text-[11px]">{x.cat} · {x.time}</p>
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${ST_STYLE[x.st]}`}>{x.st}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-xl border border-dashed border-marble/30 bg-marble/5 hover:bg-marble/15 transition py-3 text-marble/70 text-sm flex items-center justify-center gap-1.5">
        <Plus className="h-4 w-4" /> Nieuwe Taak
      </button>
    </div>
  );
}