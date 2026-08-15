import React, { useState } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Tile, SIZES, WidgetHeader, CountUp, Ring, BrandPhoto } from "./shared";

/* GiuliaWidget · Je dag — editorial photo (left) + glass content (right) with
 * numbered priorities. Reflow: wide/square keep the side photo; tall stacks
 * photo on top. Same elements, same copy, same accent. */

const greetingWord = () => { const h = new Date().getHours(); return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond"; };

function useDay() {
  const [priorities, setPriorities] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    (async () => {
      const today = new Date().toLocaleDateString("sv-SE");
      const [plans, tasks, events, emails, approvals] = await Promise.all([
        base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
        base44.entities.Task.list().catch(() => []),
        base44.entities.Event.list().catch(() => []),
        base44.entities.Email.filter({ status: "unread" }).catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
      ]);
      const p = plans[0];
      const focus = Array.isArray(p?.plan_data?.focus_items) ? p.plan_data.focus_items : [];
      if (p && focus.length) { setPriorities(focus.slice(0, 3).map((f) => ({ label: f?.title || "Taak", to: "/tasks" }))); setSummary("Ik heb je dag heringericht op wat vandaag telt."); }
      else {
        const overdue = tasks.filter((t) => t.status === "overdue").sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
        const todayTasks = tasks.filter((t) => t.status === "today");
        const todayEvents = events.filter((e) => (e.start || "").slice(0, 10) === today).sort((a, b) => new Date(a.start) - new Date(b.start));
        const prio = [];
        overdue.slice(0, 2).forEach((t) => prio.push({ label: `Afronden — ${t.title}`, to: t.project_id ? `/projects/${t.project_id}` : "/tasks" }));
        todayEvents.slice(0, 1).forEach((e) => prio.push({ label: `Voorbereiden — ${e.title}`, to: "/agenda" }));
        todayTasks.slice(0, 2).forEach((t) => prio.push({ label: t.title, to: t.project_id ? `/projects/${t.project_id}` : "/tasks" }));
        if (emails.length && prio.length < 3) prio.push({ label: `${emails.length} belangrijke berichten beantwoorden`, to: "/email" });
        if (approvals.length && prio.length < 3) prio.push({ label: `${approvals.length} goedkeuringen afhandelen`, to: "/approvals" });
        setPriorities(prio.slice(0, 3)); setSummary("Ik heb je dag opgebouwd op basis van wat er nu speelt.");
      }
      setLoading(false);
    })();
  }, []);
  return { priorities, summary, loading };
}

export function GiuliaAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { priorities, summary, loading } = useDay();
  const stack = ratio === "tall";
  return (
    <Tile ratio={ratio} radius="large" onClick={() => openModule("chat")}>
      <div className={cn("h-full flex", stack ? "flex-col" : "flex-row")}>
        <div className={cn("relative overflow-hidden", stack ? "h-28 w-full shrink-0 rounded-b-[20px]" : "w-[34%] shrink-0 rounded-r-[24px]")}>
          <img src={IMAGES.portraitBootFace} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
          <div className="absolute left-3 bottom-3"><p className="text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/75">Giulia</p><p className="text-[11px] text-ivory/60">je dag</p></div>
        </div>
        <div className="flex-1 p-4 flex flex-col text-current min-h-0">
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div> : (
            <>
              <p className="text-[10px] uppercase tracking-[0.26em] font-semibold text-current/60">Giulia · je dag</p>
              <h3 className="text-base font-display font-semibold text-current leading-tight mt-0.5">{greetingWord()}.</h3>
              <p className="text-[11px] text-current/65 mt-1 line-clamp-2">{summary}</p>
              <ol className="mt-2.5 space-y-1.5 flex-1 min-h-0">
                {priorities.map((p, i) => (
                  <li key={i}>
                    <Link to={p.to} onClick={(e) => e.stopPropagation()} className="flex items-stretch gap-2.5 glass-1 rounded-xl px-2.5 py-1.5 hover:bg-white/5 transition text-left">
                      <span className="text-[20px] leading-none font-display font-bold tabular-nums w-6 shrink-0" style={{ color: "var(--tile-accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[11px] leading-snug text-current/90 pt-0.5 line-clamp-2">{p.label}</span>
                    </Link>
                  </li>
                ))}
                {priorities.length === 0 && <li className="text-[11px] text-current/55 glass-1 rounded-xl px-3 py-2">Een rustige dag — niets dringends.</li>}
              </ol>
            </>
          )}
        </div>
      </div>
    </Tile>
  );
}

