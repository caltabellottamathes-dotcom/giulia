import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

/**
 * GiuliaWidget — "je dag", combined edition.
 * One stark, graphic-forward tile integrating the three former briefing
 * cards: Vandaag (focus step / priorities), Veranderd (last 24h of agent +
 * activity) and Wacht op jou (pending counts). A bespoke day-arc carries
 * today's events as colour-coded dots with a "now" marker.
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
const SRC_DOT = {
  email: "hsl(16 45% 47%)",
  whatsapp: "hsl(var(--sand))",
  task: "hsl(var(--olive))",
  calendar: "hsl(var(--ridge))",
  system: "hsl(var(--smoke))",
  giulia: "hsl(var(--olive))",
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
  const [priorities, setPriorities] = useState([]);
  const [changed, setChanged] = useState([]);
  const [waiting, setWaiting] = useState({ approvals: 0, emails: 0, whatsapp: 0, threads: 0 });
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const load = useCallback(async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    const since = Date.now() - 24 * 3600 * 1000;
    const [tasks, events, approvals, emails, plans, activity, msgs, wa, threads] = await Promise.all([
      base44.entities.Task.list().catch(() => []),
      base44.entities.Event.list().catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
      base44.entities.Activity.list("-created_date", 8).catch(() => []),
      base44.entities.Message.list("-created_date", 24).catch(() => []),
      base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
      base44.entities.Thread.filter({ needs_info: true }).catch(() => []),
    ]);
    const s = [];
    tasks.filter((t) => t.status === "overdue").sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0)).slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", kind: "Te laat", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Geen deadline" }));
    events.filter((e) => (e.start || "").slice(0, 10) === today).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 4)
      .forEach((e) => s.push({ id: e.id, type: "event", kind: "Vandaag", title: e.title, start: e.start, meta: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) + (e.location ? " · " + e.location : "") }));
    tasks.filter((t) => t.status === "today").slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", kind: "Taak vandaag", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Vandaag" }));
    emails.slice(0, 2).forEach((m) => s.push({ id: m.id, type: "email", kind: "Ongelezen", title: m.subject || "Email", meta: m.sender ? `Van ${m.sender}` : "Inbox" }));
    approvals.slice(0, 2).forEach((a) => s.push({ id: a.id, type: "approval", kind: "Goedkeuring", title: a.description || a.action_type || "Actie", meta: "Wacht op jou" }));
    setSteps(s.slice(0, 7));
    setIndex(0);
    setPriorities((plans[0]?.priorities || []).slice(0, 3));
    const recentMsgs = (msgs || []).filter((m) => m.agent_source && new Date(m.created_date).getTime() > since).slice(0, 3);
    const recentAct = (activity || []).filter((a) => new Date(a.created_date || a.timestamp).getTime() > since).slice(0, 3);
    setChanged([...recentMsgs, ...recentAct].slice(0, 4));
    setWaiting({ approvals: approvals.length, emails: emails.length, whatsapp: wa.length, threads: threads.length });
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
  const srcDot = (c) => SRC_DOT[((c.agent_source || c.source || "system") + "").toLowerCase()] || "hsl(var(--smoke))";
  const changedLabel = (c) => c.content || c.description || "";

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[400px]">
      <div className="relative p-5 lg:p-6 flex flex-col h-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-current opacity-55 mb-1">Giulia · je dag</p>
                <p className="text-xs text-current opacity-45 truncate">{dateStr}</p>
              </div>
              {steps.length > 0 && (
                <span className="text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{index + 1}/{steps.length}</span>
              )}
            </div>

            {/* Day arc — the signature graphic */}
            <div className="relative mb-4">
              <svg viewBox="0 0 100 84" className="w-full h-[80px]">
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
                <span>06</span><span>nu</span><span>22</span>
              </div>
            </div>

            {/* Three stark sections */}
            <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
              {/* Vandaag */}
              <div className="flex flex-col min-h-0 border-l-2 pl-3" style={{ borderColor: "var(--tile-accent)" }}>
                <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-current opacity-55 mb-2">Vandaag</p>
                {step ? (
                  <div className="flex flex-col flex-1 min-h-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: TYPE_COLOR[step.type] }}>{step.kind}</p>
                    <p className="text-sm font-display font-bold text-current leading-tight text-balance mb-1">{step.title}</p>
                    <p className="text-[11px] text-current opacity-50 mb-auto truncate">{step.meta}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {step.type === "task" && <button onClick={complete} className="flex-1 h-8 rounded-lg text-[11px] font-bold transition hover:-translate-y-0.5" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Klaar</button>}
                      {step.type === "approval" && (
                        <>
                          <button onClick={approve} className="flex-1 h-8 rounded-lg text-[11px] font-bold" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Ja</button>
                          <button onClick={reject} className="flex-1 h-8 rounded-lg text-[11px] font-bold border border-current/20 text-current">Nee</button>
                        </>
                      )}
                      {step.type === "event" && <Link to="/agenda" className="flex-1 h-8 rounded-lg text-[11px] font-bold flex items-center justify-center" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Open</Link>}
                      {step.type === "email" && <Link to="/email" className="flex-1 h-8 rounded-lg text-[11px] font-bold flex items-center justify-center" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Open</Link>}
                      <button onClick={skip} className="h-8 px-2 rounded-lg text-[10px] font-bold text-current opacity-50 hover:opacity-100">›</button>
                    </div>
                  </div>
                ) : priorities.length ? (
                  <ol className="space-y-1.5">
                    {priorities.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-base font-display font-bold text-current opacity-30 leading-none">{i + 1}</span>
                        <span className="text-[11px] leading-snug text-current opacity-85">{p}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-[11px] text-current opacity-45">Rustige dag.</p>
                )}
              </div>

              {/* Veranderd */}
              <div className="flex flex-col min-h-0 border-l-2 pl-3" style={{ borderColor: "hsl(var(--smoke) / 0.4)" }}>
                <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-current opacity-55 mb-2">Veranderd</p>
                {changed.length ? (
                  <ul className="space-y-1.5">
                    {changed.map((c) => (
                      <li key={c.id} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: srcDot(c) }} />
                        <span className="text-[11px] leading-snug text-current opacity-80 line-clamp-2">{changedLabel(c)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-current opacity-45">Niets nieuws (24u).</p>
                )}
              </div>

              {/* Wacht op jou */}
              <div className="flex flex-col min-h-0 border-l-2 pl-3" style={{ borderColor: "hsl(var(--olive) / 0.5)" }}>
                <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-current opacity-55 mb-2">Wacht op jou</p>
                <div className="space-y-2">
                  <Link to="/approvals" className="flex items-baseline justify-between hover:opacity-100">
                    <span className="text-[11px] text-current opacity-75">Goedkeuringen</span>
                    <span className="text-2xl font-display font-bold text-current tabular-nums leading-none">{waiting.approvals}</span>
                  </Link>
                  <Link to="/email" className="flex items-baseline justify-between">
                    <span className="text-[11px] text-current opacity-75">Email</span>
                    <span className="text-2xl font-display font-bold text-current tabular-nums leading-none">{waiting.emails}</span>
                  </Link>
                  <Link to="/whatsapp" className="flex items-baseline justify-between">
                    <span className="text-[11px] text-current opacity-75">WhatsApp</span>
                    <span className="text-2xl font-display font-bold text-current tabular-nums leading-none">{waiting.whatsapp}</span>
                  </Link>
                </div>
              </div>
            </div>

            {steps.length > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-current/10">
                <button onClick={prev} className="h-7 w-7 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center hover:bg-current/5" aria-label="Vorige">‹</button>
                <span className="text-[10px] uppercase tracking-wider text-current opacity-40 font-semibold">stap {index + 1} van {steps.length}</span>
                <button onClick={next} className="h-7 w-7 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center hover:bg-current/5" aria-label="Volgende">›</button>
              </div>
            )}
          </>
        )}
      </div>
    </WidgetShell>
  );
}