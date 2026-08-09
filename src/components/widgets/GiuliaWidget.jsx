import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import GiuliaStepCard from "./GiuliaStepCard";
import { base44 } from "@/api/base44Client";
import { Sparkles, AlertCircle, Calendar, Mail, ClipboardCheck, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * GiuliaWidget — "je dag": an interactive, page-by-page walkthrough of the
 * most urgent items. One big clear step at a time with big action buttons.
 * No chat, no video here — those live in their own components.
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

    tasks
      .filter((t) => t.status === "overdue")
      .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
      .slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", icon: AlertCircle, tone: "overdue", kind: "Te laat", title: t.title, meta: t.deadline ? `Deadline was ${t.deadline}` : "Geen deadline" }));

    events
      .filter((e) => (e.start || "").slice(0, 10) === todayStr)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 3)
      .forEach((e) => s.push({ id: e.id, type: "event", icon: Calendar, kind: "Vandaag", title: e.title, meta: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) }));

    tasks
      .filter((t) => t.status === "today")
      .slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", icon: CheckCircle2, kind: "Taak vandaag", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Vandaag" }));

    emails.slice(0, 2).forEach((m) => s.push({ id: m.id, type: "email", icon: Mail, kind: "Ongelezen", title: m.subject || "Email", meta: m.sender ? `Van ${m.sender}` : "Inbox" }));

    approvals.slice(0, 2).forEach((a) => s.push({ id: a.id, type: "approval", icon: ClipboardCheck, kind: "Goedkeuring", title: a.description || a.action_type || "Actie", meta: "Wacht op jou" }));

    setSteps(s.slice(0, 8));
    setIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const step = steps[index];

  const complete = async () => {
    if (!step) return;
    try { await base44.entities.Task.update(step.id, { status: "completed" }); } catch {}
    load();
  };
  const approve = async () => {
    if (!step) return;
    try { await base44.entities.Approval.update(step.id, { status: "approved" }); } catch {}
    load();
  };
  const reject = async () => {
    if (!step) return;
    try { await base44.entities.Approval.update(step.id, { status: "rejected" }); } catch {}
    load();
  };
  const skip = () => setIndex((i) => (i + 1 < steps.length ? i + 1 : 0));
  const prev = () => setIndex((i) => (i > 0 ? i - 1 : steps.length - 1));
  const next = () => setIndex((i) => (i + 1 < steps.length ? i + 1 : 0));

  return (
    <WidgetShell size="2x2" radius="large" glass="opaque" className="min-h-[440px]">
      <div className="relative p-5 lg:p-6 flex flex-col h-full">
        <WidgetHeader icon={Sparkles} label="Giulia · je dag" count={steps.length ? `${index + 1}/${steps.length}` : ""} />

        {steps.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {steps.map((_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i === index ? "bg-olive" : "bg-ivory/15"}`} />
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
          </div>
        ) : !step ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-10 w-10 text-ivory/40 mb-3" />
            <p className="text-ivory/70 font-medium">Niets dringends vandaag.</p>
          </div>
        ) : (
          <GiuliaStepCard step={step} onComplete={complete} onApprove={approve} onReject={reject} onSkip={skip} />
        )}

        {steps.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={prev} className="h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition" aria-label="Vorige">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} className="h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition" aria-label="Volgende">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}