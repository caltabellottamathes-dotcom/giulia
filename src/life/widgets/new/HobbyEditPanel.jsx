import React from "react";
import { X, Check } from "lucide-react";

const LEVEL_LABELS = [
  ["active", "Actief"],
  ["new", "Nieuw"],
  ["reactivating", "Herlevend"],
  ["emerging", "Opkomend"],
  ["quiet", "Stil"],
  ["archived", "Archief"],
];

const chip = (on) =>
  `px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
    on ? "bg-white/25 text-white" : "bg-white/10 text-white/70 border border-white/15"
  }`;
const chipSmall = (on) =>
  `px-2 py-1 rounded-md text-[9px] font-semibold transition-colors ${
    on ? "bg-white/25 text-white" : "bg-white/10 text-white/60 border border-white/15"
  }`;

/** HobbyEditPanel — rechterpaneel na selectie van een hobby-bar.
 *  Status (actief/inactief), bezigheid-niveau (activity_level) en
 *  "markeer net bezig" worden via onUpdate naar de Hobby-entity (of mock)
 *  teruggeschreven. */
export default function HobbyEditPanel({ hobby, theme, level, onUpdate, onClose }) {
  if (!hobby) return null;
  const isActive = hobby.status !== "inactive";
  return (
    <div className="relative h-full flex flex-col p-3.5 text-white">
      <button
        onClick={onClose}
        className="absolute top-2 left-2 h-7 w-7 rounded-full flex items-center justify-center bg-white/10 border border-white/15 hover:bg-white/20 transition-colors"
        aria-label="Sluiten"
      >
        <X size={13} />
      </button>

      <div className="mt-7">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: theme.color }} />
          <span className="text-[9px] uppercase tracking-[0.18em] font-bold opacity-90">{theme.name}</span>
        </div>
        <h3 className="text-[17px] leading-tight font-display font-semibold mt-1">{hobby.title}</h3>
        <p className="text-[9px] uppercase tracking-[0.16em] mt-0.5 opacity-55">niveau {level}/8</p>
      </div>

      <div className="mt-4">
        <p className="text-[8px] uppercase tracking-[0.18em] opacity-50 mb-1.5">Status</p>
        <div className="flex gap-1.5">
          <button onClick={() => onUpdate({ status: "active" })} className={chip(isActive)}>
            {isActive && <Check size={11} />} Actief
          </button>
          <button onClick={() => onUpdate({ status: "inactive" })} className={chip(!isActive)}>
            {!isActive && <Check size={11} />} Inactief
          </button>
        </div>
      </div>

      <div className="mt-3.5">
        <p className="text-[8px] uppercase tracking-[0.18em] opacity-50 mb-1.5">Bezigheid</p>
        <div className="flex flex-wrap gap-1">
          {LEVEL_LABELS.map(([k, label]) => (
            <button key={k} onClick={() => onUpdate({ activity_level: k })} className={chipSmall(hobby.activity_level === k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onUpdate({ last_activity_date: new Date().toISOString(), activity_level: "active", status: "active" })}
        className="mt-4 rounded-xl px-3 py-2.5 text-[11px] font-semibold flex items-center gap-1.5 bg-white/15 border border-white/20 hover:bg-white/25 transition-colors"
      >
        <Check size={13} /> Markeer net bezig
      </button>
    </div>
  );
}