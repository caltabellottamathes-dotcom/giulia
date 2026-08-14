import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const SECTIONS = [
  {
    label: "Lopend",
    count: 3,
    items: [
      { t: "Marktanalyse Q3", org: "Brons & Co", pct: 72, tags: ["G", "M", "S"], dl: "2026-08-30", next: "Rapport concept" },
      { t: "Identiteit pakket", org: "Studio Giulia", pct: 45, tags: ["G", "L"], dl: "2026-09-12", next: "Kleurenpallet" },
      { t: "Onderzoek doelgroep", org: "Intern", pct: 90, warn: "⚠ 7d", tags: ["S"], dl: "2026-08-20", next: "Samenvatting" },
    ],
  },
  {
    label: "Gepland",
    count: 2,
    items: [
      { t: "Concept Brons pitch", org: "Brons", pct: 30, tags: ["G", "M", "S", "L"], dl: "2026-08-21", next: "Pitch deck" },
      { t: "Wervingscampagne briefing", org: "HR", pct: 15, tags: ["M", "L"], dl: "2026-09-05", next: "Briefing opstellen" },
    ],
  },
  {
    label: "Voltooid",
    count: 1,
    items: [{ t: "Concurrentieanalyse", org: "Intern", pct: 100, tags: ["S", "G"], dl: "2026-08-10", next: "—" }],
  },
];
const TAG_COLORS = { G: "bg-clay", M: "bg-sand", S: "bg-sky", L: "bg-slickstorm" };

export default function SlickProjecten() {
  return (
    <div>
      <Head
        title="Lopende Projecten"
        tag="Werk"
        right={
          <div className="flex gap-3">
            <Stat n={3} l="Lopend" />
            <Stat n={2} l="Gepland" />
            <Stat n={1} l="Voltooid" />
          </div>
        }
      />
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.label}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slickstorm text-sm font-semibold">{s.label}</span>
              <span className="text-marble/50 text-xs tabular-nums">{s.count}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {s.items.map((p) => (
                <div key={p.t} className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-slickstorm text-sm font-semibold">{p.t}</p>
                      <p className="text-marble/60 text-[11px]">{p.org}</p>
                    </div>
                    {p.warn && <span className="text-[10px] text-urgent font-medium">{p.warn}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 rounded-full bg-marble/15 overflow-hidden">
                      <div className="h-full bg-marble/70 rounded-full" style={{ width: `${p.pct}%` }} />
                    </div>
                    <span className="text-slickstorm text-[11px] tabular-nums font-medium">{p.pct}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {p.tags.map((tg) => (
                      <span
                        key={tg}
                        className={`h-4 w-4 rounded-full text-[9px] text-metal flex items-center justify-center font-bold ${TAG_COLORS[tg] || "bg-marble"}`}
                      >
                        {tg}
                      </span>
                    ))}
                    <span className="ml-auto text-marble/50 text-[10px]">Deadline</span>
                    <span className="text-marble/80 text-[10px] tabular-nums">{p.dl}</span>
                  </div>
                  <p className="text-marble/70 text-[11px] mt-2">{p.next}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div className="text-center">
      <p className="text-slickstorm text-base font-bold tabular-nums">{n}</p>
      <p className="text-marble/50 text-[10px]">{l}</p>
    </div>
  );
}