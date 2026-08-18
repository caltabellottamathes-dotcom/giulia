import React from "react";
import PanelShell from "@/glass/components/self/PanelShell";

function Trajectory({ name, nodes, currentIdx, sessions }) {
  return (
    <div>
      <p className="text-storm/80 text-[10px] uppercase tracking-[0.25em] mb-5 font-semibold">{name}</p>
      <div className="relative flex items-center justify-between px-4">
        <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-marble/20 -translate-y-1/2" />
        {nodes.map((n, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-3 z-10">
              <span className={`w-5 h-5 rounded-full border-2 ${current ? "bg-urgent border-urgent animate-pulse shadow-[0_0_0_7px_rgba(213,226,74,0.18)]" : done ? "bg-plum border-plum" : "bg-marble/10 border-marble/30"}`} />
              <span className={`text-[10px] tracking-wide ${current ? "text-urgent" : done ? "text-storm/70" : "text-storm/40"}`}>{n}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-storm/40 text-[9px] tracking-wider px-4">
        {sessions.map((s, i) => <span key={i}>{s}</span>)}
      </div>
    </div>
  );
}

const UPCOMING = [
  { d: "THU", t: "14:00", tr: "A" },
  { d: "MON", t: "10:00", tr: "A" },
  { d: "WED", t: "15:30", tr: "B" },
];

export default function TherapyPanel() {
  return (
    <PanelShell
      index="04"
      section="THERAPY · 02 ACTIVE TRAJECTORIES"
      statement="IN PROGRESS"
      context={[
        { label: "CURRENT", text: "Trajectory A — wekelijkse sessies lopen." },
        { label: "RECENT", text: "Laatste sessie verschoof focus naar slaapritme." },
        { label: "NEXT", text: "Donderdag 14:00, gekoppeld aan Trajectory A." },
      ]}
      actions={[
        { label: "Add Note" },
        { label: "Add Appointment", primary: true },
        { label: "Update Progress" },
        { label: "Open Therapy" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <Trajectory name="TRAJECTORY A" nodes={["START", "MID", "NOW", "NEXT"]} currentIdx={2} sessions={["WK1", "WK4", "WK7", "WK8"]} />
        <Trajectory name="TRAJECTORY B" nodes={["START", "NOW", "NEXT"]} currentIdx={1} sessions={["WK1", "WK3", "WK4"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border-l-4 border-urgent bg-urgent/5 px-8 py-8 flex items-center gap-8">
          <div className="text-center">
            <p className="text-urgent text-6xl font-bold leading-none">THU</p>
            <p className="text-storm text-3xl font-semibold tabular-nums mt-2">14:00</p>
          </div>
          <div className="h-20 w-px bg-marble/20" />
          <div>
            <p className="text-urgent text-[10px] uppercase tracking-[0.25em]">Next appointment</p>
            <p className="text-storm text-lg font-medium mt-2">Drs. F. Visser · Trajectory A</p>
            <p className="text-storm/50 text-sm mt-1">Praktijk Centrum West</p>
          </div>
        </div>
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5">
          <p className="text-storm/50 text-[10px] uppercase tracking-[0.25em] mb-4">Upcoming</p>
          <div className="flex flex-col gap-3">
            {UPCOMING.map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-storm text-sm font-medium">{u.d} · {u.t}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.tr === "A" ? "bg-plum text-storm" : "bg-marble/15 text-storm/70"}`}>TRJ {u.tr}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}