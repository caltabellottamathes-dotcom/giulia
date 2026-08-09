import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

/**
 * GiuliaWidget — "je dag", premium edition.
 * A bespoke day-arc timeline (06:00 → 22:00) carries today's events as
 * colour-coded dots with a "now" marker; beside it the focused next step
 * gets a refined colour-coded card with a single clear action; the rest
 * sit as a calm queue. Each kind owns a graphic colour.
 */
const TYPE_COLOR = {
  task: "hsl(var(--olive))",
  event: "hsl(var(--sand))",
  approval: "hsl(var(--ridge))",
  email: "hsl(16 45% 47%)",
};
const TYPE_ON = {
  task: "hsl(var(--ivory))",
  event: "hsl(var(--charcoal))",
  approval: "hsl(var(--charcoal))",
  email: "hsl(var(--ivory))",
};

const DAY_START = 6;
const DAY_END = 22;
const timeFrac = (date) => {
  const h = date.getHours() + date.getMinutes() / 60;
  return Math.max(0, Math.min(1, (h - DAY_START) / (DAY_END - DAY_START)));
};
const arcPoint = (f) => {
  const theta = Math.PI * (1 - f);
  return { x: 50 + 46 * Math.cos(theta), y: 80 - 46 * Math.sin(theta) };
};

