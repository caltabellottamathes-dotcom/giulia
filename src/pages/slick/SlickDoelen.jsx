import React, { useState } from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const TABS = ["alle", "Professioneel", "Persoonlijk"];
const GOALS = [
  { cat: "Professioneel", t: "Marktanalyse Q3 afronden", doel: "2026-09-30", pct: 72, marks: ["Data verzameld", "Analyse", "Rapport"] },
  { cat: "Persoonlijk", t: "3x per week sporten", doel: "Doorlopend", pct: 60, marks: ["Maandag", "Woensdag", "Vrijdag"] },
  { cat: "Professioneel", t: "Identiteit pakket leveren", doel: "2026-09-12", pct: 45, marks: ["Logo", "Kleuren", "Typo"] },
  { cat: "Persoonlijk", t: "20 boeken lezen dit jaar", doel: "2026-12-31", pct: 55, marks: ["11 gelezen"] },
  { cat: "Professioneel", t: "Concept Brons pitch winnen", doel: "2026-08-21", pct: 30, marks: ["Deck", "Oefening"] },
  { cat: "Persoonlijk", t: "Dagelijks 30 min lezen", doel: "Doorlopend", pct: 80, marks: ["Streak 24d"] },
];

export default function SlickDoelen() {
  const [tab, setTab] = useState("alle");
  const list = GOALS.filter((g) => tab === "alle" || g.cat === tab);
  return (
    <div>
      <Head title="Doelen Dashboard" tag="Groei" />
      <div className="flex gap-2 mb-5">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((g) => (
          <div key={g.t} className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4">
            <p className="text-marble/60 text-[10px] uppercase tracking-wider">{g.cat}</p>
            <h3 className="text-slickstorm text-base font-semibold mt-1">{g.t}</h3>
            <p className="text-marble/60 text-xs">Doel: {g.doel}</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 rounded-full bg-marble/15 overflow-hidden">
                <div className="h-full bg-marble/70 rounded-full" style={{ width: `${g.pct}%` }} />
              </div>
              <span className="text-slickstorm text-[11px] tabular-nums font-medium">{g.pct}%</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {g.marks.map((m) => (
                <span key={m} className="text-[10px] rounded-full border border-marble/25 bg-marble/5 text-marble/70 px-2 py-0.5">
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}