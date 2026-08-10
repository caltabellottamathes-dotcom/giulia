import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/**
 * GiuliaWidget — "Je dag". A fixed widget: every morning Giulia compiles a
 * concrete day plan based on the actual situation, and adapts it through the
 * day. Layered photo header + glass body, expandable to the full time-block
 * context. Pulls today's DailyPlan; if none exists yet, synthesises a plan
 * from the live task/event/email/approval situation so it's never empty.
 */
const greetingWord = () => {
  const h = new Date().getHours();
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
};

export default function GiuliaWidget() {
  const [priorities, setPriorities] = useState([]);
  const [summary, setSummary] = useState("");
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [updated, setUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    const [plans, tasks, events, emails, approvals] = await Promise.all([
      base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
      base44.entities.Task.list().catch(() => []),
      base44.entities.Event.list().catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
    ]);
    const p = plans[0];
    if (p && (p.priorities?.length || p.plan_data?.summary)) {
      setPriorities((p.priorities || []).slice(0, 3));
      setSummary(p.plan_data?.summary || "Ik heb je dag heringericht op wat veranderd is.");
      setTimeBlocks(Array.isArray(p.plan_data?.plan) ? p.plan_data.plan : []);
      setUpdated(p.last_updated || p.updated_date || null);
    } else {
      const todayEvents = events
        .filter((e) => (e.start || "").slice(0, 10) === today)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      const overdue = tasks
        .filter((t) => t.status === "overdue")
        .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
      const todayTasks = tasks.filter((t) => t.status === "today");
      const prio = [];
      overdue.slice(0, 2).forEach((t) => prio.push(`Afronden — ${t.title}`));
      todayEvents.slice(0, 1).forEach((e) => prio.push(`Voorbereiden — ${e.title}`));
      todayTasks.slice(0, 2).forEach((t) => prio.push(t.title));
      if (emails.length && prio.length < 3) prio.push(`${emails.length} belangrijke berichten beantwoorden`);
      if (approvals.length && prio.length < 3) prio.push(`${approvals.length} goedkeuringen afhandelen`);
      setPriorities(prio.slice(0, 3));
      setSummary("Ik heb je dag opgebouwd op basis van wat er nu speelt.");
      setTimeBlocks(
        todayEvents.map((e) => ({
          time: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
          item: e.title,
        }))
      );
      setUpdated(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const n = priorities.length;
  const updatedStr = updated
    ? new Date(updated).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[400px]">
      <div className="flex flex-col h-full">
        <BrandPhoto
          src={IMAGES.hourglassJacket}
          className="h-36 shrink-0 rounded-b-[24px] shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)] relative z-10"
          overlay="bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/15"
        >
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Giulia · je dag</p>
            <div>
              <p className="text-2xl font-display font-semibold text-ivory leading-tight" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>{greetingWord()}.</p>
              <p className="text-[11px] text-ivory/70 mt-1">{new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
        </BrandPhoto>

        <div className="flex-1 p-5 pt-6 flex flex-col text-current min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-7 w-7 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-current/90 text-balance">{summary}</p>

              <div className="mt-4 mb-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-current tabular-nums leading-none">{n}</span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-current/65 font-semibold">dingen doen er vandaag toe</span>
              </div>

              <ol className="space-y-2.5">
                {priorities.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-sm font-display font-bold text-current/45 tabular-nums leading-snug pt-0.5">{String(i + 1).padStart(2, "0")} —</span>
                    <span className="text-sm leading-snug text-current/95">{p}</span>
                  </li>
                ))}
                {n === 0 && <li className="text-sm text-current/55">Een rustige dag — niets dringends.</li>}
              </ol>

              <p className="text-xs leading-relaxed text-current/60 mt-4">Ik heb alles eromheen geplaatst rond deze prioriteiten.</p>

              {timeBlocks.length > 0 && (
                <button
                  onClick={() => setExpanded((x) => !x)}
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-current/70 hover:text-current transition self-start"
                >
                  {expanded ? "Minder" : "Volledige context"}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                </button>
              )}

              {expanded && timeBlocks.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {timeBlocks.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="tabular-nums text-current/55 w-12 shrink-0">{b.time}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-current/40 shrink-0" />
                      <span className="text-current/85 truncate">{b.item}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-3 flex items-center justify-between">
                <span className="text-[10px] text-current/45">{updatedStr ? `Bijgewerkt om ${updatedStr}` : "Nog geen planning vandaag"}</span>
                <span className="text-[10px] uppercase tracking-wider text-current/45">Giulia</span>
              </div>
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}