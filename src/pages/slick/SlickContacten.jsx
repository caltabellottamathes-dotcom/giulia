import React, { useState } from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const TABS = ["Alfabet", "Categorie", "Recent"];
const PEOPLE = [
  { name: "Daan Smit", role: "Developer · Freelance", cat: "Team", date: "2026-08-09" },
  { name: "Eva Mulder", role: "Marketing · Brons & Co", cat: "Klant", date: "2026-08-11" },
  { name: "Fenna Kuiper", role: "Leverancier · PaperWorks", cat: "Leverancier", date: "2026-08-06" },
  { name: "Giulia Romano", role: "Creative Director · Studio Giulia", cat: "Klant", date: "2026-08-13" },
  { name: "Liam de Boer", role: "Designer · Freelance", cat: "Team", date: "2026-08-14" },
  { name: "Marc Brons", role: "Oprichter · Brons & Co", cat: "Klant", date: "2026-08-12" },
  { name: "Noor Bakker", role: "Project Manager · Bureau", cat: "Team", date: "2026-08-10" },
  { name: "Sara Visser", role: "Onderzoeker · Freelance", cat: "Team", date: "2026-08-15" },
  { name: "Tom Jansen", role: "Leverancier · PrintCo", cat: "Leverancier", date: "2026-08-08" },
];
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");

export default function SlickContacten() {
  const [tab, setTab] = useState("Alfabet");
  const groups = {};
  PEOPLE.forEach((p) => {
    const L = p.name[0].toUpperCase();
    (groups[L] ||= []).push(p);
  });
  return (
    <div>
      <Head title="Contacten" tag="Netwerk" />
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              tab === t
                ? "border-marble/50 bg-marble/25 text-slickstorm"
                : "border-marble/30 bg-marble/10 text-marble/70 hover:bg-marble/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-5">
        {Object.entries(groups).map(([L, ps]) => (
          <div key={L}>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-6 w-6 rounded-lg border border-marble/30 bg-marble/15 text-slickstorm text-xs font-bold flex items-center justify-center">
                {L}
              </span>
              <span className="text-marble/50 text-xs tabular-nums">{ps.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ps.map((p) => (
                <div key={p.name} className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3 flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-marble/20 text-slickstorm text-xs font-bold flex items-center justify-center shrink-0">
                    {initials(p.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-slickstorm text-sm font-medium truncate">{p.name}</p>
                    <p className="text-marble/60 text-[11px] truncate">{p.role}</p>
                    <p className="text-marble/40 text-[10px] mt-0.5">{p.cat} · {p.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}