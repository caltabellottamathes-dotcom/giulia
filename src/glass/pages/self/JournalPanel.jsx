import React from "react";
import PanelShell from "@/glass/components/self/PanelShell";

const URG = "#d5e24a", PLUM = "#301728";

const MOMENTS = [
  { time: "07:20", label: "Wake", weight: "xs", tag: "RITUAL" },
  { time: "08:45", label: "Quiet coffee", weight: "sm", tag: "REST" },
  { time: "09:10", label: "Deep work", weight: "md", tag: "FOCUS" },
  { time: "11:30", label: "Meeting", weight: "sm", tag: "WORK" },
  { time: "14:20", label: "Check-in", weight: "sm", tag: "SELF" },
  { time: "16:40", label: "Meaningful moment", weight: "lg", tag: "PEAK", open: true },
  { time: "19:15", label: "Walk", weight: "xs", tag: "MOVEMENT" },
];

const size = {
  xs: "text-base text-storm/70",
  sm: "text-xl text-storm",
  md: "text-2xl text-storm font-semibold",
  lg: "text-4xl sm:text-5xl text-storm font-bold tracking-tight",
};
const dot = { xs: "w-2.5 h-2.5", sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };
const barH = { xs: 12, sm: 24, md: 40, lg: 64 };

const EMERGING = ["slaapritme", "focus-blok", "water", "grenzen"];

export default function JournalPanel() {
  return (
    <PanelShell
      index="05"
      section="TODAY · 07 MOMENTS"
      statement="MEANINGFUL MOMENT"
      context={[
        { label: "TODAY'S HIGHLIGHT", text: "Een rustig gesprek dat richting gaf aan de middag." },
        { label: "EMERGING", text: "Slaapritme kwam vandaag meerdere keren terug." },
        { label: "OPEN", text: "Eén draad nog niet afgerond — terugkomend punt." },
      ]}
      actions={[
        { label: "Add Moment", primary: true },
        { label: "Edit Journal" },
        { label: "Reflect" },
        { label: "Open Journal" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10">
        <div className="relative">
          <div className="absolute left-[100px] top-6 bottom-6 w-px bg-marble/20" />
          {MOMENTS.map((m, i) => (
            <div key={i} className="flex items-start gap-6 py-4 relative">
              <span className="w-20 text-storm text-base font-semibold tabular-nums text-right pt-1.5">{m.time}</span>
              <span className={`z-10 mt-2 rounded-full ${dot[m.weight]} ${m.open ? "bg-urgent animate-pulse shadow-[0_0_0_6px_rgba(213,226,74,0.18)]" : "bg-plum"}`} />
              <div className="flex-1">
                <p className={size[m.weight]}>{m.label}</p>
                {m.open && <div className="mt-3 h-px bg-urgent/40 w-44" />}
                {!m.open && <p className="text-storm/40 text-[10px] tracking-[0.2em] mt-1">{m.tag}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:border-l border-marble/20 lg:pl-8">
          <p className="text-storm/80 text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold">Emerging</p>
          <div className="flex flex-wrap gap-2">
            {EMERGING.map((e, i) => (
              <span key={e} className={`text-sm px-3 py-1.5 rounded-full border ${i === 0 ? "bg-urgent/15 text-urgent border-urgent/40" : "bg-olive/15 text-olive border-olive/25"}`}>{e}</span>
            ))}
          </div>
          <div className="mt-8">
            <p className="text-storm/50 text-[10px] uppercase tracking-[0.25em] mb-4">Magnitude</p>
            <div className="flex items-end gap-1.5 h-20">
              {MOMENTS.map((m, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: barH[m.weight], background: m.weight === "lg" ? URG : PLUM }} />
              ))}
            </div>
            <p className="text-storm/40 text-[9px] tracking-wider mt-2 text-center">over de dag</p>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}