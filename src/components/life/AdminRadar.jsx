import React from "react";
import { accentFor } from "@/lib/adminUtils";

/** AdminRadar — cirkelvormige administratieve radar. Ringen NOW / DEZE WEEK /
 *  DEZE MAAND / LATER. Gebeurtenissen bewegen naar het midden naarmate de
 *  deadline nadert; kleur life-blue → life-sand (dichtbij) → urgent (overdue). */
export default function AdminRadar({ events = [], size = 200, tone = "dark", labels = false, pills = false, onSelect }) {
  const R = size / 2;
  const dark = tone === "dark";
  const ringCol = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const labelCol = dark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.40)";
  const rings = [
    { r: 0.18, label: "NOW" },
    { r: 0.42, label: "DEZE WEEK" },
    { r: 0.68, label: "DEZE MAAND" },
    { r: 0.94, label: "LATER" },
  ];
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {rings.map((rg, i) => (
        <div key={i} className="absolute rounded-full" style={{ width: rg.r * size, height: rg.r * size, left: R - (rg.r * size) / 2, top: R - (rg.r * size) / 2, border: `1px ${i === rings.length - 1 ? "dashed" : "solid"} ${ringCol}` }} />
      ))}
      <div className="absolute rounded-full" style={{ left: R - 4, top: R - 4, width: 8, height: 8, background: "hsl(var(--life-blue-deep))", boxShadow: "0 0 12px hsl(var(--life-blue))" }} />
      {labels && rings.map((rg, i) => (
        <span key={i} className="absolute text-[8px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap" style={{ left: R + 6, top: R - (rg.r * size) / 2 - 12, color: labelCol }}>{rg.label}</span>
      ))}
      {events.map((e, i) => {
        const rad = e.norm * (R - 14);
        const x = R + Math.cos(e.angle) * rad;
        const y = R + Math.sin(e.angle) * rad;
        const c = accentFor(e.status);
        return (
          <button key={e.id || i} onClick={() => onSelect && onSelect(e)} className="absolute flex items-center gap-1.5" style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}>
            <span className={`rounded-full ${e.status === "urgent" ? "animate-pulse-soft" : ""}`} style={{ width: pills ? 10 : 8, height: pills ? 10 : 8, background: c, boxShadow: e.status === "urgent" ? `0 0 12px ${c}` : "none" }} />
            {pills && (
              <span className="whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: dark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.72)" }}>
                {e.title}{e.amount ? ` · €${e.amount}` : ""}{e.due_date ? ` · ${new Date(e.due_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}