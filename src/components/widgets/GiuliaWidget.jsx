import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

/**
 * GiuliaWidget — "je dag": one bold, color-coded step at a time. Each kind
 * (task / event / approval / email) has its own graphic color used as a
 * left bar, number chip and action button, so the queue reads at a glance.
 * Segmented progress bar colors per step; current step is the focus, the
 * rest sit as quiet color-coded rows.
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
    events.filter((e) => (e.start || "").slice(0, 10) === todayStr).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 3)
      .forEach((e) => s.push({ id: e.id, type: "event", kind: "Vandaag", title: e.title, meta: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) + (e.location ? " · " + e.location : "") }));
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

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[340px]">
      <div className="relative p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] uppercase tracking-[0.26em] font-bold text-current opacity-80">Je dag</h3>
          <span className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{steps.length ? `${index + 1}/${steps.length}` : "0"}</span>
        </div>

        <div className="flex gap-1 mb-5">
          {steps.length ? steps.map((s, i) => (
            <span key={s.id} className="h-1.5 flex-1 rounded-full transition-all duration-500" style={{ background: TYPE_COLOR[s.type], opacity: i <= index ? 1 : 0.22 }} />
          )) : <span className="h-1.5 flex-1 rounded-full bg-current/10" />}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : !step ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
              <span className="text-2xl font-display font-bold">✓</span>
            </div>
            <p className="text-lg font-display font-bold text-current">Niets dringends</p>
            <p className="text-xs text-current opacity-50 mt-1">Je dag is rustig.</p>
          </div>
        ) : (
          <>
            <div className="relative rounded-2xl border border-current/10 p-4 mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: TYPE_COLOR[step.type] }} />
              <div className="flex items-center gap-2.5 mb-3 pl-2">
                <span className="h-7 w-7 rounded-lg flex items-center justify-center text-sm font-display font-bold shrink-0" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>{index + 1}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: TYPE_COLOR[step.type] }}>{step.kind}</span>
              </div>
              <p className="text-xl font-display font-bold text-current leading-tight text-balance pl-2 mb-1">{step.title}</p>
              <p className="text-xs text-current opacity-55 pl-2 mb-4">{step.meta}</p>
              <div className="flex items-center gap-2 pl-2">
                {step.type === "task" && <button onClick={complete} className="flex-1 h-11 rounded-xl font-bold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Voltooien</button>}
                {step.type === "approval" && (
                  <>
                    <button onClick={approve} className="flex-1 h-11 rounded-xl font-bold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Goedkeuren</button>
                    <button onClick={reject} className="flex-1 h-11 rounded-xl font-bold text-sm border border-current/20 text-current transition hover:bg-current/5">Afwijzen</button>
                  </>
                )}
                {step.type === "event" && <Link to="/agenda" className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Bekijk</Link>}
                {step.type === "email" && <Link to="/email" className="flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: TYPE_COLOR[step.type], color: TYPE_ON[step.type] }}>Openen</Link>}
                <button onClick={skip} className="h-11 px-4 rounded-xl font-bold text-sm text-current opacity-60 hover:opacity-100 transition">Later</button>
              </div>
            </div>

            {steps.length > 1 && (
              <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
                {steps.map((s, i) => (i === index ? null : (
                  <button key={s.id} onClick={() => setIndex(i)} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-current/5">
                    <span className="h-6 w-1 rounded-full shrink-0" style={{ background: TYPE_COLOR[s.type] }} />
                    <span className="text-[9px] uppercase tracking-wider font-bold w-14 shrink-0" style={{ color: TYPE_COLOR[s.type] }}>{s.kind}</span>
                    <span className="text-sm text-current opacity-75 truncate flex-1">{s.title}</span>
                  </button>
                ))).slice(0, 3)}
              </div>
            )}
          </>
        )}

        {steps.length > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
            <button onClick={prev} className="h-8 w-8 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center transition hover:bg-current/5" aria-label="Vorige">‹</button>
            <span className="text-[10px] uppercase tracking-wider text-current opacity-40 font-semibold">stap {index + 1} van {steps.length}</span>
            <button onClick={next} className="h-8 w-8 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center transition hover:bg-current/5" aria-label="Volgende">›</button>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}