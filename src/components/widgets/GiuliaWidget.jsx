import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import GiuliaStepCard from "./GiuliaStepCard";
import BrandPhoto from "./BrandPhoto";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * GiuliaWidget — "je dag": a page-by-page walkthrough of the most urgent
 * items, anchored by a branded portrait on each step.
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
      .forEach((t) => s.push({ id: t.id, type: "task", tone: "overdue", kind: "Te laat", title: t.title, meta: t.deadline ? `Deadline was ${t.deadline}` : "Geen deadline" }));
    events.filter((e) => (e.start || "").slice(0, 10) === todayStr).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 3)
      .forEach((e) => s.push({ id: e.id, type: "event", kind: "Vandaag", title: e.title, meta: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) }));
    tasks.filter((t) => t.status === "today").slice(0, 3)
      .forEach((t) => s.push({ id: t.id, type: "task", kind: "Taak vandaag", title: t.title, meta: t.deadline ? `Deadline ${t.deadline}` : "Vandaag" }));
    emails.slice(0, 2).forEach((m) => s.push({ id: m.id, type: "email", kind: "Ongelezen", title: m.subject || "Email", meta: m.sender ? `Van ${m.sender}` : "Inbox" }));
    approvals.slice(0, 2).forEach((a) => s.push({ id: a.id, type: "approval", kind: "Goedkeuring", title: a.description || a.action_type || "Actie", meta: "Wacht op jou" }));
    setSteps(s.slice(0, 8));
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
    <WidgetShell size="2x2" radius="large" className="min-h-[440px]">
      <div className="relative p-5 lg:p-6 flex flex-col h-full">
        <WidgetHeader label="Giulia · je dag" count={steps.length ? `${index + 1}/${steps.length}` : ""} />
        {steps.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            {steps.map((_, i) => (
              <span key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500", i === index ? "" : "opacity-20")} style={{ background: i === index ? "var(--tile-accent)" : "currentColor" }} />
            ))}
          </div>
        )}
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : !step ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <BrandPhoto src={IMAGES.bootPhone} className="h-24 w-24 rounded-2xl mb-4" overlay="bg-charcoal/35" />
            <p className="text-current font-medium">Niets dringends vandaag.</p>
          </div>
        ) : (
          <GiuliaStepCard step={step} index={index} image={IMAGES.bootPhone} onComplete={complete} onApprove={approve} onReject={reject} onSkip={skip} />
        )}
        {steps.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={prev} className="h-10 w-10 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" aria-label="Vorige">‹</button>
            <button onClick={next} className="h-10 w-10 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95" aria-label="Volgende">›</button>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}