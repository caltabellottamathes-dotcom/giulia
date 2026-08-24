import React from "react";
import { X, Check, Zap } from "lucide-react";

/** HobbyEditPanel — rechterglas na selectie van een hobby-bar.
 *  De titel/thema/niveau staan al op de fotokaart, dus hier alleen de
 *  bediening: Status (Actief/Pauze), Bezigheid (8-traps trapmeter, klikbaar)
 *  en "Markeer net bezig". */
export default function HobbyEditPanel({ hobby, theme, level, onUpdate, onClose }) {
  if (!hobby) return null;
  const isActive = hobby.status !== "inactive";
  const activeStyle = { background: theme.color, color: "#1c1c1c" };
  const idleStyle = { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.14)" };

  return (
    <div className="relative h-full flex flex-col p-4 text-white">
      <button
        onClick={onClose}
        className="absolute top-2.5 left-2.5 h-7 w-7 rounded-full flex items-center justify-center bg-white/10 border border-white/15 hover:bg-white/20 transition-colors z-10"
        aria-label="Sluiten"
      >
        <X size={13} />
      </button>

      {/* STATUS — grote segment-toggle */}
      <div className="mt-1">
        <p className="text-[8px] uppercase tracking-[0.22em] opacity-50 mb-2">Status</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => onUpdate({ status: "active" })} className="rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all" style={isActive ? activeStyle : idleStyle}>
            <Check size={12} /> Actief
          </button>
          <button onClick={() => onUpdate({ status: "inactive" })} className="rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all" style={!isActive ? { background: "rgba(255,255,255,0.88)", color: "#1c1c1c" } : idleStyle}>
            Pauze
          </button>
        </div>
      </div>

      {/* BEZIGHEID — 8-traps trapmeter, klikbaar */}
      <div className="mt-4">
        <div className="flex items-end justify-between mb-2">
          <p className="text-[8px] uppercase tracking-[0.22em] opacity-50">Bezigheid</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-display font-bold tabular-nums leading-none">{level}</span>
            <span className="text-[9px] uppercase tracking-[0.16em] opacity-50">/ 8</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-14">
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = i < level;
            const isTop = i + 1 === level;
            return (
              <button
                key={i}
                onClick={() => onUpdate({ level: isTop ? i : i + 1 })}
                className="flex-1 rounded-md transition-all"
                style={{ height: `${28 + (i + 1) * 9}%`, background: filled ? theme.color : "rgba(255,255,255,0.10)", opacity: filled ? 1 : 0.55, boxShadow: filled ? `0 4px 10px -3px ${theme.color}88` : "none" }}
                aria-label={`niveau ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* NET BEZIG */}
      <button
        onClick={() => onUpdate({ level: 8, status: "active", last_activity_date: new Date().toISOString() })}
        className="mt-auto rounded-xl px-3 py-3 text-[11px] font-semibold flex items-center justify-center gap-1.5 bg-white/15 border border-white/20 hover:bg-white/25 transition-colors"
      >
        <Zap size={13} /> Markeer net bezig
      </button>
    </div>
  );
}