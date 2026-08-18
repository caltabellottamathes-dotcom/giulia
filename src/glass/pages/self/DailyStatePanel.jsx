import React from "react";
import PanelShell from "@/glass/components/self/PanelShell";

const PLUM = "#301728", URG = "#d5e24a", OLIVE = "#d8dab3", STORM = "#F2F2F0";

const VALUES = [
  { v: 72, l: "ENERGY", c: PLUM, pts: "0,30 20,22 40,28 60,18 80,24 100,16" },
  { v: 58, l: "CAPACITY", c: URG, pts: "0,40 20,38 40,44 60,34 80,40 100,30" },
  { v: 64, l: "MOOD", c: OLIVE, pts: "0,34 20,30 40,36 60,28 80,32 100,26" },
];

const ARCS = [
  { pct: 72, r: 100, c: PLUM, label: "ENERGY" },
  { pct: 58, r: 78, c: URG, label: "CAPACITY" },
  { pct: 64, r: 56, c: OLIVE, label: "MOOD" },
];
const circ = (r) => 2 * Math.PI * r;

export default function DailyStatePanel() {
  return (
    <PanelShell
      index="01"
      section="DAILY STATE"
      statement="STEADY"
      context={[
        { label: "WHAT CHANGED", text: "Capacity has decreased since this morning." },
        { label: "WHAT MATTERS NOW", text: "Your afternoon is relatively full while available capacity is lower." },
        { label: "NOW", text: "Steady state — no sharp shifts across the three signals." },
      ]}
      actions={[
        { label: "Check In", primary: true },
        { label: "Adjust Day" },
        { label: "Add Personal Time" },
        { label: "Open Daily State" },
      ]}
    >
      <div className="grid grid-cols-3 divide-x divide-marble/20 border-y border-marble/20">
        {VALUES.map((x) => (
          <div key={x.l} className="py-8 px-6">
            <p className="text-storm text-6xl font-bold tabular-nums leading-none">{x.v}</p>
            <p className="text-[10px] tracking-[0.3em] mt-3" style={{ color: x.c }}>{x.l}</p>
            <svg viewBox="0 0 100 50" className="w-full h-10 mt-4" preserveAspectRatio="none">
              <polyline points={x.pts} fill="none" stroke={x.c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col lg:flex-row gap-10 items-center">
        <div className="relative w-64 h-64 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {ARCS.map((a) => (
              <g key={a.label}>
                <circle cx="120" cy="120" r={a.r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="120" cy="120" r={a.r} fill="none" stroke={a.c} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ(a.r)} strokeDashoffset={circ(a.r) - (a.pct / 100) * circ(a.r)} />
              </g>
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-storm text-3xl font-bold">STEADY</span>
            <span className="text-storm/50 text-[10px] tracking-[0.25em] mt-1">STATE FIELD</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <p className="text-storm/50 text-[10px] uppercase tracking-[0.25em] mb-4">Change · morning → now</p>
          <svg viewBox="0 0 400 170" className="w-full h-44" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={i * 40 + 10} x2="400" y2={i * 40 + 10} stroke="rgba(255,255,255,0.05)" />)}
            <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="2" y="115" fill="rgba(255,255,255,0.45)" fontSize="9">MORNING</text>
            <defs>
              <linearGradient id="dsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PLUM} stopOpacity="0.5" />
                <stop offset="100%" stopColor={PLUM} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,120 C60,100 90,40 150,55 C200,67 230,23 290,40 C340,53 370,25 400,33 L400,170 L0,170 Z" fill="url(#dsArea)" />
            <path d="M0,120 C60,100 90,40 150,55 C200,67 230,23 290,40 C340,53 370,25 400,33" fill="none" stroke={PLUM} strokeWidth="2.5" />
            <circle cx="0" cy="120" r="5" fill={STORM} />
            <circle cx="400" cy="33" r="7" fill={URG} />
            <circle cx="400" cy="33" r="14" fill="none" stroke={URG} strokeWidth="1.5" opacity="0.5" />
          </svg>
          <div className="flex justify-between text-storm/40 text-[10px] tracking-[0.25em] mt-2">
            <span>06:00</span><span>10:00</span><span>14:00</span><span className="text-urgent">NOW</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-6">
        {ARCS.map((a) => (
          <div key={a.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: a.c }} />
            <span className="text-storm/70 text-xs tracking-wide">{a.label} · {a.pct}</span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}