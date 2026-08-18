import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flag } from "lucide-react";
import { PageShell, GlassButton, Divider } from "@/glass/components/glass";
import { PROJECTS } from "@/glass/lib/projects";

const COLUMNS = [
  { key: "lopend", label: "Lopend", accent: "text-sky", dot: "bg-sky" },
  { key: "gepland", label: "Gepland", accent: "text-marble", dot: "bg-marble" },
  { key: "voltooid", label: "Voltooid", accent: "text-urgent", dot: "bg-urgent" },
];

const REF = new Date("2026-08-13");
const daysLeft = (deadline) => Math.ceil((new Date(deadline) - REF) / 86400000);

export default function Projecten() {
  const counts = useMemo(() => ({
    lopend: PROJECTS.filter((p) => p.status === "lopend").length,
    gepland: PROJECTS.filter((p) => p.status === "gepland").length,
    voltooid: PROJECTS.filter((p) => p.status === "voltooid").length,
  }), []);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Werk</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Lopende Projecten</h1>
        </div>
        <Link to="/"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {COLUMNS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-marble/20 bg-marble/5 p-4 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
            <div>
              <p className={`text-xs ${c.accent}`}>{c.label}</p>
              <p className="text-storm text-2xl font-semibold leading-none mt-1">{counts[c.key]}</p>
            </div>
          </div>
        ))}
      </div>

      <Divider className="mb-5" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = PROJECTS.filter((p) => p.status === col.key);
          return (
            <div key={col.key} className="rounded-2xl border border-marble/15 bg-marble/5 p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className={`text-xs font-semibold ${col.accent}`}>{col.label}</span>
                <span className="text-marble/50 text-[10px] tabular-nums">{items.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {items.map((p) => {
                  const dl = daysLeft(p.deadline);
                  const risk = dl <= 7 && p.status !== "voltooid";
                  return (
                    <div key={p.id} className="rounded-xl border border-marble/20 bg-marble/10 p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-storm text-sm font-medium truncate">{p.name}</p>
                          <p className="text-marble/50 text-xs truncate">{p.client}</p>
                        </div>
                        {risk && <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-urgent/20 text-urgent border border-urgent/40">⚠ {dl}d</span>}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-marble/60">Voortgang</span>
                          <span className="text-storm tabular-nums">{p.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-marble/10 overflow-hidden">
                          <div className="h-full rounded-full bg-urgent" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex -space-x-1.5">
                          {p.team.map((t, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-metal border border-marble/30 flex items-center justify-center text-[9px] text-marble">{t}</div>
                          ))}
                        </div>
                        <div className="text-right">
                          <p className="text-marble/50 text-[9px]">Deadline</p>
                          <p className="text-storm text-[10px] tabular-nums">{p.deadline}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-marble/15 flex items-center gap-1.5">
                        <Flag className="w-3 h-3 text-marble/60" />
                        <span className="text-marble/70 text-[10px] truncate">{p.nextMilestone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}