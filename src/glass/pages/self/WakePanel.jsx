import React from "react";
import PanelShell from "@/glass/components/self/PanelShell";

const PLUM = "#301728", URG = "#d5e24a";

const PHASES = [
  { label: "WAKE", state: "DONE" },
  { label: "ORIENT", state: "NOW" },
  { label: "ROUTINE", state: "NEXT" },
  { label: "GET UP", state: "—" },
];

const METRICS = [
  { l: "SLEEP", v: "7h 12m" },
  { l: "LIGHT", v: "12 min" },
  { l: "STILLNESS", v: "8 min" },
  { l: "HYDRATION", v: "2 glazen" },
];

export default function WakePanel() {
  const r = 96, c = 2 * Math.PI * r, pct = 42;
  return (
    <PanelShell
      index="03"
      section="GOOD MORNING"
      statement="ORIENT"
      context={[
        { label: "DAILY INTENTION", text: "Begin langzaam, bescherm de eerste focus-blok." },
        { label: "FIRST COMMITMENT", text: "Marktanalyse rapport — eerste concept vandaag." },
        { label: "CURRENT STATE", text: "Orient fase loopt, 42% voltooid." },
      ]}
      actions={[
        { label: "Continue", primary: true },
        { label: "Skip Phase" },
        { label: "Extend" },
        { label: "End Wake Mode" },
        { label: "Open Wake" },
      ]}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-72 h-72">
          <div className="absolute inset-8 rounded-full" style={{ background: "rgba(48,23,40,0.25)", filter: "blur(28px)" }} />
          <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle cx="100" cy="100" r={r} fill="none" stroke={PLUM} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
            {[...Array(40)].map((_, i) => {
              const a = (i / 40) * 2 * Math.PI;
              return <line key={i} x1={100 + Math.cos(a) * 108} y1={100 + Math.sin(a) * 108} x2={100 + Math.cos(a) * 114} y2={100 + Math.sin(a) * 114} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-storm text-6xl font-bold tabular-nums leading-none">{pct}<span className="text-3xl">%</span></span>
            <span className="text-urgent text-[11px] tracking-[0.3em] mt-3">ORIENT</span>
          </div>
        </div>

        <div className="mt-10 w-full max-w-xl">
          <div className="relative">
            <div className="absolute top-4 left-6 right-6 h-1 rounded-full bg-marble/15" />
            <div className="absolute top-4 left-6 h-1 rounded-full bg-plum" style={{ width: "33%" }} />
            <div className="flex justify-between relative">
              {PHASES.map((p) => {
                const done = p.state === "DONE";
                const current = p.state === "NOW";
                return (
                  <div key={p.label} className="flex flex-col items-center gap-3 z-10">
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${current ? "bg-urgent border-urgent animate-pulse shadow-[0_0_0_8px_rgba(213,226,74,0.18)]" : done ? "bg-plum border-plum" : "bg-marble/10 border-marble/30"}`} />
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${current ? "text-urgent" : done ? "text-storm" : "text-storm/60"}`}>{p.label}</p>
                      <p className={`text-[9px] tracking-[0.2em] mt-1 ${current ? "text-urgent" : "text-storm/40"}`}>{p.state}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
          {METRICS.map((m) => (
            <div key={m.l} className="rounded-2xl border border-marble/20 bg-marble/5 p-4 text-center">
              <p className="text-storm text-xl font-semibold tabular-nums">{m.v}</p>
              <p className="text-storm/50 text-[9px] tracking-[0.2em] mt-1.5">{m.l}</p>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}