import React from "react";
import { Link } from "react-router-dom";
import { Check, Calendar, Milestone as MilestoneIcon, Gavel, FileText, StickyNote } from "lucide-react";
import ProjectCard from "@/focus/components/projects/ProjectCard";
import { isTaskDone, taskStatusMeta, projectStatusMeta } from "@/lib/projectStatus";

const TILE_SHADOW = "-16px 16px 40px -16px rgba(0,0,0,0.30)";
const Tile = ({ children, className = "" }) =>
  <div className={`overflow-hidden rounded-[18px] graph-paper ${className}`} style={{ boxShadow: TILE_SHADOW }}>{children}</div>;

/** ProjectStacks — per-tab bento voor de Projects-studio. Spiegelt de
 *  FinanceStacks-stijl: zwevende graph-paper tegels met schaduw naar links. */
export default function ProjectStacks({ tab, data, onOpenProject, onEditProject, onToggleTask, onReload }) {
  const { projects, tasks, milestones, decisions, documents, notes } = data;
  const today = new Date();

  const tasksByProject = tasks.reduce((map, t) => { (map[t.project_id] = map[t.project_id] || []).push(t); return map; }, {});
  const pName = (id) => projects.find((p) => p.id === id)?.title || "—";

  if (tab === "OVERVIEW") {
    const active = projects.filter((p) => ["in_progress", "planning", "review", "waiting", "afwerking"].includes(p.status));
    const attention = projects.filter((p) => p.health === "attention" || p.health === "critical");
    const upcoming = tasks.filter((t) => !isTaskDone(t) && t.deadline && new Date(t.deadline) >= today).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 6);
    const pName = (id) => projects.find((p) => p.id === id)?.title || "—";
    return (
      <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] flex flex-col gap-4 overflow-y-auto no-scrollbar">
        <div className="flex gap-4">
          <Tile className="flex-1 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Portefeuille · {projects.length} projecten</p>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="ACTIEF" value={active.length} color="hsl(var(--life-olive))" />
              <Stat label="AANDACHT" value={attention.length} color="hsl(var(--life-urgent))" />
              <Stat label="OPEN TAKEN" value={tasks.filter((t) => !isTaskDone(t)).length} color="hsl(var(--life-ridge))" />
            </div>
          </Tile>
          <Tile className="flex-1 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Komende deadlines · {upcoming.length}</p>
            {upcoming.length === 0 ? <p className="text-sm text-muted-foreground italic">Rustig — niets binnenkort.</p> :
              <div className="space-y-1.5">
                {upcoming.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-foreground/[0.04] px-2.5 py-1.5">
                    <span className="text-[11px] truncate min-w-0">{t.title}</span>
                    <span className="text-[9px] uppercase tracking-wide text-muted-foreground shrink-0">{pName(t.project_id)} · {new Date(t.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                  </div>
                ))}
              </div>}
          </Tile>
        </div>
        <ProjectGrid projects={projects} onOpen={onOpenProject} onEdit={onEditProject} />
      </div>
    );
  }

  if (tab === "ACTIVE") {
    const active = projects.filter((p) => ["in_progress", "planning", "review", "waiting", "afwerking"].includes(p.status));
    return (
      <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] overflow-y-auto no-scrollbar">
        <ProjectGrid projects={active} onOpen={onOpenProject} onEdit={onEditProject} emptyLabel="Geen actieve projecten." />
      </div>
    );
  }

  if (tab === "TASKS") {
    const byProject = Object.entries(tasksByProject)
      .map(([pid, ts]) => ({ project: projects.find((p) => p.id === pid), tasks: ts.sort((a, b) => (isTaskDone(a) ? 1 : 0) - (isTaskDone(b) ? 1 : 0)) }))
      .filter((g) => g.project);
    return (
      <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] overflow-y-auto no-scrollbar space-y-5">
        {byProject.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen taken.</p>}
        {byProject.map((g) => (
          <div key={g.project.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.project.color || "hsl(var(--smoke))" }} />
              <h3 className="text-sm font-display font-semibold">{g.project.title}</h3>
              <span className="text-[10px] text-muted-foreground tabular-nums">{g.tasks.filter((t) => !isTaskDone(t)).length}/{g.tasks.length}</span>
            </div>
            <div className="space-y-1.5">
              {g.tasks.map((t) => {
                const done = isTaskDone(t);
                const sm = taskStatusMeta[t.status] || taskStatusMeta.todo;
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-foreground/[0.04] px-3 py-2">
                    <button onClick={() => onToggleTask(t)} className={`h-4 w-4 rounded-md border-2 shrink-0 flex items-center justify-center ${done ? "bg-olive border-olive" : "border-border/80 hover:border-olive"}`}>
                      {done && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <p className={`text-[12px] flex-1 min-w-0 truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                    {t.deadline && <span className="text-[9px] text-muted-foreground shrink-0 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(t.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
                    <span className={`text-[9px] uppercase tracking-wide shrink-0 ${sm.color}`}>{sm.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "MILESTONES") {
    const ms = (milestones || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const pName = (id) => projects.find((p) => p.id === id)?.title || "—";
    return (
      <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] overflow-y-auto no-scrollbar space-y-2.5">
        {ms.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen milestones.</p>}
        {ms.map((m) => {
          const done = m.status === "done";
          const p = projects.find((pp) => pp.id === m.project_id);
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-xl bg-foreground/[0.04] px-3 py-3">
              <span className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: (p?.color) || "hsl(var(--smoke))" }}>
                <MilestoneIcon className="h-4 w-4 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-display font-semibold truncate ${done ? "line-through text-muted-foreground" : ""}`}>{m.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{pName(m.project_id)}{m.date ? ` · ${m.date}` : ""}</p>
              </div>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground shrink-0">{m.status || "open"}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === "DECISIONS") {
    const dec = (decisions || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const pName = (id) => projects.find((p) => p.id === id)?.title || "—";
    return (
      <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] overflow-y-auto no-scrollbar space-y-2.5">
        {dec.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen beslissingen.</p>}
        {dec.map((d) => {
          const p = projects.find((pp) => pp.id === d.project_id);
          return (
            <div key={d.id} className="flex items-start gap-3 rounded-xl bg-foreground/[0.04] px-3 py-3">
              <span className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: (p?.color) || "hsl(var(--smoke))" }}>
                <Gavel className="h-4 w-4 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-display font-semibold">{d.title}</p>
                {d.description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{d.description}</p>}
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">{pName(d.project_id)}{d.date ? ` · ${d.date}` : ""}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === "INSIGHTS") {
    const sorted = projects.slice().sort((a, b) => (b.progress || 0) - (a.progress || 0));
    return (
      <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] overflow-y-auto no-scrollbar space-y-4">
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Voortgang per project</p>
          <div className="space-y-3">
            {sorted.map((p) => (
              <div key={p.id}>
                <div className="flex items-end justify-between mb-1">
                  <span className="text-[12px] font-display font-semibold truncate">{p.title}</span>
                  <span className="text-[12px] font-display font-bold tabular-nums shrink-0" style={{ color: p.color || "hsl(var(--smoke))" }}>{Math.round(p.progress || 0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(p.progress || 0, 1)}%`, background: p.color || "hsl(var(--smoke))" }} />
                </div>
              </div>
            ))}
            {sorted.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen projecten.</p>}
          </div>
        </Tile>
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Gezondheid</p>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => {
              const ps = projectStatusMeta[p.status] || projectStatusMeta.planning;
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-2 rounded-full bg-foreground/[0.04] pl-2 pr-3 py-1.5 hover:bg-foreground/[0.08] transition">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color || "hsl(var(--smoke))" }} />
                  <span className="text-xs font-medium">{p.title}</span>
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{p.health || "good"}</span>
                </Link>
              );
            })}
          </div>
        </Tile>
      </div>
    );
  }

  if (tab === "FILES") {
    const projDocs = documents.filter((d) => d.project_id);
    const projNotes = notes.filter((n) => n.project_id);
    const pName = (id) => projects.find((p) => p.id === id)?.title || "—";
    return (
      <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-[68px] grid gap-4 lg:grid-cols-2 overflow-y-auto no-scrollbar">
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Documenten · {projDocs.length}</p>
          {projDocs.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen documenten gekoppeld.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {projDocs.slice(0, 10).map((d) => (
              <div key={d.id} className="rounded-xl bg-foreground/[0.04] px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1"><FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><p className="text-[12px] font-display font-semibold truncate">{d.name || d.title}</p></div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{pName(d.project_id)} · {d.document_type || d.type}</p>
              </div>
            ))}
          </div>
        </Tile>
        <Tile className="p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Notities · {projNotes.length}</p>
          {projNotes.length === 0 && <p className="text-sm text-muted-foreground italic">Nog geen notities gekoppeld.</p>}
          <div className="space-y-2">
            {projNotes.slice(0, 10).map((n) => (
              <div key={n.id} className="rounded-xl bg-foreground/[0.04] px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1"><StickyNote className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><p className="text-[12px] font-display font-semibold truncate">{n.title}</p></div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{n.content}</p>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground mt-1">{pName(n.project_id)}</p>
              </div>
            ))}
          </div>
        </Tile>
      </div>
    );
  }

  return null;
}

function ProjectGrid({ projects, onOpen, onEdit, emptyLabel }) {
  return (
    <div>
      {projects.length === 0 ? <p className="text-sm text-muted-foreground italic py-4">{emptyLabel || "Nog geen projecten."}</p> :
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <div key={project.id} className="relative">
              <ProjectCard project={project} index={i} onOpen={onOpen} onEdit={onEdit} />
            </div>
          ))}
        </div>}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
      <p className="font-display font-semibold tabular-nums leading-none mt-1 text-2xl" style={{ color }}>{value}</p>
    </div>
  );
}