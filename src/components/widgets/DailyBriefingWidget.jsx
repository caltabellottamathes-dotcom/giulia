import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Sunrise, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY = { high: 3, medium: 2, low: 1 };
const PRIORITY_BAR = { high: "bg-sand", medium: "bg-olive", low: "bg-blue-grey" };

function rank(t) {
  const s = { overdue: 4, today: 3, upcoming: 2, waiting: 1, delegated: 1, completed: 0 };
  return (s[t.status] || 0) * 10 + (PRIORITY[t.priority] || 2);
}

/**
 * DailyBriefingWidget — the graphic morning briefing. A deep liquid-glass
 * surface (not white) carries an oversized date numeral and greeting, the
 * most important to-do's as large editorial numerals (01/02/03) mixed with
 * small wide-tracked kickers, and three solid palette stat blocks (sand /
 * olive / blue) with big numbers. Blue Ridge Sky enters as a real accent.
 */
export default function DailyBriefingWidget() {
  const { openModule } = usePanel();
  const { data: tasks, loading, reload } = useEntityList("Task");
  const { data: events } = useEntityList("Event", { sort: "start" });
  const { data: approvals } = useEntityList("Approval", { filter: { status: "pending" } });
  const { data: projects } = useEntityList("Project");

  const now = new Date();
  const todayStr = now.toLocaleDateString("sv-SE");
  const todaysEvents = events
    .filter((e) => (e.start || "").slice(0, 10) === todayStr)
    .sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const firstEvent = todaysEvents[0];

  const top = [...tasks]
    .filter((t) => t.status !== "completed" && t.status !== "delegated")
    .sort((a, b) => rank(b) - rank(a))
    .slice(0, 4);
  const featured = top[0];
  const rest = top.slice(1, 4);

  const openCount = tasks.filter((t) => ["today", "overdue", "upcoming"].includes(t.status)).length;
  const overdueCount = tasks.filter((t) => t.status === "overdue").length;
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;
  const greetWord = now.getHours() < 12 ? "Goedemorgen" : now.getHours() < 18 ? "Goedemiddag" : "Goedenavond";

  const complete = async (e, task) => {
    e.stopPropagation();
    try {
      await base44.entities.Task.update(task.id, { status: "completed" });
      reload();
    } catch {}
  };

  return (
    <WidgetShell size="2x2" radius="large" glass="liquid" className="min-h-[520px]">
      <div className="relative flex flex-col h-full p-6 lg:p-7">
        {/* Date + label */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-sand font-semibold mb-2">
              {now.toLocaleDateString("nl-NL", { weekday: "long" })}
            </p>
            <div className="flex items-baseline gap-3 leading-none">
              <span className="text-[64px] font-display font-semibold tracking-[-0.05em] text-ivory tabular-nums">{now.getDate()}</span>
              <span className="text-sm uppercase tracking-[0.22em] text-ivory/55">{now.toLocaleDateString("nl-NL", { month: "long" })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <span className="h-7 w-7 rounded-lg bg-sand text-charcoal flex items-center justify-center">
              <Sunrise className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.24em] text-ivory/60 font-semibold">Dagoverzicht</span>
          </div>
        </div>

        <p className="mt-4 text-2xl font-display font-semibold tracking-[-0.02em] text-ivory leading-tight">
          {greetWord}, Salvo.
        </p>

        {/* Eerst dit */}
        <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-3">Eerst dit</p>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white/5 shimmer" />
            ))}
          </div>
        ) : featured ? (
          <div className="space-y-3">
            <div className="flex items-stretch gap-3 pb-3 border-b border-white/10">
              <span className="text-[34px] font-display font-semibold text-sand leading-none tabular-nums">01</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-ivory leading-tight">{featured.title}</p>
                <p className="text-[11px] text-ivory/55 mt-1 truncate">
                  {featured.project_id && projTitle(featured.project_id) ? projTitle(featured.project_id) : "Algemeen"}
                  {featured.deadline ? ` · ${new Date(featured.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}
                  {featured.status === "overdue" ? " · te laat" : ""}
                </p>
              </div>
              <span className={cn("self-stretch w-1.5 rounded-full shrink-0", PRIORITY_BAR[featured.priority] || PRIORITY_BAR.medium)} />
            </div>

            {rest.map((t, i) => (
              <button key={t.id} onClick={(e) => complete(e, t)} className="w-full flex items-center gap-3 text-left group">
                <span className="text-[14px] font-display font-semibold text-ivory/40 tabular-nums w-7 shrink-0">{`0${i + 2}`}</span>
                <span className="h-4 w-4 rounded-md border border-ivory/25 shrink-0 flex items-center justify-center group-hover:border-sand group-hover:bg-sand/15 transition">
                  <Check className="h-2.5 w-2.5 text-sand opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <p className="flex-1 min-w-0 text-sm text-ivory/85 truncate">{t.title}</p>
                <span className={cn("h-2 w-2 rounded-full shrink-0", t.status === "overdue" ? "bg-sand" : t.priority === "high" ? "bg-olive" : "bg-blue-grey")} />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <p className="text-lg font-display font-semibold text-ivory">Alles staat klaar</p>
            <p className="text-xs text-ivory/50 mt-1.5">Geen open taken vandaag.</p>
          </div>
        )}

        {/* Stat blocks — solid palette, big numerals */}
        <div className="mt-auto pt-5 grid grid-cols-3 gap-2.5">
          <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="text-left rounded-2xl bg-sand text-charcoal px-4 py-3 hover:opacity-90 transition specular-edge">
            <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/55 font-semibold mb-1">Agenda</p>
            <p className="text-3xl font-display font-semibold tabular-nums leading-none">{todaysEvents.length}</p>
          </button>
          <button onClick={(e) => { e.stopPropagation(); openModule("tasks"); }} className="text-left rounded-2xl bg-olive text-ivory px-4 py-3 hover:opacity-90 transition specular-edge">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/60 font-semibold mb-1">Taken</p>
            <p className="text-3xl font-display font-semibold tabular-nums leading-none">{openCount}</p>
            {overdueCount > 0 && <p className="text-[9px] text-ivory/70 mt-1">+{overdueCount} te laat</p>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); openModule("approvals"); }} className="text-left rounded-2xl bg-blue-grey text-charcoal px-4 py-3 hover:opacity-90 transition specular-edge">
            <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/55 font-semibold mb-1">Wacht</p>
            <p className="text-3xl font-display font-semibold tabular-nums leading-none">{approvals.length}</p>
          </button>
        </div>

        {firstEvent && (
          <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="mt-3 flex items-center justify-between text-[11px] font-semibold text-ivory/70 hover:text-ivory transition">
            <span className="truncate">
              {new Date(firstEvent.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} · {firstEvent.title}
            </span>
            <span className="flex items-center gap-1 shrink-0 ml-2">Agenda <ArrowRight className="h-3 w-3" /></span>
          </button>
        )}
      </div>
    </WidgetShell>
  );
}