import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isTaskDone } from "@/lib/projectStatus";

const ACCENT = "hsl(var(--life-olive))";
const NUM_COLORS = ["#d0d9dd", "#595c64", "#d8dab3"];
const pad2 = (n) => String(n).padStart(2, "0");

const TAB_COPY = {
  OVERVIEW: { eyebrow: "Focus | Projects | current_state_", title1: "Here's what", title2: "you're building", heading1: "What needs", heading2: "your attention" },
  ACTIVE: { eyebrow: "Focus | Projects | Active", title1: "What's moving,", title2: "what's stuck.", heading1: "Projects", heading2: "to unblock" },
  TASKS: { eyebrow: "Focus | Projects | Tasks", title1: "What's due,", title2: "what's late.", heading1: "Tasks", heading2: "overdue" },
  MILESTONES: { eyebrow: "Focus | Projects | Milestones", title1: "What's next", title2: "on the map.", heading1: "Milestones", heading2: "coming up" },
  DECISIONS: { eyebrow: "Focus | Projects | Decisions", title1: "What you", title2: "decided.", heading1: "Decisions", heading2: "to make" },
  INSIGHTS: { eyebrow: "Focus | Projects | Inzichten", title1: "Where", title2: "you're heading.", heading1: "Pressure", heading2: "points ahead" },
  FILES: { eyebrow: "Focus | Projects | Files", title1: "What's filed,", title2: "what's missing.", heading1: "Documents", heading2: "to chase" },
};

function buildDynamic(tab, data) {
  const { projects, tasks, milestones, decisions } = data;
  const today = new Date();
  const overdue = tasks.filter((t) => !isTaskDone(t) && t.deadline && new Date(t.deadline) < today).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const upcoming = tasks.filter((t) => !isTaskDone(t) && t.deadline && new Date(t.deadline) >= today).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
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

/** ProjectAnalysisStage — Giulia's analyse van de projectenportefeuille per
 *  tab, client-side uit de live data. Opent automatisch bij binnenkomst. */
export default function ProjectAnalysisStage({ tab, onClose }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const [p, t, th, m, d] = await Promise.all([
        base44.entities.Project.list().catch(() => []),
        base44.entities.Task.list().catch(() => []),
        base44.entities.ProjectTheme.list().catch(() => []),
        base44.entities.Milestone.list().catch(() => []),
        base44.entities.Decision.list().catch(() => []),
      ]);
      setData({ projects: p || [], tasks: t || [], themes: th || [], milestones: m || [], decisions: d || [] });
    } catch {}
    setBusy(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => { const h = () => load(); window.addEventListener("giulia:projects-reload", h); return () => window.removeEventListener("giulia:projects-reload", h); }, []);

  const c = TAB_COPY[tab] || TAB_COPY.OVERVIEW;
  const dyn = data ? buildDynamic(tab, data) : null;
  const items = dyn?.items || [];
  const pColor = (id) => (data?.projects || []).find((p) => p.id === id)?.color || NUM_COLORS[0];
  const itemColor = (it) => pColor(it.to_id) || NUM_COLORS[0];

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <button onClick={load} title="Opnieuw analyseren" className="p-1 rounded-full hover:bg-white/10 transition text-ivory/70">
          <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-5">
        {busy && !data ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 py-24">
            <div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/60">Giulia analyseert…</p>
          </div>
        ) : data ? (
          <div className="space-y-3">
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: ACCENT }}>{c.eyebrow}</p>
            <h2 className="font-display font-bold uppercase tracking-[-0.03em] leading-[0.95] text-[24px]">{c.title1}<br />{c.title2}</h2>
            <div className="h-px w-10" style={{ background: ACCENT }} />

            {dyn?.proposal && (
              <div className="pt-1">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: ACCENT }}>Giulia adviseert</p>
                <p className="text-[13px] leading-[1.6] text-ivory/90">{dyn.proposal}</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="pt-3 mt-1 border-t border-white/12 space-y-3">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: ACCENT }}>{dyn.itemsLabel}</p>
                {items.map((it, idx) => {
                  const ic = itemColor(it);
                  return (
                    <div key={it.n || idx} className="flex gap-3 items-start">
                      <span className="font-display font-bold leading-none shrink-0" style={{ color: ic, fontSize: "22px" }}>{it.n || pad2(idx + 1)}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-tight" style={{ color: ic }}>{it.title}</p>
                        {it.desc && <p className="text-[12px] text-ivory/70 leading-[1.5] mt-1">{it.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 mt-2 border-t border-white/12">
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: "#abab69" }}>Le reste peut attendre</p>
              {dyn?.rest && <p className="text-[11px] text-ivory/55 mt-2 leading-[1.5]">{dyn.rest}</p>}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-ivory/50 italic py-10 text-center">Nog geen analyse.</p>
        )}
      </div>
    </div>
  );
}