/* AgendaWidget — header photo with time+title+location+day toggle, then a
 * day timeline + count + Openen. Wide → photo left / content right; else stack. */
export function AgendaAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: events, loading } = useEntityList("Event", { sort: "start" });
  const [day, setDay] = useState("today");
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const targetStr = day === "today" ? todayStr : tomorrow.toLocaleDateString("sv-SE");
  const todays = events.filter((e) => (e.start || "").slice(0, 10) === targetStr).sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const next = todays[0];
  const pos = (start) => { const h = new Date(start).getHours() + new Date(start).getMinutes() / 60; return Math.max(0, Math.min(1, (h - 8) / 12)); };
  const row = ratio === "wide";
  const Photo = (
    <div className={cn("relative overflow-hidden", row ? "w-[44%] shrink-0 rounded-r-[20px]" : "h-36 shrink-0 rounded-b-[20px]")}>
      <BrandPhoto src={IMAGES.walkChairsBeach} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/45 via-transparent to-transparent" />
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Agenda</h3>
          <div className="flex gap-0.5 p-0.5 rounded-full bg-ivory/10 border border-ivory/20" onClick={(e) => e.stopPropagation()}>
            {["today", "tomorrow"].map((d) => (
              <button key={d} onClick={(e) => { e.stopPropagation(); setDay(d); }} className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-full transition", day === d ? "" : "text-ivory/80")} style={day === d ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" } : undefined}>{d === "today" ? "Vandaag" : "Morgen"}</button>
            ))}
          </div>
        </div>
        {next ? (
          <div>
            <span className="text-4xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory tabular-nums" style={{ textShadow: "0 2px 14px rgba(0,0,0,0.5)" }}>{new Date(next.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
            <p className="text-sm font-semibold text-ivory leading-tight truncate mt-1" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{next.title}</p>
            {next.location && <p className="text-[11px] text-ivory/75 truncate">{next.location}</p>}
          </div>
        ) : <div><span className="text-4xl font-display font-semibold text-ivory/85">0</span><p className="text-xs text-ivory/75 mt-1">{day === "today" ? "Vandaag is leeg" : "Morgen is leeg"}</p></div>}
      </div>
    </div>
  );
  return (
    <Tile ratio={ratio} radius="large" onClick={() => openModule("agenda")}>
      <div className={cn("h-full flex", row ? "flex-row" : "flex-col")}>
        {Photo}
        <div className="flex-1 px-4 py-3 text-ivory flex flex-col min-h-0">
          {loading ? <div className="flex-1 flex items-center"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div> : (
            <>
              <div className="relative h-9">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-ivory/15" />
                {todays.map((e) => <span key={e.id} className="absolute top-1/2 -translate-y-1/2 h-5 w-2 rounded-full" style={{ left: `calc(${pos(e.start) * 100}% - 4px)`, background: "var(--tile-accent)" }} />)}
                <span className="absolute -bottom-1 left-0 text-[9px] text-ivory/50 tabular-nums">08</span>
                <span className="absolute -bottom-1 right-0 text-[9px] text-ivory/50 tabular-nums">20</span>
              </div>
              <div className="mt-auto pt-3 flex items-center justify-between">
                <span className="text-[11px] text-ivory/60">{todays.length} afspraak{todays.length !== 1 ? "en" : ""}</span>
                <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Openen</button>
              </div>
            </>
          )}
        </div>
      </div>
    </Tile>
  );
}

