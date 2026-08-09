import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { Link } from "react-router-dom";

/**
 * GiuliaWidget — "je dag": one focused step at a time, with a calm queue of
 * what's coming next. Intuitive hierarchy: the current item gets a clear
 * primary action, upcoming items sit as quiet rows, progress runs along the
 * top. All colors use currentColor + tile accent so it reads on every tile.
 */
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
      .forEach((t) => s.push({ id: t.id, type: "task", tone: "overdue", kind: "Te laat", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Geen deadline" }));
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

  const progress = steps.length ? (index / steps.length) * 100 : 0;

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[340px]">
      <div className="relative p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-current opacity-55">Giulia · je dag</h3>
          <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-current opacity-40 tabular-nums">{steps.length ? `${index + 1}/${steps.length}` : ""}</span>
        </div>

        <div className="h-1 rounded-full bg-current/10 overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--tile-accent)" }} />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : !step ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl overflow-hidden mb-4 float-shadow shrink-0">
              <img src={IMAGES.bootPhone} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="text-base font-display font-semibold text-current">Niets dringends vandaag</p>
            <p className="text-xs text-current opacity-50 mt-1">Je dag is rustig — Giulia houdt de wacht.</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-current/[0.06] border border-current/10 p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: step.tone === "overdue" ? "var(--tile-accent)" : "currentColor", opacity: step.tone === "overdue" ? 1 : 0.5 }} />
                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-current opacity-55">{step.kind}</span>
              </div>
              <p className="text-lg font-display font-semibold text-current leading-tight text-balance mb-1">{step.title}</p>
              <p className="text-xs text-current opacity-50 mb-4">{step.meta}</p>
              <div className="flex items-center gap-2">
                {step.type === "task" && (
                  <button onClick={complete} className="flex-1 h-11 rounded-xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Voltooien</button>
                )}
                {step.type === "approval" && (
                  <>
                    <button onClick={approve} className="flex-1 h-11 rounded-xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Goedkeuren</button>
                    <button onClick={reject} className="flex-1 h-11 rounded-xl font-semibold text-sm border border-current/15 text-current transition hover:bg-current/5">Afwijzen</button>
                  </>
                )}
                {step.type === "event" && (
                  <Link to="/agenda" className="flex-1 h-11 rounded-xl font-semibold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Bekijk in agenda</Link>
                )}
                {step.type === "email" && (
                  <Link to="/email" className="flex-1 h-11 rounded-xl font-semibold text-sm flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Openen</Link>
                )}
                <button onClick={skip} className="h-11 px-4 rounded-xl font-medium text-sm text-current opacity-60 hover:opacity-100 transition">Later</button>
              </div>
            </div>

            {steps.length > 1 && (
              <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
                {steps.map((s, i) => i === index ? null : (
                  <button key={s.id} onClick={() => setIndex(i)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-current/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40 shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider text-current opacity-45 w-16 shrink-0">{s.kind}</span>
                    <span className="text-sm text-current opacity-75 truncate flex-1">{s.title}</span>
                  </button>
                )).filter(Boolean).slice(0, 3)}
              </div>
            )}
          </>
        )}

        {steps.length > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
            <button onClick={prev} className="h-8 w-8 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center transition hover:bg-current/5" aria-label="Vorige">‹</button>
            <span className="text-[10px] uppercase tracking-wider text-current opacity-40">stap {index + 1} van {steps.length}</span>
            <button onClick={next} className="h-8 w-8 rounded-full border border-current/15 text-current text-sm leading-none flex items-center justify-center transition hover:bg-current/5" aria-label="Volgende">›</button>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}