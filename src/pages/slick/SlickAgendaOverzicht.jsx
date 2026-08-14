import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync
import { Plus } from "lucide-react";

const DAYS = [
  { d: "aug12", w: "woensdag", items: [
    { time: "09:00", t: "Marktanalyse Q3 voorbereiden", ctx: "Marktonderzoek · 120 min", type: "task", st: "Voltooid" },
    { time: "11:30", t: "Klantgesprek Giulia", ctx: "Afspraken · 60 min", type: "afspraak", st: "Voltooid" },
  ]},
  { d: "aug13", w: "donderdag", items: [
    { time: "10:00", t: "Identiteit-richting uitwerken", ctx: "Identiteit · 90 min", type: "task", st: "Lopend" },
    { time: "14:00", t: "Concept Brons review", ctx: "Concept Brons · 45 min", type: "afspraak", st: "Gepland" },
  ]},
  { d: "aug14", w: "vrijdag", items: [
    { time: "08:30", t: "Concurrentieonderzoek notities", ctx: "Onderzoek · 75 min", type: "task", st: "Voltooid" },
    { time: "13:00", t: "Briefing wervingscampagne", ctx: "Afspraken · 60 min", type: "afspraak", st: "Gepland" },
  ]},
  { d: "aug15", w: "zaterdag", items: [{ time: "09:30", t: "Marktonderzoek rapport opstellen", ctx: "Marktonderzoek · 150 min", type: "task", st: "Lopend" }] },
  { d: "aug16", w: "zondag", items: [{ time: "11:00", t: "Logo-iteraties Concept Brons", ctx: "Concept Brons · 100 min", type: "task", st: "Gepland" }] },
  { d: "aug17", w: "maandag", items: [{ time: "15:30", t: "Telefoonafspraak leverancier", ctx: "Afspraken · 30 min", type: "afspraak", st: "Gepland" }] },
  { d: "aug18", w: "dinsdag", items: [{ time: "10:00", t: "Identiteit kleurenpallet finaliseren", ctx: "Identiteit · 120 min", type: "task", st: "Gepland" }] },
  { d: "aug19", w: "woensdag", items: [{ time: "09:00", t: "Onderzoek doelgroep samenvatten", ctx: "Onderzoek · 90 min", type: "task", st: "Voltooid" }] },
  { d: "aug20", w: "donderdag", items: [{ time: "14:30", t: "Concept Brons pitch voorbereiden", ctx: "Concept Brons · 80 min", type: "task", st: "Gepland" }] },
  { d: "aug21", w: "vrijdag", items: [{ time: "16:00", t: "Wekelijkse afstemming Giulia", ctx: "Afspraken · 45 min", type: "afspraak", st: "Gepland" }] },
  { d: "aug23", w: "zondag", items: [{ time: "09:30", t: "Marktonderzoek data analyse", ctx: "Marktonderzoek · 130 min", type: "task", st: "Lopend" }] },
];
const ST_STYLE = { Voltooid: "text-olive", Lopend: "text-sky", Gepland: "text-clay" };

export default function SlickAgendaOverzicht() {
  return (
    <div>
      <Head title="Agenda Overzicht" tag="Privé" />
      <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-4">
        <span className="tabular-nums">(1)</span> Chronologisch overzicht
      </p>
      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day.d} className="flex gap-4">
            <div className="w-16 shrink-0 text-center pt-2">
              <p className="text-slickstorm text-xl font-bold tabular-nums leading-none">{day.d.slice(3)}</p>
              <p className="text-marble/50 text-[10px] uppercase tracking-wider mt-1">{day.d.slice(0, 3)}</p>
              <p className="text-marble/60 text-[10px] mt-1">{day.w}</p>
              <p className="text-marble/40 text-[10px]">{day.items.length} item{day.items.length > 1 ? "s" : ""}</p>
            </div>
            <div className="flex-1 space-y-2">
              {day.items.map((it) => (
                <div key={it.time + it.t} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3 flex items-center gap-3">
                  <span className="text-slickstorm text-sm font-semibold tabular-nums w-12">{it.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-slickstorm text-sm font-medium truncate">{it.t}</p>
                    <p className="text-marble/60 text-[11px]">{it.ctx}</p>
                  </div>
                  <span className="text-marble/50 text-[10px]">{it.type}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${ST_STYLE[it.st]}`}>{it.st}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-xl border border-dashed border-marble/30 bg-marble/5 hover:bg-marble/15 transition py-3 text-marble/70 text-sm flex items-center justify-center gap-1.5">
        <Plus className="h-4 w-4" /> Nieuwe Taak Plannen
      </button>
    </div>
  );
}