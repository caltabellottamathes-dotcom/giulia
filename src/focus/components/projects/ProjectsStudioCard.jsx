import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { isTaskDone, projectStatusMeta } from "@/lib/projectStatus";
import ProjectStacks from "@/focus/components/projects/ProjectStacks";

const EASE = [0.16, 1, 0.3, 1];
const BLUE = "#b1bfc7";
const GREY = "#CCCCCC";
const BLACK = "#000000";
const INK = "#595c64";
const NUM_COLORS = ["#d0d9dd", "#595c64", "#d8dab3"];

const BounceBalls = ({ color = "#000", colors, count, size = "clamp(7px, 0.55vw, 10px)", ml = "7px" }) => {
  const n = count || (colors ? colors.length : 1);
  return (
    <span className="inline-flex items-end gap-[3px] align-baseline" style={{ marginLeft: ml }} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color: colors ? colors[i] : color, width: size, height: size, animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
};

const TAB_COPY = {
  OVERVIEW: { eyebrow: "Focus | Projects | current_state_", title1: "Here's what", title2: "you're building", heading1: "What needs", heading2: "your attention" },
  ACTIVE: { eyebrow: "Focus | Projects | Active", title1: "What's moving,", title2: "what's stuck.", heading1: "Projects", heading2: "to unblock" },
  TASKS: { eyebrow: "Focus | Projects | Tasks", title1: "What's due,", title2: "what's late.", heading1: "Tasks", heading2: "overdue" },
  MILESTONES: { eyebrow: "Focus | Projects | Milestones", title1: "What's next", title2: "on the map.", heading1: "Milestones", heading2: "coming up" },
  DECISIONS: { eyebrow: "Focus | Projects | Decisions", title1: "What you", title2: "decided.", heading1: "Decisions", heading2: "to make" },
  INSIGHTS: { eyebrow: "Focus | Projects | Inzichten", title1: "Where", title2: "you're heading.", heading1: "Pressure", heading2: "points ahead" },
  FILES: { eyebrow: "Focus | Projects | Files", title1: "What's filed,", title2: "what's missing.", heading1: "Documents", heading2: "to chase" },
};

const pad2 = (n) => String(n).padStart(2, "0");

function buildDynamic(tab, data) {
  const { projects, tasks, milestones, decisions } = data;
  const today = new Date();
  const overdue = tasks.filter((t) => !isTaskDone(t) && t.deadline && new Date(t.deadline) < today).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const attention = projects.filter((p) => p.health === "attention" || p.health === "critical");
  const active = projects.filter((p) => ["in_progress", "planning", "review", "waiting", "afwerking"].includes(p.status));
  const openCount = tasks.filter((t) => !isTaskDone(t)).length;
  const pName = (id) => projects.find((p) => p.id === id)?.title || "—";
  const days = (d) => { const n = Math.round((new Date(d) - today) / 86400000); return n < 0 ? `${-n}d te laat` : n === 0 ? "vandaag" : `${n}d`; };
  let items = [], itemsLabel = "00_", rest = "";
  if (tab === "OVERVIEW" || tab === "TASKS") {
    items = overdue.slice(0, 3).map((t, i) => ({ n: pad2(i + 1), title: `${t.title} • ${days(t.deadline)}`, desc: `${pName(t.project_id)}${t.priority ? ` · ${t.priority}` : ""}`, to_id: t.project_id }));
    itemsLabel = `${pad2(items.length)}_overdue_tasks_`;
    rest = `${Math.max(0, openCount - items.length)} andere open taken staan gepland en vragen geen directe actie.`;
  } else if (tab === "ACTIVE") {
    items = attention.slice(0, 3).map((p, i) => ({ n: pad2(i + 1), title: `${p.title} • ${String(p.health || "").toUpperCase()}`, desc: p.next_milestone || p.category || "—", to_id: p.id }));
    itemsLabel = `${pad2(items.length)}_projects_to_unblock_`;
    rest = `De andere ${Math.max(0, active.length - items.length)} actieve projecten lopen op schema.`;
  } else if (tab === "MILESTONES") {
    const ms = (milestones || []).filter((m) => m.status !== "done" && m.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    items = ms.slice(0, 3).map((m, i) => ({ n: pad2(i + 1), title: `${m.name} • ${new Date(m.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`, desc: pName(m.project_id), to_id: m.project_id }));
    itemsLabel = `${pad2(items.length)}_milestones_next_`;
    rest = `Verdere milestones staan gepland en vragen geen directe actie.`;
  } else if (tab === "DECISIONS") {
    const dec = (decisions || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    items = dec.slice(0, 3).map((d, i) => ({ n: pad2(i + 1), title: d.title, desc: `${pName(d.project_id)}${d.date ? ` · ${d.date}` : ""}`, to_id: d.project_id }));
    itemsLabel = `${pad2(items.length)}_decisions_`;
    rest = `Eerdere beslissingen zijn vastgelegd en vragen geen actie.`;
  } else if (tab === "INSIGHTS") {
    items = attention.slice(0, 3).map((p, i) => ({ n: pad2(i + 1), title: `${p.title} • ${String(p.health || "").toUpperCase()}`, desc: `Voortgang ${Math.round(p.progress || 0)}%${p.deadline ? ` · deadline ${p.deadline}` : ""}`, to_id: p.id }));
    itemsLabel = `${pad2(items.length)}_pressure_points_`;
    rest = `De overige projecten blijven binnen hun gezonde bereik.`;
  } else {
    items = [];
    itemsLabel = "00_documents_";
    rest = `Alle documenten zijn gekoppeld en vragen geen actie.`;
  }
  const proposal = `${active.length} actieve projecten · ${openCount} open taken (${overdue.length} te laat). ${attention.length} project(en) vragen aandacht. ${overdue.length ? `Begin bij de ${overdue.length} te late taak/${overdue.length === 1 ? "taak" : "taken"} — die blokkeren vooruitgang.` : `Rustig — niets staat te laat. Pak de eerstvolgende deadline op.`}`;
  return { items, itemsLabel, rest, proposal };
}

export default function ProjectsStudioCard({ tab, onNavigate, onEditProject, enterDelay = 0 }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const [p, t, th, m, d, docs, notes] = await Promise.all([
        base44.entities.Project.list().catch(() => []),
        base44.entities.Task.list().catch(() => []),
        base44.entities.ProjectTheme.list().catch(() => []),
        base44.entities.Milestone.list().catch(() => []),
        base44.entities.Decision.list().catch(() => []),
        base44.entities.Document.list().catch(() => []),
        base44.entities.Note.list().catch(() => []),
      ]);
      setData({ projects: p || [], tasks: t || [], themes: th || [], milestones: m || [], decisions: d || [], documents: docs || [], notes: notes || [] });
    } catch { setData(null); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const h = () => load();
    window.addEventListener("giulia:projects-reload", h);
    return () => window.removeEventListener("giulia:projects-reload", h);
  }, []);

  const goTab = (t) => (onNavigate ? onNavigate(t) : null);
  const resolveTab = (it, currentTab) => {
    const s = `${it.title || ""} ${it.desc || ""}`.toLowerCase();
    if (/milestone|next|map/.test(s)) return "MILESTONES";
    if (/beslis|decision/.test(s)) return "DECISIONS";
    if (/file|document|missing|chase/.test(s)) return "FILES";
    if (/insight|pressure|heading/.test(s)) return "INSIGHTS";
    if (/project|unblock|critical|attention/.test(s)) return "ACTIVE";
    return currentTab === "OVERVIEW" ? "TASKS" : currentTab;
  };

  const handlers = {
    onOpenProject: (p) => navigate(`/projects/${p.id}`),
    onEditProject: (p) => onEditProject?.(p),
    onToggleTask: async (t) => { try { await base44.entities.Task.update(t.id, { status: isTaskDone(t) ? "today" : "completed" }); load(); } catch {} },
    onNavigate: goTab,
    onReload: load,
  };

  const executeItem = (it) => {
    if (it.to_id) {
      const p = (data?.projects || []).find((pp) => pp.id === it.to_id);
      if (p) { navigate(`/projects/${p.id}`); return; }
    }
    goTab(resolveTab(it, tab));
  };

  const c = TAB_COPY[tab] || TAB_COPY.OVERVIEW;
  const dyn = data ? buildDynamic(tab, data) : null;
  const items = dyn?.items || [];
  const proposal = dyn?.proposal || "";
  const itemsLabel = dyn?.itemsLabel || "";
  const rest = dyn?.rest || "";
  const t1 = c.title1, t2 = c.title2, h1 = c.heading1, h2 = c.heading2;
  const [eyeA, ...eyeRest] = c.eyebrow.split("|");
  const eyeB = eyeRest.length ? " | " + eyeRest.join("|").trim() : "";
  const pColor = (id) => (data?.projects || []).find((p) => p.id === id)?.color || null;
  const itemColor = (it) => pColor(it.to_id) || NUM_COLORS[0];
  const firstItemColor = items.length > 0 ? itemColor(items[0]) : NUM_COLORS[0];
  const activeCount = data ? data.projects.filter((p) => ["in_progress", "planning", "review", "waiting", "afwerking"].includes(p.status)).length : 0;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: enterDelay }}
      className="absolute inset-0 rounded-bl-[20px] rounded-r-none graph-paper flex overflow-hidden shadow-[-40px_8px_64px_-18px_rgba(0,0,0,0.55)]"
    >
      {/* Editorial — left ~38% */}
      <div className="relative z-0 w-[38%] h-full flex flex-col overflow-y-auto no-scrollbar border-r" style={{ borderColor: GREY }}>
        <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">{eyeA.trim()}</span>{eyeB}</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
          </div>

          <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-6" style={{ color: BLACK, fontSize: "clamp(34px, 3vw, 54px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
            {t1}<br />{t2}<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
          </h2>

          <div className="ml-[80px] mt-8 space-y-2">
            <p className="font-display font-medium tracking-[-0.05em] text-[12px]" style={{ color: BLACK }}>{data ? `${activeCount} actief · ${data.projects.length} projecten · ${data.tasks.filter((t) => !isTaskDone(t)).length} open taken` : "Laden…"}</p>
            {proposal && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: GREY }}>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1.5" style={{ color: BLUE }}><span className="font-bold">Voorstel</span> | Giulia adviseert_</p>
                <p className="font-body text-[12px] leading-[1.55] whitespace-pre-line" style={{ color: INK }}>{proposal}</p>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-8" />

          <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-5" style={{ color: BLACK, fontSize: "clamp(24px, 1.9vw, 38px)" }}>
            {h1}<br />{h2}<BounceBalls color={firstItemColor} count={3} />
          </h3>

          <div className="h-px w-full" style={{ background: "#d8dab3" }} />
          <div className="flex items-center justify-between mt-5">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">On what matters</span> | now_</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
          </div>

          <div className="mt-4 ml-[80px] space-y-3">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>{itemsLabel}</p>
            {items.length === 0 && <p className="font-body text-[12px]" style={{ color: INK }}>{data ? "Niets dringends." : "Laden…"}</p>}
            {items.map((it, idx) => {
              const ic = itemColor(it);
              return (
                <button key={it.n} onClick={() => executeItem(it)} className="flex gap-3 items-end text-left w-full hover:opacity-70 transition">
                  <span className="w-[84px] shrink-0 flex justify-end items-end gap-[5px]">
                    <BounceBalls color={ic} count={idx + 1} ml="0" />
                    <span className="font-display font-bold leading-none" style={{ color: ic, fontSize: "30px" }}>{it.n}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-display ${it.desc ? "font-bold text-[13px]" : "font-medium text-[12.5px] leading-[1.4]"} leading-tight`} style={{ color: ic }}>{it.title}</p>
                    {it.desc && <p className="font-body text-[12px] leading-[1.4] mt-1" style={{ color: "#333" }}>{it.desc}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6 mt-6 border-t" style={{ borderColor: GREY }}>
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase" style={{ color: "#abab69" }}>Le reste peut attendre</p>
          </div>
        </div>
      </div>

      {/* RECHTS — per-tab bento */}
      <div className="relative z-20 flex-1 min-w-0 h-full flex flex-col overflow-visible">
        {data ? <ProjectStacks tab={tab} data={data} {...handlers} /> : (
          <div className="flex-1 p-8 space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}</div>
        )}
      </div>
    </motion.div>
  );
}