import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const TOP = [
  { n: 1, t: "Identiteit-richting uitwerken", cat: "Identiteit" },
  { n: 2, t: "Marktonderzoek rapport opstellen", cat: "Marktonderzoek" },
  { n: 3, t: "Marktonderzoek data analyse", cat: "Marktonderzoek" },
];
const AGENDA = [
  { time: "10:00", t: "Identiteit-richting uitwerken", ctx: "Identiteit · 90min" },
  { time: "14:00", t: "Concept Brons review", ctx: "Concept Brons · 45min" },
];

export default function SlickBriefing() {
  return (
    <div>
      <Head title="Dagelijkse Briefing" tag="Vandaag" />
      <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-6 mb-6">
        <p className="text-marble/60 text-xs uppercase tracking-wider">donderdag</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h2 className="text-slickstorm text-3xl font-bold tracking-tight">13 augustus</h2>
          <span className="text-marble/60 text-sm">22° · Zonnig</span>
        </div>
        <p className="text-slickstorm/80 text-sm mt-4 leading-relaxed">
          Goedemorgen Giulia. Je hebt vandaag 2 afspraken en 3 lopende prioriteiten. Focus eerst op het Marktanalyse
          rapport.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section>
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
            <span className="tabular-nums">(1)</span> Top prioriteiten vandaag
          </p>
          <div className="space-y-2">
            {TOP.map((p) => (
              <div key={p.n} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3 flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-marble/20 text-slickstorm text-sm font-bold flex items-center justify-center">{p.n}</span>
                <div>
                  <p className="text-slickstorm text-sm font-medium">{p.t}</p>
                  <p className="text-marble/60 text-[11px]">{p.cat}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
            <span className="tabular-nums">(2)</span> Agenda vandaag
          </p>
          <div className="space-y-2">
            {AGENDA.map((a) => (
              <div key={a.time} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3 flex items-center gap-3">
                <span className="text-slickstorm text-sm font-semibold tabular-nums w-12">{a.time}</span>
                <div>
                  <p className="text-slickstorm text-sm font-medium">{a.t}</p>
                  <p className="text-marble/60 text-[11px]">{a.ctx}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-marble/60 text-xs mt-3 italic">
            Tip van de dag: begin met de zwaarste taak voordat je e-mail opent.
          </p>
        </section>
      </div>
    </div>
  );
}