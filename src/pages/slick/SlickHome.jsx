import React from "react";
import { Search, Mail, FileText, Calendar, Plus } from "lucide-react";
// staging-sync

const ICON_PROFILES = [
  { icon: Search, color: "text-clay", active: true },
  { icon: Mail, color: "text-sand", active: true },
  { icon: FileText, color: "text-sky", active: true },
  { icon: Calendar, color: "text-marble", active: false },
];
const TEXT_PROFILES = ["Marktonderzoek", "Concept Brons", "Identiteit"];
const DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

const cellBtn =
  "rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md transition-all duration-200 hover:bg-marble/20 active:scale-95 aspect-square flex items-center justify-center";

export default function SlickHome() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Linker kolom — begroeting */}
      <div className="lg:w-2/5 flex flex-col justify-between min-h-[240px]">
        <div>
          <h1 className="text-slickstorm text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
            Hallo! Waarmee kan ik je vandaag helpen?
          </h1>
          <p className="text-marble/70 text-sm mt-4 leading-relaxed max-w-xs">
            Jouw assistent staat klaar. Ik kan helpen met afspraken, onderzoek, informatie-retrieval, en taakbeheer.
          </p>
        </div>
        <button className="rounded-xl border border-marble/40 bg-marble/10 backdrop-blur-md transition-all duration-200 hover:bg-marble/20 active:scale-95 self-start px-5 py-2.5 text-slickstorm text-sm font-medium">
          Book Giulia
        </button>
      </div>

      <div className="hidden lg:block w-px bg-marble/25" />

      {/* Rechter kolom — panels */}
      <div className="lg:w-3/5 flex flex-col gap-5">
        <div>
          <p className="text-marble/50 text-xs">Privé</p>
          <h2 className="text-slickstorm text-xl font-semibold tracking-tight">GIULIA Privé-assistent</h2>
        </div>

        {/* Actieve Taakprofielen */}
        <div>
          <div className="flex items-center gap-2 text-marble/70">
            <span className="text-xs font-medium tabular-nums">(1)</span>
            <span className="text-xs font-medium tracking-wide">Actieve Taakprofielen</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {ICON_PROFILES.map((p, i) => (
              <button key={i} className={`${cellBtn} ${p.active ? "bg-marble/25 shadow-inner ring-1 ring-urgent/40" : ""}`}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {TEXT_PROFILES.map((t) => (
              <button
                key={t}
                className="rounded-xl border border-marble/30 bg-marble/25 backdrop-blur-md shadow-inner ring-1 ring-urgent/40 aspect-square flex items-center justify-center text-center px-1"
              >
                <span className="text-marble text-[10px] font-medium leading-tight">{t}</span>
              </button>
            ))}
            <button className={cellBtn}>
              <Plus className="w-5 h-5 text-marble" />
            </button>
          </div>
        </div>

        {/* Taakcontext */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 text-marble/70">
              <span className="text-xs font-medium tabular-nums">(5)</span>
              <span className="text-xs font-medium tracking-wide">Taakcontext</span>
            </div>
            <p className="text-slickstorm text-base font-medium mt-2">Project Marktanalyse</p>
          </div>
        </div>

        {/* Mijn Agenda */}
        <div>
          <div className="flex items-center gap-2 text-marble/70 mb-2">
            <span className="text-xs font-medium tabular-nums">(9)</span>
            <span className="text-xs font-medium tracking-wide">Mijn Agenda</span>
          </div>
          <p className="text-slickstorm text-sm font-semibold mb-2">Mei 2020</p>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-marble/60 mb-1">
            {DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <div
                key={d}
                className="aspect-square rounded-md border border-marble/20 bg-marble/5 flex items-center justify-center text-marble/70 text-[10px]"
              >
                {d}
              </div>
            ))}
          </div>
          <button className="mt-3 w-full rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md hover:bg-marble/20 transition px-4 py-2 text-slickstorm/80 text-xs">
            — Nieuwe Taak Plannen
          </button>
        </div>
      </div>
    </div>
  );
}