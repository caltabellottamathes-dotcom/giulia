import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PANELS = [
  { to: "/glass/self/daily-state", n: "01", title: "Daily State", desc: "Wat is er nu met mij aan de hand?" },
  { to: "/glass/self/routines", n: "02", title: "Routines", desc: "Waar ben ik en wat komt hierna?" },
  { to: "/glass/self/wake", n: "03", title: "Wake", desc: "Een frictieloze ochtend-control room." },
  { to: "/glass/self/therapy", n: "04", title: "Therapy", desc: "Lopende trajecten en komende afspraken." },
  { to: "/glass/self/journal", n: "05", title: "Journal", desc: "Wat verzamelde SELF vandaag?" },
  { to: "/glass/self/development", n: "06", title: "Development", desc: "Waar beweegt momenteel iets?" },
  { to: "/glass/self/personal-time", n: "07", title: "Personal Time", desc: "Hoeveel ruimte heb ik voor mezelf?" },
  { to: "/glass/self/insights", n: "08", title: "Insights", desc: "Wat heeft SELF opgemerkt?" },
  { to: "/glass/self/food", n: "09", title: "Food", desc: "Menu van vandaag — klik voor recept." },
];

export default function SelfIndex() {
  return (
    <div className="h-[100dvh] w-full bg-metal overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 18% 16%, rgba(224,222,211,0.22) 0%, rgba(242,242,240,0.10) 28%, rgba(45,45,35,0) 60%)" }} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8 py-6 h-full">
        <div className="rounded-[28px] border border-marble/30 bg-marble/10 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] p-5 sm:p-8 h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <span className="text-storm/60 text-[11px] uppercase tracking-[0.3em]">SELF — PANELS</span>
            <Link to="/glass" className="text-storm/60 hover:text-storm text-sm">← Terug</Link>
          </div>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">SELF</h1>
          <p className="text-storm/60 text-sm mt-3 max-w-md">Acht panelen. Eén per SELF-widget. Help me understand and act.</p>

          <div className="h-px bg-marble/20 my-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 content-center">
            {PANELS.map((p) => (
              <Link key={p.to} to={p.to} className="group rounded-2xl border border-marble/30 bg-marble/5 p-6 hover:bg-marble/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-storm/40 text-xs tabular-nums">{p.n}</span>
                  <ArrowRight className="w-4 h-4 text-storm/40 group-hover:text-storm transition-colors" />
                </div>
                <h3 className="text-storm text-lg font-semibold mt-4">{p.title}</h3>
                <p className="text-storm/60 text-xs mt-1 leading-relaxed">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}