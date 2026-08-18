import React from "react";
import PanelShell from "@/glass/components/self/PanelShell";

const NODES = [
  { label: "LEARNING", pos: "top", status: "MOVING", progress: 68, sub: "Typografie · 3/5" },
  { label: "CREATIVE", pos: "left", status: "ACTIVE", progress: 40, sub: "Concept Brons" },
  { label: "PERSONAL", pos: "right", status: "STALLED", progress: 15, sub: "Ritmes · stil" },
  { label: "PRACTICE", pos: "bottom", status: "MOVING", progress: 72, sub: "Dagelijks schrijven" },
];
const tone = { MOVING: "text-plum", ACTIVE: "text-olive", STALLED: "text-storm/50" };
const bar = { MOVING: "bg-plum", ACTIVE: "bg-olive", STALLED: "bg-marble/30" };

function Node({ n }) {
  const cls = {
    top: "top-0 left-1/2 -translate-x-1/2",
    bottom: "bottom-0 left-1/2 -translate-x-1/2",
    left: "left-0 top-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 -translate-y-1/2",
  }[n.pos];
  return (
    <div className={`absolute ${cls} w-44`}>
      <div className="rounded-2xl border border-marble/25 bg-marble/5 px-4 py-3">
        <p className="text-storm text-base font-semibold">{n.label}</p>
        <p className={`text-[10px] tracking-[0.2em] mt-0.5 ${tone[n.status]}`}>{n.status}</p>
        <div className="mt-2.5 h-1.5 rounded-full bg-marble/10 overflow-hidden">
          <div className={`h-full rounded-full ${bar[n.status]}`} style={{ width: `${n.progress}%` }} />
        </div>
        <p className="text-storm/50 text-[10px] mt-2">{n.sub}</p>
      </div>
    </div>
  );
}

export default function DevelopmentPanel() {
  return (
    <PanelShell
      index="06"
      section="DEVELOPMENT · 04 ACTIVE AREAS"
      statement="04 ACTIVE AREAS"
      context={[
        { label: "MOVING", text: "Learning en Practice tonen zichtbare voortgang." },
        { label: "STALLED", text: "Personal al enkele weken zonder beweging." },
        { label: "NEXT", text: "Volgende stap: afronding leerblok typografie." },
      ]}
      actions={[
        { label: "Add Goal", primary: true },
        { label: "Record Progress" },
        { label: "Add Learning" },
        { label: "Open Development" },
      ]}
    >
      <div className="relative w-full max-w-2xl mx-auto h-[420px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 420" preserveAspectRatio="none">
          <line x1="240" y1="60" x2="240" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="240" y1="210" x2="240" y2="360" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="60" y1="210" x2="240" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="240" y1="210" x2="420" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="240" cy="210" r="44" fill="none" stroke="rgba(48,23,40,0.4)" strokeWidth="1" />
          <circle cx="240" cy="210" r="60" fill="none" stroke="rgba(48,23,40,0.2)" strokeWidth="1" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <span className="block w-7 h-7 rounded-full bg-urgent shadow-[0_0_0_12px_rgba(213,226,74,0.15)]" />
          <span className="text-storm/40 text-[9px] tracking-[0.2em] mt-3">NOW</span>
        </div>
        {NODES.map((n) => <Node key={n.label} n={n} />)}
      </div>

      <div className="flex justify-center gap-6 mt-2">
        {Object.entries(tone).map(([k]) => (
          <span key={k} className="flex items-center gap-2 text-[10px] tracking-wider uppercase">
            <span className={`w-2.5 h-2.5 rounded-full ${bar[k]}`} />
            <span className={tone[k]}>{k}</span>
          </span>
        ))}
      </div>
    </PanelShell>
  );
}