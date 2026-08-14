import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const DONE = [
  { t: "Marktanalyse Q3 voorbereiden", cat: "Marktonderzoek", date: "2026-08-13" },
  { t: "Klantgesprek Giulia", cat: "Afspraken", date: "2026-08-13" },
  { t: "Concurrentieonderzoek notities", cat: "Onderzoek", date: "2026-08-15" },
  { t: "Onderzoek doelgroep samenvatten", cat: "Onderzoek", date: "2026-08-20" },
];
const PROJECTS = [{ t: "Concurrentieanalyse", org: "Intern · afgerond 2026-08-10" }];

export default function SlickArchief() {
  return (
    <div>
      <Head title="Archief" tag="Geschiedenis" />
      <section className="mb-8">
        <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
          <span className="tabular-nums">(1)</span> Voltooide taken <span className="text-marble/50">({DONE.length})</span>
        </p>
        <div className="space-y-2">
          {DONE.map((d) => (
            <div key={d.t} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3 flex items-center gap-3">
              <span className="h-5 w-5 rounded-full bg-olive/20 text-olive text-[10px] flex items-center justify-center">✓</span>
              <span className="text-slickstorm text-sm flex-1">{d.t}</span>
              <span className="text-marble/50 text-[11px]">{d.cat}</span>
              <span className="text-marble/70 text-[11px] tabular-nums">{d.date}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
          <span className="tabular-nums">(2)</span> Afgesloten projecten <span className="text-marble/50">({PROJECTS.length})</span>
        </p>
        <div className="space-y-2">
          {PROJECTS.map((p) => (
            <div key={p.t} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4">
              <p className="text-slickstorm text-sm font-semibold">{p.t}</p>
              <p className="text-marble/60 text-xs">{p.org}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}