/* TasksWidget — glass floats over a bottom photo; ring + focus task. */
export function TasksAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: tasks, loading, reload } = useEntityList("Task");
  const active = tasks.filter((t) => ["today", "overdue", "upcoming"].includes(t.status));
  const overdue = tasks.filter((t) => t.status === "overdue");
  const done = tasks.filter((t) => t.status === "completed");
  const total = tasks.length;
  const top = overdue[0] || active[0];
  const complete = async (e, task) => { e.stopPropagation(); try { await base44.entities.Task.update(task.id, { status: "completed" }); reload(); } catch {} };
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("tasks")}>
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-6 rounded-b-[20px] glass-3 p-4 relative z-10 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col min-h-0">
          <WidgetHeader label="Taken" count={active.length ? `${active.length} open` : "alles klaar"} />
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div> : (
            <div className="flex-1 flex items-center gap-4 min-h-0">
              <Ring value={done.length} max={total || 1} size={s.ring} stroke={10}>
                <div className="text-center"><CountUp value={active.length} className="text-xl font-display font-semibold leading-none text-ivory" /><p className="text-[8px] uppercase tracking-wider text-ivory/45 mt-0.5">open</p></div>
              </Ring>
              <div className="flex-1 min-w-0">
                {overdue.length > 0 && <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}><span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-soft" /><span className="text-[10px] font-semibold tabular-nums">{overdue.length} te laat</span></div>}
                {top ? (<><p className="text-sm font-semibold text-ivory leading-tight line-clamp-2">{top.title}</p><button onClick={(e) => complete(e, top)} className="mt-2.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Voltooi</button></>) : <p className="text-sm text-ivory/55">Geen open taken</p>}
              </div>
            </div>
          )}
        </div>
        <div className={cn("relative shrink-0 overflow-hidden", s.photo)}><BrandPhoto src={IMAGES.feetChairs} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/20" /></div>
      </div>
    </Tile>
  );
}

/* ApprovalsWidget — glass floats over a header photo that carries the count. */
export function ApprovalsAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: approvals, loading, reload } = useEntityList("Approval", { filter: { status: "pending" }, realtime: true });
  const top = approvals[0];
  const decide = async (e, a, action) => { e.stopPropagation(); try { await base44.functions.invoke("executeApproval", { approval_id: a.id, action }); } catch {} reload(); };
  return (
    <Tile ratio={ratio} radius="soft" onClick={() => openModule("approvals")}>
      <div className="flex flex-col h-full">
        <div className={cn("relative shrink-0 overflow-hidden", ratio === "tall" ? "h-24" : ratio === "wide" ? "h-20" : "h-24")}>
          <BrandPhoto src={IMAGES.leanChair} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-charcoal/10" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Goedkeuringen</h3>
            <div className="flex items-end gap-2"><CountUp value={approvals.length} className="text-4xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" /><p className="text-[10px] uppercase tracking-[0.2em] text-ivory/70 mb-1">wachten op jou</p></div>
          </div>
        </div>
        <div className="flex-1 -mt-6 rounded-t-[20px] glass-3 p-3.5 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col min-h-0">
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div> : approvals.length > 0 ? (
            <>
              <p className="text-sm font-medium text-ivory line-clamp-2">{top?.description}</p>
              {top?.assignee && <span className={`mt-1.5 self-start text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${top.assignee === "giulia" ? "bg-steel/25 text-ivory/80" : "bg-olive/30 text-ivory"}`}>{top.assignee === "giulia" ? "Voor Giulia" : "Voor jou"}</span>}
              <div className="mt-auto pt-2.5 flex gap-2">
                <button onClick={(e) => decide(e, top, "approve")} className="flex-1 h-10 rounded-2xl font-semibold text-sm transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Goedkeuren</button>
                <button onClick={(e) => decide(e, top, "reject")} className="flex-1 h-10 rounded-2xl font-semibold text-sm border border-ivory/20 text-ivory transition hover:bg-ivory/10">Afwijzen</button>
              </div>
            </>
          ) : <div className="flex-1 flex flex-col items-center justify-center text-center"><span className="text-4xl font-display font-semibold text-ivory/30">0</span><p className="text-sm text-ivory/55 mt-1">Niets staat open</p></div>}
        </div>
      </div>
    </Tile>
  );
}