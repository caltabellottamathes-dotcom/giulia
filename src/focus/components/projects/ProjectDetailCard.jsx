import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { isTaskDone } from "@/lib/projectStatus";
import OverviewSection from "@/focus/components/projects/sections/OverviewSection";
import TasksSection from "@/focus/components/projects/sections/TasksSection";
import MilestonesSection from "@/focus/components/projects/sections/MilestonesSection";
import DecisionsSection from "@/focus/components/projects/sections/DecisionsSection";
import FilesSection from "@/focus/components/projects/sections/FilesSection";
import NotesSection from "@/focus/components/projects/sections/NotesSection";
import GiuliaSection from "@/focus/components/projects/sections/GiuliaSection";
import ProjectHeaderTile from "@/focus/components/projects/ProjectHeaderTile";

const EASE = [0.16, 1, 0.3, 1];
const BLUE = "#b1bfc7";
const GREY = "#CCCCCC";
const BLACK = "#000000";
const INK = "#595c64";
const NUM_COLORS = ["#d0d9dd", "#595c64", "#d8dab3"];

const BounceBalls = ({ color = "#000", count, size = "clamp(7px, 0.55vw, 10px)", ml = "7px" }) => {
  const n = count || 1;
  return (
    <span className="inline-flex items-end gap-[3px] align-baseline" style={{ marginLeft: ml }} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color, width: size, height: size, animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
};

const TAB_COPY = {
  OVERVIEW: { eyebrow: "Focus | Project | current_state_", title1: "Here's where", title2: "this stands", heading1: "What needs", heading2: "your attention" },
  TASKS: { eyebrow: "Focus | Project | Tasks", title1: "What's due,", title2: "what's late.", heading1: "Tasks", heading2: "overdue" },
  MILESTONES: { eyebrow: "Focus | Project | Milestones", title1: "What's next", title2: "on the map.", heading1: "Milestones", heading2: "coming up" },
  DECISIONS: { eyebrow: "Focus | Project | Decisions", title1: "What you", title2: "decided.", heading1: "Decisions", heading2: "to make" },
  FILES: { eyebrow: "Focus | Project | Files", title1: "What's filed,", title2: "what's missing.", heading1: "Documents", heading2: "to chase" },
  NOTES: { eyebrow: "Focus | Project | Notes", title1: "What you", title2: "noted.", heading1: "Notes", heading2: "to keep" },
  GIULIA: { eyebrow: "Focus | Project | Giulia", title1: "Where", title2: "this is heading.", heading1: "Giulia", heading2: "advises" },
};

const pad2 = (n) => String(n).padStart(2, "0");

function buildDynamic(tab, project, tasks, milestones, decisions) {
  if (!project) return { items: [], itemsLabel: "00_", rest: "", proposal: "" };
  const today = new Date();
  const overdue = tasks.filter((t) => !isTaskDone(t) && t.deadline && new Date(t.deadline) < today).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const openCount = tasks.filter((t) => !isTaskDone(t)).length;
  const days = (d) => { const n = Math.round((new Date(d) - today) / 86400000); return n < 0 ? `${-n}d te laat` : n === 0 ? "vandaag" : `${n}d`; };
  let items = [], itemsLabel = "00_", rest = "";
  if (tab === "OVERVIEW" || tab === "TASKS") {
    items = overdue.slice(0, 3).map((t, i) => ({ n: pad2(i + 1), title: `${t.title} • ${days(t.deadline)}`, desc: t.priority ? `Prioriteit ${t.priority}` : "Open taak" }));
    itemsLabel = `${pad2(items.length)}_overdue_tasks_`;
    rest = `${Math.max(0, openCount - items.length)} andere open taken staan gepland en vragen geen directe actie.`;
  } else if (tab === "MILESTONES") {
    const ms = (milestones || []).filter((m) => m.status !== "done" && m.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    items = ms.slice(0, 3).map((m, i) => ({ n: pad2(i + 1), title: `${m.name} • ${new Date(m.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`, desc: m.status || "open" }));
    itemsLabel = `${pad2(items.length)}_milestones_next_`;
    rest = `Verdere milestones staan gepland en vragen geen directe actie.`;
  } else if (tab === "DECISIONS") {
    const dec = (decisions || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    items = dec.slice(0, 3).map((d, i) => ({ n: pad2(i + 1), title: d.title, desc: d.date || "" }));
    itemsLabel = `${pad2(items.length)}_decisions_`;
    rest = `Eerdere beslissingen zijn vastgelegd en vragen geen actie.`;
  } else if (tab === "GIULIA") {
    const critical = project.health === "attention" || project.health === "critical";
    items = critical ? [{ n: "01", title: `${project.title} • ${String(project.health || "").toUpperCase()}`, desc: `Voortgang ${Math.round(project.progress || 0)}%` }] : [];
    itemsLabel = `${pad2(items.length)}_pressure_points_`;
    rest = critical ? `Pak de knelpunten op om weer op schema te komen.` : `Dit project loopt gezond — geen knelpunten.`;
  } else {
    items = [];
    itemsLabel = "00_items_";
    rest = `Niets dringends op dit tabblad.`;
  }
  const proposal = `${openCount} open taken (${overdue.length} te laat)${project.progress ? ` · voortgang ${Math.round(project.progress)}%` : ""}. ${overdue.length ? `Begin bij de ${overdue.length} te late taak/${overdue.length === 1 ? "taak" : "taken"} — die blokkeren vooruitgang.` : `Rustig — niets staat te laat. Pak de eerstvolgende deadline op.`}`;
  return { items, itemsLabel, rest, proposal };
}

/** ProjectDetailCard — witte editorial-kaart voor één project, in de
 *  AdminPage-stijl. Links editorial per tab, rechts de bestaande
 *  project-secties (Overview/Tasks/Milestones/…/Giulia). */
export default function ProjectDetailCard({ id, tab, onNavigate, onEditProject, enterDelay = 0 }) {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [themes, setThemes] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [decisions, setDecisions] = useState([]);

  const load = async () => {
    try {
      const p = await base44.entities.Project.get(id);
      setProject(p);
      const [allTasks, allThemes, allMs, allDec] = await Promise.all([
        base44.entities.Task.list().catch(() => []),
        base44.entities.ProjectTheme.list().catch(() => []),
        base44.entities.Milestone.list().catch(() => []),
        base44.entities.Decision.list().catch(() => []),
      ]);
      setTasks((allTasks || []).filter((t) => t.project_id === id));
      setThemes((allThemes || []).filter((t) => t.project_id === id).sort((a, b) => (a.order || 0) - (b.order || 0)));
      setMilestones((allMs || []).filter((m) => m.project_id === id));
      setDecisions((allDec || []).filter((d) => d.project_id === id));
    } catch { setProject(null); }
  };
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const h = () => load();
    window.addEventListener("giulia:projects-reload", h);
    return () => window.removeEventListener("giulia:projects-reload", h);
  }, []);

  const goTab = (t) => onNavigate?.(t);
  const resolveTab = (it, currentTab) => {
    const s = `${it.title || ""} ${it.desc || ""}`.toLowerCase();
    if (/milestone|next|map/.test(s)) return "MILESTONES";
    if (/beslis|decision/.test(s)) return "DECISIONS";
    if (/file|document|missing|chase/.test(s)) return "FILES";
    if (/note|noted/.test(s)) return "NOTES";
    if (/giulia|pressure|heading/.test(s)) return "GIULIA";
    return currentTab === "OVERVIEW" ? "TASKS" : currentTab;
  };
  const executeItem = (it) => goTab(resolveTab(it, tab));

  const c = TAB_COPY[tab] || TAB_COPY.OVERVIEW;
  const dyn = buildDynamic(tab, project, tasks, milestones, decisions);
  const items = dyn.items;
  const proposal = dyn.proposal;
  const itemsLabel = dyn.itemsLabel;
  const rest = dyn.rest;
  const color = project?.color || NUM_COLORS[1];
  const [eyeA, ...eyeRest] = c.eyebrow.split("|");
  const eyeB = eyeRest.length ? " | " + eyeRest.join("|").trim() : "";
  const firstItemColor = items.length > 0 ? color : NUM_COLORS[0];

  const sectionProps = { project, tasks, themes, reload: load, onNavigate: goTab };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: enterDelay }}
      className="absolute inset-0 rounded-bl-[20px] rounded-r-none graph-paper flex overflow-hidden pt-[200px] shadow-[-40px_8px_64px_-18px_rgba(0,0,0,0.55)]"
    >
      {project && <ProjectHeaderTile project={project} tasks={tasks} onEdit={() => onEditProject?.(project)} />}
      {/* Editorial — left ~38% */}
      <div className="relative z-0 w-[38%] h-full flex flex-col overflow-y-auto no-scrollbar border-r" style={{ borderColor: GREY }}>
        <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">{eyeA.trim()}</span>{eyeB}</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
          </div>

          <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-6" style={{ color: BLACK, fontSize: "clamp(30px, 2.6vw, 48px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
            {c.title1}<br />{c.title2}<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
          </h2>

          <div className="ml-[80px] mt-8 space-y-2">
            <p className="font-display font-medium tracking-[-0.05em] text-[12px]" style={{ color: BLACK }}>{project ? `${tasks.filter((t) => !isTaskDone(t)).length} open taken · ${Math.round(project.progress || 0)}% voortgang` : "Laden…"}</p>
            {proposal && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: GREY }}>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1.5" style={{ color: BLUE }}><span className="font-bold">Voorstel</span> | Giulia adviseert_</p>
                <p className="font-body text-[12px] leading-[1.55] whitespace-pre-line" style={{ color: INK }}>{proposal}</p>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-8" />

          <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-5" style={{ color: BLACK, fontSize: "clamp(24px, 1.9vw, 38px)" }}>
            {c.heading1}<br />{c.heading2}<BounceBalls color={firstItemColor} count={3} />
          </h3>

          <div className="h-px w-full" style={{ background: "#d8dab3" }} />
          <div className="flex items-center justify-between mt-5">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">On what matters</span> | now_</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
          </div>

          <div className="mt-4 ml-[80px] space-y-3">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>{itemsLabel}</p>
            {items.length === 0 && <p className="font-body text-[12px]" style={{ color: INK }}>{project ? "Niets dringends." : "Laden…"}</p>}
            {items.map((it, idx) => (
              <button key={it.n} onClick={() => executeItem(it)} className="flex gap-3 items-end text-left w-full hover:opacity-70 transition">
                <span className="w-[84px] shrink-0 flex justify-end items-end gap-[5px]">
                  <BounceBalls color={color} count={idx + 1} ml="0" />
                  <span className="font-display font-bold leading-none" style={{ color, fontSize: "30px" }}>{it.n}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-display ${it.desc ? "font-bold text-[13px]" : "font-medium text-[12.5px] leading-[1.4]"} leading-tight`} style={{ color }}>{it.title}</p>
                  {it.desc && <p className="font-body text-[12px] leading-[1.4] mt-1" style={{ color: "#333" }}>{it.desc}</p>}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t" style={{ borderColor: GREY }}>
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase" style={{ color: "#abab69" }}>Le reste peut attendre</p>
          </div>
        </div>
      </div>

      {/* RECHTS — bestaande project-secties per tab */}
      <div className="relative z-20 flex-1 min-w-0 h-full flex flex-col overflow-visible">
        {project ? (
          <div className="flex-1 min-h-0 pl-8 pr-6 lg:-ml-[56px] pb-6 pt-6 overflow-y-auto no-scrollbar">
            {tab === "OVERVIEW" && <OverviewSection {...sectionProps} />}
            {tab === "TASKS" && <TasksSection {...sectionProps} />}
            {tab === "MILESTONES" && <MilestonesSection project={project} themes={themes} />}
            {tab === "DECISIONS" && <DecisionsSection project={project} themes={themes} />}
            {tab === "FILES" && <FilesSection project={project} tasks={tasks} />}
            {tab === "NOTES" && <NotesSection project={project} themes={themes} />}
            {tab === "GIULIA" && <GiuliaSection project={project} tasks={tasks} reload={load} />}
          </div>
        ) : (
          <div className="flex-1 p-8 space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}</div>
        )}
      </div>
    </motion.div>
  );
}