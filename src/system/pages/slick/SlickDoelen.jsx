import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { PageShell, GlassButton, Divider, SectionHeader } from "@/system/components/slick/glass";
import { GOALS } from "@/lib/slick/goals";

const FILTERS = ["alle", "Professioneel", "Persoonlijk"];
const TONE = { Professioneel: "bg-urgent", Persoonlijk: "bg-sky" };

export default function DoelenDashboard() {
  const [filter, setFilter] = useState("alle");
  const goals = filter === "alle" ? GOALS : GOALS.filter((g) => g.category === filter);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Groei</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Doelen Dashboard</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <GlassButton key={f} active={filter === f} onClick={() => setFilter(f)} className="px-4 py-1.5 text-storm text-xs capitalize">{f}</GlassButton>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => (
          <div key={g.id} className="rounded-2xl border border-marble/20 bg-marble/5 p-5 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl border border-marble/30 bg-marble/10 flex items-center justify-center">
                <Target className={`w-4 h-4 ${g.category === "Persoonlijk" ? "text-sky" : "text-urgent"}`} />
              </div>
              <span className="text-marble/50 text-[10px] uppercase">{g.category}</span>
            </div>
            <h3 className="text-storm text-sm font-medium mt-3">{g.title}</h3>
            <p className="text-marble/50 text-xs mt-0.5">Doel: {g.target}</p>

            <div className="mt-4">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-marble/60">Voortgang</span>
                <span className="text-storm tabular-nums">{g.progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-marble/10 overflow-hidden">
                <div className={`h-full rounded-full ${TONE[g.category]}`} style={{ width: `${g.progress}%` }} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-marble/15 flex flex-wrap gap-1.5">
              {g.milestones.map((m) => (
                <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-marble/10 text-marble/70 border border-marble/20">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}