export default function GiuliaWidget() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const load = useCallback(async () => {
    const [tasks, events, approvals, emails] = await Promise.all([
      base44.entities.Task.list().catch(() => []),
      base44.entities.Event.list().catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
    ]);
    const todayStr = new Date().toLocaleDateString("sv-SE");
    const s = [];
    tasks.filter((t) => t.status === "overdue").sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0)).slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", kind: "Te laat", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Geen deadline" }));
    events.filter((e) => (e.start || "").slice(0, 10) === todayStr).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 4)
      .forEach((e) => s.push({ id: e.id, type: "event", kind: "Vandaag", title: e.title, start: e.start, meta: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) + (e.location ? " · " + e.location : "") }));
    tasks.filter((t) => t.status === "today").slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", kind: "Taak vandaag", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Vandaag" }));
    emails.slice(0, 2).forEach((m) => s.push({ id: m.id, type: "email", kind: "Ongelezen", title: m.subject || "Email", meta: m.sender ? `Van ${m.sender}` : "Inbox" }));
    approvals.slice(0, 2).forEach((a) => s.push({ id: a.id, type: "approval", kind: "Goedkeuring", title: a.description || a.action_type || "Actie", meta: "Wacht op jou" }));
    setSteps(s.slice(0, 7));
    setIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const step = steps[index];
  const complete = async () => { if (!step) return; try { await base44.entities.Task.update(step.id, { status: "completed" }); } catch {} load(); };
  const approve = async () => { if (!step) return; try { await base44.entities.Approval.update(step.id, { status: "approved" }); } catch {} load(); };
  const reject = async () => { if (!step) return; try { await base44.entities.Approval.update(step.id, { status: "rejected" }); } catch {} load(); };
  const skip = () => setIndex((i) => (i + 1 < steps.length ? i + 1 : 0));
  const prev = () => setIndex((i) => (i > 0 ? i - 1 : steps.length - 1));
  const next = () => setIndex((i) => (i + 1 < steps.length ? i + 1 : 0));

  const nowFrac = timeFrac(new Date());
  const nowPt = arcPoint(nowFrac);
  const arcEvents = steps.filter((s) => s.type === "event" && s.start);
  const dateStr = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[380px]">
      <div className="relative p-5 flex flex-col h-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
            {/* Left — focus */}
            <div className="lg:w-5/12 flex flex-col min-h-0">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-current opacity-55 mb-1">Giulia · je dag</p>
                  <p className="text-xs text-current opacity-45 truncate">{dateStr}</p>
                </div>
                <span className="text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{steps.length ? `${index + 1}/${steps.length}` : "0"}</span>
              </div>

              <div className="flex-1 min-h-0">
                {!step ? (
                  <div className="h-full rounded-2xl border border-current/10 flex flex-col items-center justify-center text-center p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
                      <span className="text-2xl font-display font-bold">✓</span>
                    </div>
                    <p className="text-lg font-display font-bold text-current">Niets dringends</p>
                    <p className="text-xs text-current opacity-50 mt-1">Je dag is rustig.</p>
                  </div>
                ) : (
                  <div className="relative h-full rounded-2xl border border-current/10 p-4 overflow-hidden flex flex-col" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: TYPE_COLOR[step.type] }} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold pl-2 mb-2" style={{ color: TYPE_COLOR[step.type] }}>{step.kind}</p>
                    <p className="text-2xl font-display font-bold text-current leading-tight text-balance pl-2 mb-1">{step.title}</p>
                    <p className="text-xs text-current opacity-55 pl-2 mb-auto">{step.meta}</p>
                    <div className="flex items-center gap-2 pl-2 mt-4">
                      {step.type === "task" && <button onClick={complete} className="flex-1 h-11 rounded-xl font-bold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Voltooien</button>}
                      {step.type === "approval" && (
                        <>
                          <button onClick={approve} className="flex-1 h-11 rounded-xl font-bold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Goedkeuren</button>
                          <button onClick={reject} className="flex-1 h-11 rounded-xl font-bold text-sm border border-current/20 text-current transition hover:bg-current/5">Afwijzen</button>
                        </>
                      )}
                      {step.type === "event" && <Link to="/agenda" className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Bekijk</Link>}
                      {step.type === "email" && <Link to="/email" className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Openen</Link>}
                      <button onClick={skip} className="h-11 px-3.5 rounded-xl font-bold text-sm text-current opacity-60 hover:opacity-100 transition">Later</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right — day arc + queue */}
            <div className="lg:w-7/12 flex flex-col min-h-0">
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-current opacity-55 mb-1">Vandaag</p>
              <div className="relative">
                <svg viewBox="0 0 100 84" className="w-full h-[74px]">
                  <path d="M4,80 A46,46 0 0,1 96,80" fill="none" stroke="currentColor" strokeWidth="0.8" className="opacity-20" />
                  <line x1={nowPt.x} y1={nowPt.y} x2={nowPt.x} y2={80} stroke="var(--tile-accent)" strokeWidth="0.5" opacity="0.6" />
                  <circle cx={nowPt.x} cy={nowPt.y} r="1.4" fill="var(--tile-accent)" />
                  {arcEvents.map((s) => {
                    const p = arcPoint(timeFrac(new Date(s.start)));
                    const isCur = step?.id === s.id;
                    return <circle key={s.id} cx={p.x} cy={p.y} r={isCur ? 3 : 2.2} fill={TYPE_COLOR.event} stroke="currentColor" strokeWidth={isCur ? 0.6 : 0} strokeOpacity={0.3} />;
                  })}
                </svg>
                <div className="flex justify-between text-[9px] text-current opacity-40 -mt-1 px-0.5 tabular-nums">
                  <span>06</span>
                  <span>nu</span>
                  <span>22</span>
                </div>
              </div>

              <div className="flex-1 min-h-0 mt-3 flex flex-col gap-1 overflow-hidden">
                {steps.length > 1 ? steps.map((s, i) => (i === index ? null : (
                  <button key={s.id} onClick={() => setIndex(i)} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-current/5">
                    <span className="h-6 w-1 rounded-full shrink-0" style={{ background: TYPE_COLOR[s.type] }} />
                    <span className="text-[9px] uppercase tracking-wider font-bold w-16 shrink-0" style={{ color: TYPE_COLOR[s.type] }}>{s.kind}</span>
                    <span className="text-sm text-current opacity-75 truncate flex-1">{s.title}</span>
                  </button>
                ))).slice(0, 4) : (
                  <div className="flex-1 flex items-center justify-center"><p className="text-xs text-current opacity-40">Alles staat hierboven</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {steps.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-current/10">
            <button onClick={prev} className="h-8 w-8 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center transition hover:bg-current/5" aria-label="Vorige">‹</button>
            <span className="text-[10px] uppercase tracking-wider text-current opacity-40 font-semibold">stap {index + 1} van {steps.length}</span>
            <button onClick={next} className="h-8 w-8 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center transition hover:bg-current/5" aria-label="Volgende">›</button>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}