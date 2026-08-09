import React, { useState, useEffect } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { Sparkles, AlertCircle, Calendar, Mail, ClipboardCheck, CheckCircle2, X } from "lucide-react";

const INTRO_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";

/**
 * GiuliaWidget — "je dag": a graphic, step-by-step overview of the most urgent
 * to-do's, telling Salvo what to do next in order. On load, Giulia's intro
 * video plays ONCE fully vertical over the widget, then disappears to reveal
 * the steps. No chat here — the concierge chat lives in its own floating window.
 */
export default function GiuliaWidget() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [tasks, events, approvals, emails] = await Promise.all([
        base44.entities.Task.list().catch(() => []),
        base44.entities.Event.list().catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
        base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      ]);
      if (!mounted) return;

      const todayStr = new Date().toLocaleDateString("sv-SE");
      const s = [];

      tasks
        .filter((t) => t.status === "overdue")
        .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
        .slice(0, 2)
        .forEach((t) =>
          s.push({ id: t.id, icon: AlertCircle, tone: "overdue", title: t.title, meta: t.deadline ? `Te laat · ${t.deadline}` : "Te laat" })
        );

      events
        .filter((e) => (e.start || "").slice(0, 10) === todayStr)
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 2)
        .forEach((e) =>
          s.push({ id: e.id, icon: Calendar, tone: "event", title: e.title, meta: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) })
        );

      tasks
        .filter((t) => t.status === "today")
        .slice(0, 2)
        .forEach((t) =>
          s.push({ id: t.id, icon: CheckCircle2, tone: "today", title: t.title, meta: t.deadline ? `Vandaag · ${t.deadline}` : "Vandaag" })
        );

      emails.slice(0, 1).forEach((m) =>
        s.push({ id: m.id, icon: Mail, tone: "email", title: m.subject || "Ongelezen email", meta: m.sender ? `Van ${m.sender}` : "Inbox" })
      );

      approvals.slice(0, 1).forEach((a) =>
        s.push({ id: a.id, icon: ClipboardCheck, tone: "approval", title: a.description || a.action_type || "Goedkeuring", meta: "Wacht op jou" })
      );

      setSteps(s.slice(0, 6));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <WidgetShell size="2x2" radius="large" glass="opaque" className="min-h-[520px]">
      {/* Intro video — plays once vertically over the widget, then disappears */}
      {showVideo && (
        <div className="absolute inset-0 z-30 bg-charcoal flex items-center justify-center overflow-hidden">
          <video
            src={INTRO_VIDEO}
            autoPlay
            muted
            playsInline
            onEnded={() => setShowVideo(false)}
            className="h-full w-full object-contain"
          />
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-3 left-3 z-10 h-8 w-8 rounded-lg bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
            aria-label="Video overslaan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative p-5 lg:p-6 flex flex-col h-full">
        <WidgetHeader icon={Sparkles} label="Giulia · je dag" />

        <div className="mb-4">
          <p className="text-sm font-display font-semibold text-ivory leading-tight">
            {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="text-[11px] text-ivory/55 mt-1">
            {loading ? "Giulia stelt je dag samen…" : steps.length ? `${steps.length} stappen vandaag — op volgorde` : "Vandaag is leeg. Geniet ervan."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2.5">
          {loading ? (
            [0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-2xl bg-ivory/5 shimmer" />)
          ) : steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <CheckCircle2 className="h-8 w-8 text-ivory/40 mb-2" />
              <p className="text-sm text-ivory/70">Niets dringends vandaag.</p>
            </div>
          ) : (
            steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-ivory/5 border border-ivory/10 px-3.5 py-3">
                <span
                  className={cn(
                    "shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-semibold border",
                    s.tone === "overdue" ? "bg-red-500/15 border-red-500/40 text-red-400" : "bg-ivory/10 border-ivory/20 text-ivory/80"
                  )}
                >
                  {i + 1}
                </span>
                <s.icon className={cn("h-4 w-4 shrink-0", s.tone === "overdue" ? "text-red-400" : "text-ivory/60")} strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ivory truncate">{s.title}</p>
                  <p className="text-[11px] text-ivory/45 mt-0.5">{s.meta}</p>
                </div>
                {i === 0 && <span className="text-[10px] uppercase tracking-wider text-olive font-semibold shrink-0">Volgende</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetShell>
  );
}