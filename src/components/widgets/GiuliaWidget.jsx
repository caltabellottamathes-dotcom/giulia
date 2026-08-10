import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

/**
 * GiuliaWidget — "je dag", redesigned.
 * One dominant graphic: a full day-ring plotting today's events as colour-coded
 * dots with a "now" marker. In its centre: a bold number of things waiting on
 * you. Below: the next action card + a tiny waiting legend.
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

const ringAngle = (date) => {
  const h = (date.getHours() + date.getMinutes() / 60) % 24;
  return (2 * Math.PI * h) / 24 - Math.PI / 2;
};
const ringPt = (date, r = 42) => {
  const a = ringAngle(date);
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
};

export default function GiuliaWidget() {
  const [steps, setSteps] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [waiting, setWaiting] = useState({ approvals: 0, emails: 0, whatsapp: 0 });
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const load = useCallback(async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    const [tasks, events, approvals, emails, plans, wa] = await Promise.all([
      base44.entities.Task.list().catch(() => []),
      base44.entities.Event.list().catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
      base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
    ]);
    const s = [];
    tasks.filter((t) => t.status === "overdue").sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0)).slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", kind: "Te laat", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Geen deadline" }));
    events.filter((e) => (e.start || "").slice(0, 10) === today).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 6)
      .forEach((e) => s.push({ id: e.id, type: "event", kind: "Vandaag", title: e.title, start: e.start, meta: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) + (e.location ? " · " + e.location : "") }));
    tasks.filter((t) => t.status === "today").slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", kind: "Taak vandaag", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Vandaag" }));
    emails.slice(0, 2).forEach((m) => s.push({ id: m.id, type: "email", kind: "Ongelezen", title: m.subject || "Email", meta: m.sender ? `Van ${m.sender}` : "Inbox" }));
    approvals.slice(0, 2).forEach((a) => s.push({ id: a.id, type: "approval", kind: "Goedkeuring", title: a.description || a.action_type || "Actie", meta: "Wacht op jou" }));
    setSteps(s.slice(0, 7));
    setIndex(0);
    setPriorities((plans[0]?.priorities || []).slice(0, 3));
    setWaiting({ approvals: approvals.length, emails: emails.length, whatsapp: wa.length });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const step = steps[index];
  const total = waiting.approvals + waiting.emails + waiting.whatsapp;
  const complete = async () => { if (!step) return; try { await base44.entities.Task.update(step.id, { status: "completed" }); } catch {} load(); };
  const approve = async () => { if (!step) return; try { await base44.entities.Approval.update(step.id, { status: "approved" }); } catch {} load(); };
  const reject = async () => { if (!step) return; try { await base44.entities.Approval.update(step.id, { status: "rejected" }); } catch {} load(); };
  const skip = () => setIndex((i) => (i + 1 < steps.length ? i + 1 : 0));
  const dateStr = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  const now = ringPt(new Date());
  const nowInner = ringPt(new Date(), 30);
  const arcEvents = steps.filter((s) => s.type === "event" && s.start);

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[400px]">
      <div className="relative p-5 lg:p-6 flex flex-col h-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-current opacity-55 mb-1">Giulia · je dag</p>
                <p className="text-xs text-current opacity-45 truncate">{dateStr}</p>
              </div>
              {steps.length > 0 && (
                <span className="text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{index + 1}/{steps.length}</span>
              )}
            </div>

            {/* Hero — full day-ring with bold centre number */}
            <div className="relative flex-1 flex items-center justify-center min-h-0 my-1">
              <svg viewBox="0 0 100 100" className="w-full max-w-[230px] aspect-square">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-15" />
                {[0, 6, 12, 18].map((h) => {
                  const a = (2 * Math.PI * h) / 24 - Math.PI / 2;
                  return <line key={h} x1={50 + 38 * Math.cos(a)} y1={50 + 38 * Math.sin(a)} x2={50 + 42 * Math.cos(a)} y2={50 + 42 * Math.sin(a)} stroke="currentColor" strokeWidth="0.6" className="opacity-25" />;
                })}
                <line x1={nowInner.x} y1={nowInner.y} x2={now.x} y2={now.y} stroke="var(--tile-accent)" strokeWidth="0.9" opacity="0.75" />
                <circle cx={now.x} cy={now.y} r="1.7" fill="var(--tile-accent)" />
                {arcEvents.map((s) => {
                  const p = ringPt(new Date(s.start));
                  const isCur = step?.id === s.id;
                  return <circle key={s.id} cx={p.x} cy={p.y} r={isCur ? 3 : 2.2} fill={TYPE_COLOR.event} stroke="currentColor" strokeWidth={isCur ? 0.6 : 0} strokeOpacity={0.3} />;
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[44px] leading-none font-display font-bold tabular-nums text-current">{total}</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-current opacity-55 mt-1">wachten op jou</span>
              </div>
            </div>

            {/* Next action */}
            {step ? (
              <div className="mt-2 rounded-2xl border border-current/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-0.5" style={{ color: TYPE_COLOR[step.type] }}>{step.kind}</p>
                    <p className="text-sm font-display font-semibold text-current leading-tight truncate">{step.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {step.type === "task" && <button onClick={complete} className="h-8 px-3 rounded-lg text-[11px] font-bold transition hover:-translate-y-0.5" style={{ background: TYPE_COLOR.task, color: TYPE_ON.task }}>Klaar</button>}
                    {step.type === "approval" && (
                      <>
                        <button onClick={approve} className="h-8 px-3 rounded-lg text-[11px] font-bold" style={{ background: TYPE_COLOR.approval, color: TYPE_ON.approval }}>Ja</button>
                        <button onClick={reject} className="h-8 px-3 rounded-lg text-[11px] font-bold border border-current/20 text-current">Nee</button>
                      </>
                    )}
                    {step.type === "event" && <Link to="/agenda" className="h-8 px-3 rounded-lg text-[11px] font-bold flex items-center" style={{ background: TYPE_COLOR.event, color: TYPE_ON.event }}>Open</Link>}
                    {step.type === "email" && <Link to="/email" className="h-8 px-3 rounded-lg text-[11px] font-bold flex items-center" style={{ background: TYPE_COLOR.email, color: TYPE_ON.email }}>Open</Link>}
                    <button onClick={skip} className="h-8 w-8 rounded-lg text-current opacity-50 hover:opacity-100 border border-current/10" aria-label="Volgende">›</button>
                  </div>
                </div>
              </div>
            ) : priorities.length ? (
              <div className="mt-2 rounded-2xl border border-current/10 p-3">
                <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-current opacity-55 mb-1.5">Prioriteiten vandaag</p>
                <ol className="space-y-1">
                  {priorities.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sm font-display font-bold text-current opacity-30 leading-none">{i + 1}</span>
                      <span className="text-[11px] leading-snug text-current opacity-85">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-current opacity-45 text-center">Rustige dag.</p>
            )}

            {/* Waiting legend */}
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-current opacity-65">
              <Link to="/approvals" className="flex items-center gap-1.5 hover:opacity-100"><span className="h-1.5 w-1.5 rounded-full" style={{ background: TYPE_COLOR.approval }} /><b className="tabular-nums">{waiting.approvals}</b> Goedkeuringen</Link>
              <Link to="/email" className="flex items-center gap-1.5 hover:opacity-100"><span className="h-1.5 w-1.5 rounded-full" style={{ background: TYPE_COLOR.email }} /><b className="tabular-nums">{waiting.emails}</b> Email</Link>
              <Link to="/whatsapp" className="flex items-center gap-1.5 hover:opacity-100"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--sand))" }} /><b className="tabular-nums">{waiting.whatsapp}</b> WhatsApp</Link>
            </div>
          </>
        )}
      </div>
    </WidgetShell>
  );
}