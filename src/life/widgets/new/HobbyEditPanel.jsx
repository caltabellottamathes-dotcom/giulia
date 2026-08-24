import React from "react";
import { X, Zap } from "lucide-react";

/** HobbyEditPanel — rechterglas na selectie van een hobby-bar.
 *  Titel/thema/niveau staan al op de fotokaart, dus hier alleen bediening,
 *  naar beneden geschoven en zonder pillknoppen: dot-toggle voor status,
 *  8-traps trapmeter voor bezigheid, tekstactie voor "net bezig". */
export default function HobbyEditPanel({ hobby, theme, level, onUpdate, onClose }) {
  if (!hobby) return null;
  const isActive = hobby.status !== "inactive";

  return (
    <div className="relative h-full flex flex-col p-4 text-white">
      <button
        onClick={onClose}
        className="absolute top-3 left-3 h-6 w-6 rounded-full flex items-center justify-center bg-white/10 border border-white/15 hover:bg-white/20 transition-colors z-10"
        aria-label="Sluiten"
      >
        <X size={11} />
      </button>

      <div className="mt-auto space-y-6">
        {/* STATUS — dot-toggle, geen pillen */}
        <div>
          <p className="text-[8px] uppercase tracking-[0.24em] opacity-45 mb-2.5">Status</p>
          <div className="flex items-center gap-5">
            <button onClick={() => onUpdate({ status: "active" })} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full transition-all" style={{ background: isActive ? theme.color : "transparent", border: isActive ? "none" : "1px solid rgba(255,255,255,0.3)", boxShadow: isActive ? `0 0 0 3px ${theme.color}33` : "none" }} />
              <span className="text-[12px] font-display tracking-tight transition-opacity" style={{ opacity: isActive ? 1 : 0.45 }}>Actief</span>
            </button>
            <span className="h-3 w-px bg-white/15" />
            <button onClick={() => onUpdate({ status: "inactive" })} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full transition-all" style={{ background: !isActive ? "rgba(255,255,255,0.85)" : "transparent", border: !isActive ? "none" : "1px solid rgba(255,255,255,0.3)" }} />
              <span className="text-[12px] font-display tracking-tight transition-opacity" style={{ opacity: !isActive ? 1 : 0.45 }}>Pauze</span>
            </button>
          </div>
        </div>

        {/* BEZIGHEID — 8-traps trapmeter, klikbaar */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[8px] uppercase tracking-[0.24em] opacity-45">Bezigheid</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-display font-bold tabular-nums leading-none">{level}</span>
              <span className="text-[10px] uppercase tracking-[0.16em] opacity-45">/ 8</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {Array.from({ length: 8 }).map((_, i) => {
              const filled = i < level;
              const isTop = i + 1 === level;
              return (
                <button
                  key={i}
                  onClick={() => onUpdate({ level: isTop ? i : i + 1 })}
                  className="flex-1 rounded-[3px] transition-all duration-300"
                  style={{ height: `${24 + (i + 1) * 9.5}%`, background: filled ? theme.color : "rgba(255,255,255,0.10)", opacity: filled ? 1 : 0.5, boxShadow: filled ? `0 6px 14px -4px ${theme.color}66` : "none" }}
                  aria-label={`niveau ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* NET BEZIG — tekstactie, geen pill */}
        <button
          onClick={() => onUpdate({ level: 8, status: "active", last_activity_date: new Date().toISOString() })}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-75 hover:opacity-100 transition-opacity w-fit"
        >
          <Zap size={12} style={{ color: theme.color }} />
          <span>Markeer net bezig</span>
          <span className="h-px w-6 bg-white/30" />
        </button>
      </div>
    </div>
  );
}