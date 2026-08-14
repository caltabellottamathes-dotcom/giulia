import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import {
  RefreshCw, Sparkles, Sunrise, Target, AlertCircle,
} from "lucide-react";

const WEEKDAYS_SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const DAY_ACCENTS = ["bg-olive", "bg-powder", "bg-ridge", "bg-steel", "bg-urgent", "bg-sand", "bg-olive/60"];

const mondayOf = (d = new Date()) => {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
};
const isoDate = (d) => d.toLocaleDateString("sv-SE");

/**
 * PlanningContent — the planning cockpit (daily + weekly), without a PageHero
 * so it can be embedded both in the Planning page and inside the Agenda.
 */
export default function PlanningContent() {
  const [weekly, setWeekly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const weekStart = isoDate(mondayOf());
  const today = isoDate(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, d, t] = await Promise.all([
        base44.entities.WeeklyPlan.filter({ week_start: weekStart }).catch(() => []),
        base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
        base44.entities.Task.filter({ status: { $in: ["today", "upcoming", "overdue", "todo", "in_progress"] } }).catch(() => []),
      ]);
      setWeekly((w && w[0]) || null);
      setDaily((d && d[0]) || null);
      setTasks(t || []);
    } catch {
      setWeekly(null);
      setDaily(null);
    } finally {
      setLoading(false);
    }
  }, [weekStart, today]);

  useEffect(() => { load(); }, [load]);

  const regenerate = async (which) => {
    setBusy(which);
    try {
      await base44.functions.invoke(which === "week" ? "weeklyPlanning" : "dailyPlanning", {});
      await load();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  const openTasks = (tasks || []).filter((t) => t.status !== "completed" && t.status !== "archived");
  const tasksOn = (date) => openTasks.filter((t) => t.deadline === isoDate(date));
  const todayTasks = openTasks.filter((t) => t.deadline === today || t.status === "today");

  const weekPlan = weekly?.plan_data?.plan || [];
  const weekSummary = weekly?.plan_data?.summary || "";
  const dayPriorities = daily?.priorities || [];
  const dayPlan = daily?.plan_data?.plan || [];
  const daySummary = daily?.plan_data?.summary || "";

  const mondayDate = mondayOf();
  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      {/* Daily cockpit */}
      <GlassPanel level={3} className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-2xl glass-1 flex items-center justify-center">
              <Sunrise className="h-5 w-5 text-olive" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="text-lg font-display font-semibold">Vandaag</h2>
              <p className="text-xs text-muted-foreground">Je dagcockpit — samengesteld door Giulia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {daily && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
                {new Date(daily.last_updated || daily.created_date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <GlassButton variant="outline" size="sm" onClick={() => regenerate("day")} disabled={busy === "day"}>
              <RefreshCw className={cn("h-4 w-4", busy === "day" && "animate-spin")} />
              {busy === "day" ? "Dag…" : "Regenereer dag"}
            </GlassButton>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 rounded-lg shimmer w-2/3" />
            <div className="h-6 rounded-lg shimmer w-1/2" />
            <div className="h-6 rounded-lg shimmer w-3/4" />
          </div>
        ) : !daily ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">Giulia heeft nog geen dagplanning gemaakt voor vandaag.</p>
            <GlassButton variant="primary" size="md" onClick={() => regenerate("day")} disabled={busy === "day"}>
              <Sparkles className="h-4 w-4" /> Laat Giulia je dag plannen
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-6">
            {daySummary && (
              <div className="glass-1 rounded-2xl p-4">
                <p className="text-sm leading-relaxed whitespace-pre-line">{daySummary}</p>
              </div>
            )}
            {dayPriorities.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">Wat vandaag ertoe doet</p>
                <div className="space-y-2.5">
                  {dayPriorities.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-sm font-display font-semibold text-olive/80 tabular-nums mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-sm flex-1 pt-0.5">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {dayPlan.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">Tijdblokken</p>
                <div className="space-y-1.5">
                  {dayPlan.map((b, i) => (
                    <div key={i} className="flex items-start gap-4 py-2 border-b border-border/30 last:border-0">
                      <span className="text-xs font-medium tabular-nums text-muted-foreground w-16 shrink-0">{b.time}</span>
                      <p className="text-sm flex-1">{b.item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {!loading && todayTasks.length > 0 && (
          <div className="mt-6 pt-5 border-t border-border/30">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">Jouw taken vandaag</p>
            <div className="space-y-2">
              {todayTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 glass-1 rounded-xl px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                  <p className="text-sm flex-1">{t.title}</p>
                  {t.priority === "high" && <span className="text-[10px] uppercase tracking-wider text-urgent font-semibold">hoog</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Week */}
      <GlassPanel level={2} className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-2xl glass-1 flex items-center justify-center">
              <Target className="h-5 w-5 text-olive" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="text-lg font-display font-semibold">Deze week</h2>
              <p className="text-xs text-muted-foreground">Week van {new Date(weekStart).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {weekly && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">{weekly.status === "active" ? "Actief" : "Concept"}</span>
            )}
            <GlassButton variant="primary" size="sm" onClick={() => regenerate("week")} disabled={busy === "week"}>
              <RefreshCw className={cn("h-4 w-4", busy === "week" && "animate-spin")} />
              {busy === "week" ? "Week…" : "Regenereer week"}
            </GlassButton>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-40 rounded-xl shimmer" />)}
          </div>
        ) : !weekly ? (
          <div className="text-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Nog geen weekplanning. Giulia kan je taken, afspraken en deadlines automatisch verdelen.</p>
            <GlassButton variant="primary" size="md" onClick={() => regenerate("week")} disabled={busy === "week"}>
              <Sparkles className="h-4 w-4" /> Maak mijn weekplanning
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-6">
            {weekSummary && (
              <div className="glass-1 rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Focus van de week</p>
                <p className="text-sm leading-relaxed whitespace-pre-line">{weekSummary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {dayDates.map((date, i) => {
                const dp = weekPlan[i] || {};
                const isToday = isoDate(date) === today;
                return (
                  <div key={i} className={cn("rounded-2xl p-4 min-h-[160px] flex flex-col", isToday ? "glass-2 ring-1 ring-olive/30" : "glass-1")}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full shrink-0", DAY_ACCENTS[i % DAY_ACCENTS.length])} />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{WEEKDAYS_SHORT[i]}</p>
                      <p className={cn("text-sm font-semibold", isToday && "text-olive")}>{date.getDate()}</p>
                    </div>
                    {dp.focus && <p className="text-xs font-medium mb-2 text-foreground/90">{dp.focus}</p>}
                    <div className="space-y-1.5 flex-1">
                      {(dp.items || []).map((item, j) => (
                        <p key={j} className="text-[11px] leading-snug text-muted-foreground">{item}</p>
                      ))}
                      {tasksOn(date).map((t) => (
                        <p key={`t-${t.id}`} className="text-[11px] leading-snug text-foreground/80 flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-olive shrink-0" /> {t.title}
                        </p>
                      ))}
                      {!(dp.items || []).length && !dp.focus && !tasksOn(date).length && (
                        <p className="text-[11px] text-muted-foreground/50 italic">vrij</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}