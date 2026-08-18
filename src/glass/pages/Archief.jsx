import React from "react";
import { Link } from "react-router-dom";
import { Archive, CheckCircle2 } from "lucide-react";
import { PageShell, GlassButton, Divider, SectionHeader, CATEGORY_COLORS } from "@/glass/components/glass";
import { TASKS } from "@/glass/lib/tasks";
import { PROJECTS } from "@/glass/lib/projects";

export default function Archief() {
  const doneTasks = TASKS.filter((t) => t.status === "voltooid");
  const doneProjects = PROJECTS.filter((p) => p.status === "voltooid");

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Geschiedenis</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Archief</h1>
        </div>
        <Link to="/"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6 mb-6">
        <SectionHeader number={1} title={`Voltooide taken (${doneTasks.length})`} />
        <div className="mt-4 flex flex-col gap-2">
          {doneTasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl bg-marble/8 px-4 py-3 opacity-80">
              <CheckCircle2 className="w-4 h-4 text-urgent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-storm text-sm line-through truncate">{t.title}</p>
                <p className={`${CATEGORY_COLORS[t.category]} text-xs`}>{t.category}</p>
              </div>
              <span className="text-marble/40 text-xs tabular-nums">{t.date}</span>
            </div>
          ))}
        </div>
      </div>

      <Divider className="mb-6" />

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
        <SectionHeader number={2} title={`Afgesloten projecten (${doneProjects.length})`} />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {doneProjects.map((p) => (
            <div key={p.id} className="rounded-xl border border-marble/15 bg-marble/8 p-4 opacity-80">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-marble/50" />
                <p className="text-storm text-sm font-medium">{p.name}</p>
              </div>
              <p className="text-marble/50 text-xs mt-1">{p.client} · afgerond {p.deadline}</p>
              <div className="mt-3 h-1.5 rounded-full bg-marble/10 overflow-hidden">
                <div className="h-full rounded-full bg-urgent/60" style={{ width: "100%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}