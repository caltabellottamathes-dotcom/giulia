import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Sunrise, ArrowRight, Check, CalendarDays, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY = { high: 3, medium: 2, low: 1 };
const PRIORITY_BAR = { high: "bg-charcoal", medium: "bg-olive", low: "bg-blue-grey" };

function rank(t) {
  const s = { overdue: 4, today: 3, upcoming: 2, waiting: 1, delegated: 1, completed: 0 };
  return (s[t.status] || 0) * 10 + (PRIORITY[t.priority] || 2);
}

/**
 * DailyBriefingWidget — the editorial morning briefing. A solid Metal hero
 * carries the date + greeting; the Storm body ranks the most important
 * to-do's (overdue → today → upcoming, by priority) as numbered editorial
 * items, with graphic palette stat chips for agenda, tasks and approvals.
 * No concierge, no AI-star icon — just a clear, graphic plan for the day.
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
    <WidgetShell size="2x2" radius="large" glass="storm" className="min-h-[520px]">
      {/* Hero — Metal block with the date */}
      <div className="relative bg-charcoal text-ivory px-6 lg:px-7 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.32em] text-sand font-semibold mb-2">
              {now.toLocaleDateString("nl-NL", { weekday: "long" })}
            </p>
            <div className="flex items-baseline gap-3 leading-none">
              <span className="text-[56px] font-display font-semibold tracking-[-0.04em] tabular-nums">{now.getDate()}</span>
              <span className="text-sm uppercase tracking-[0.2em] text-ivory/55">{now.toLocaleDateString("nl-NL", { month: "long" })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <span className="h-7 w-7 rounded-lg bg-sand text-charcoal flex items-center justify-center">
              <Sunrise className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.24em] text-ivory/60 font-semibold">Dagoverzicht</span>
          </div>
        </div>
        <p className="mt-4 text-lg font-display font-medium text-ivory/95">{greetWord}, Salvo.</p>
      </div>

      {/* Body — Storm */}
      <div className="px-6 lg:px-7 pt-5 pb-5 flex-1 flex flex-col min-h-0">
        <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/45 font-semibold mb-3">Eerst dit</p>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-lg shimmer" />
            ))}
          </div>
        ) : featured ? (
          <div className="space-y-3">
            {/* Featured — 01 */}
            <div className="flex items-stretch gap-3 pb-3 border-b border-foreground/10">
              <span className="text-[26px] font-display font-semibold text-olive leading-none tabular-nums">01</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground leading-tight">{featured.title}</p>
                <p className="text-[11px] text-foreground/55 mt-1 truncate">
                  {featured.project_id && projTitle(featured.project_id) ? projTitle(featured.project_id) : "Algemeen"}
                  {featured.deadline ? ` · ${new Date(featured.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}
                  {featured.status === "overdue" ? " · te laat" : ""}
                </p>
              </div>
              <span className={cn("self-stretch w-1 rounded-full shrink-0", PRIORITY_BAR[featured.priority] || PRIORITY_BAR.medium)} />
            </div>

            {/* Rest — 02 onward */}
            {rest.map((t, i) => (
              <button
                key={t.id}
                onClick={(e) => complete(e, t)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <span className="text-[13px] font-display font-semibold text-foreground/35 tabular-nums w-6 shrink-0">{`0${i + 2}`}</span>
                <span className="h-4 w-4 rounded-md border border-foreground/25 shrink-0 flex items-center justify-center group-hover:border-olive group-hover:bg-olive/10 transition">
                  <Check className="h-2.5 w-2.5 text-olive opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <p className="flex-1 min-w-0 text-sm text-foreground/85 truncate">{t.title}</p>
                <span className={cn("h-2 w-2 rounded-full shrink-0", t.status === "overdue" ? "bg-charcoal" : t.priority === "high" ? "bg-olive" : "bg-blue-grey")} />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
            <p className="text-base font-display font-semibold text-foreground">Alles staat klaar</p>
            <p className="text-xs text-foreground/50 mt-1.5">Geen open taken vandaag.</p>
          </div>
        )}

        {/* Graphic stat chips */}
        <div className="mt-auto pt-4 grid grid-cols-3 gap-2">
          <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="text-left rounded-xl bg-charcoal text-ivory px-3 py-2.5 hover:opacity-90 transition">
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays className="h-3 w-3 text-sand" />
              <span className="text-[9px] uppercase tracking-wider text-ivory/55">Agenda</span>
            </div>
            <p className="text-lg font-semibold tabular-nums leading-none">{todaysEvents.length}</p>
          </button>
          <button onClick={(e) => { e.stopPropagation(); openModule("tasks"); }} className="text-left rounded-xl bg-olive text-ivory px-3 py-2.5 hover:opacity-90 transition">
            <div className="flex items-center gap-1.5 mb-1">
              <ClipboardCheck className="h-3 w-3 text-ivory/70" />
              <span className="text-[9px] uppercase tracking-wider text-ivory/65">Taken</span>
            </div>
            <p className="text-lg font-semibold tabular-nums leading-none">{openCount}</p>
            {overdueCount > 0 && <p className="text-[9px] text-ivory/60 mt-0.5">+{overdueCount} te laat</p>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); openModule("approvals"); }} className="text-left rounded-xl bg-sand text-charcoal px-3 py-2.5 hover:opacity-90 transition">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-charcoal/70" />
              <span className="text-[9px] uppercase tracking-wider text-charcoal/55">Wacht</span>
            </div>
            <p className="text-lg font-semibold tabular-nums leading-none">{approvals.length}</p>
          </button>
        </div>

        {firstEvent && (
          <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="mt-3 flex items-center justify-between text-[11px] font-semibold text-foreground/70 hover:text-foreground transition">
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