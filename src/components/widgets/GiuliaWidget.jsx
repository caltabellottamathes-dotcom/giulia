import React, { useState, useMemo, useEffect, useRef } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import {
  Sparkles, Phone, ArrowRight, Check, Play,
  Calendar, CheckSquare, ClipboardCheck, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INTRO_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";

/**
 * GiuliaWidget — the day's conductor. The intro video appears FIRST as a
 * full-card overlay; tapping "Begin je dag" (or after a few seconds) reveals
 * the day's content: portrait + greeting, attention stats, a step-through of
 * priorities, and quick actions.
 */
export default function GiuliaWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("Event", { sort: "start" });
  const { data: tasks } = useEntityList("Task");
  const { data: approvals } = useEntityList("Approval", { filter: { status: "pending" } });
  const { data: emails } = useEntityList("Email", { filter: { folder: "inbox" } });

  const [showIntro, setShowIntro] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState({});
  const [userName, setUserName] = useState("");
  const introRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => setUserName(u?.full_name || "")).catch(() => {});
  }, []);
  // Auto-reveal content if the user doesn't interact with the intro
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // Play the intro unmuted; fall back to muted if the browser blocks autoplay
  useEffect(() => {
    const v = introRef.current;
    if (!v || !showIntro) return;
    v.muted = false;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => { v.muted = true; v.play().catch(() => {}); });
    }
  }, [showIntro]);

  const steps = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("sv-SE");
    const s = [];
    events
      .filter((e) => (e.start || "").slice(0, 10) === todayStr)
      .sort((a, b) => (a.start || "").localeCompare(b.start || ""))
      .forEach((e) =>
        s.push({
          id: "ev_" + e.id,
          kind: "Afspraak",
          title: e.title,
          sub: `${new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}${e.location ? " · " + e.location : ""}`,
          module: "agenda",
        })
      );
    tasks.filter((t) => t.status === "overdue").forEach((t) => s.push({ id: "tk_" + t.id, kind: "Achterstallig", title: t.title, sub: "Taak te laat", module: "tasks" }));
    approvals.forEach((a) => s.push({ id: "ap_" + a.id, kind: "Goedkeuring", title: a.description, sub: a.target || "Wacht op jou", module: "approvals" }));
    emails.filter((e) => e.status === "unread" && e.important).slice(0, 2).forEach((e) => s.push({ id: "em_" + e.id, kind: "Belangrijke mail", title: e.subject, sub: e.sender || "", module: "email" }));
    return s.slice(0, 6);
  }, [events, tasks, approvals, emails]);

  const total = steps.length;
  const step = steps[current];
  const doneCount = Object.values(done).filter(Boolean).length;

  const todayEvents = events.filter((e) => (e.start || "").slice(0, 10) === new Date().toLocaleDateString("sv-SE"));
  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  const unreadEmails = emails.filter((e) => e.status === "unread");

  const rawFirst = userName ? userName.split(" ")[0] : "";
  const firstName = rawFirst === "Salvatore" ? "Salvo" : rawFirst || "Salvo";
  const hour = new Date().getHours();
  const greetWord = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  const next = () => {
    if (step) setDone((d) => ({ ...d, [step.id]: true }));
    setCurrent((c) => Math.min(c + 1, Math.max(total - 1, 0)));
  };
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const stats = [
    { icon: Calendar, label: "Afspraken", n: todayEvents.length, module: "agenda" },
    { icon: CheckSquare, label: "Te laat", n: overdueTasks.length, module: "tasks" },
    { icon: ClipboardCheck, label: "Goedkeuring", n: approvals.length, module: "approvals" },
    { icon: Mail, label: "Ongelezen", n: unreadEmails.length, module: "email" },
  ];

  return (
    <>
      <WidgetShell size="2x2" radius="large" glass="opaque" className="min-h-[480px]">
        <div className="relative p-5 lg:p-6 flex flex-col h-full">
          {/* INTRO — the video appears first, before the widget content */}
          {showIntro && (
            <div className="absolute inset-0 z-20 overflow-hidden rounded-[28px] bg-charcoal">
              <video ref={introRef} src={INTRO_VIDEO} loop autoPlay playsInline preload="metadata" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-7 px-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold mb-1.5">Giulia · video</p>
                <p className="text-xl font-display font-semibold text-ivory leading-tight mb-4">Je dagoverzicht</p>
                <button onClick={() => setShowIntro(false)} className="rounded-full bg-sand text-charcoal px-5 py-2.5 text-xs font-semibold hover:bg-ivory transition">
                  Begin je dag
                </button>
                <button onClick={() => setShowIntro(false)} className="mt-2 text-[10px] text-ivory/50 hover:text-ivory/80 transition">
                  Overslaan
                </button>
              </div>
            </div>
          )}

          {/* CONTENT */}
          <WidgetHeader icon={Sparkles} label="Giulia · je dag" count={total ? `${doneCount}/${total} klaar` : "leeg"} />

          {/* Portrait + greeting */}
          <div className="flex items-center gap-3 mb-4">
            <img src={IMAGES.giuliaConcierge} alt="Giulia" className="h-12 w-12 rounded-full object-cover border border-ivory/20 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sand font-semibold">{greetWord}</p>
              <p className="text-lg font-display font-semibold text-ivory leading-none">{firstName}</p>
            </div>
          </div>

          {/* Attention stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map((s) => (
              <button
                key={s.label}
                onClick={() => openModule(s.module)}
                className="rounded-xl bg-ivory/10 border border-ivory/10 p-2 flex flex-col items-center gap-1 hover:bg-ivory/15 transition"
              >
                <s.icon className="h-3.5 w-3.5 text-sand" strokeWidth={1.75} />
                <span className="text-base font-semibold text-ivory leading-none">{s.n}</span>
                <span className="text-[8px] uppercase tracking-wide text-ivory/50">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Step-through */}
          {step ? (
            <>
              <div className="flex items-center gap-1.5 mb-3">
                {steps.map((st, i) => (
                  <button
                    key={st.id}
                    onClick={() => setCurrent(i)}
                    className={cn("h-1.5 flex-1 rounded-full transition-all", i === current ? "bg-olive" : done[st.id] ? "bg-olive/50" : "bg-ivory/20")}
                    aria-label={`Stap ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-8 w-8 rounded-xl bg-olive text-ivory flex items-center justify-center font-semibold text-sm shrink-0">{current + 1}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-sand font-semibold">{step.kind}</span>
                </div>
                <p className="text-sm font-semibold text-ivory leading-tight">{step.title}</p>
                {step.sub && <p className="text-xs text-ivory/60 mt-1.5">{step.sub}</p>}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openModule(step.module)} className="flex-1 rounded-xl bg-olive text-ivory py-2.5 text-xs font-semibold hover:bg-olive/90 transition">Openen</button>
                <button onClick={prev} disabled={current === 0} className="h-9 w-9 rounded-xl bg-ivory/10 border border-ivory/15 text-ivory flex items-center justify-center disabled:opacity-30 transition" aria-label="Vorige">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
                <button onClick={next} className="h-9 w-9 rounded-xl bg-sand text-charcoal flex items-center justify-center hover:bg-ivory transition" aria-label="Volgende">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="h-11 w-11 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center mb-2">
                <Check className="h-5 w-5 text-sand" />
              </span>
              <p className="text-sm font-semibold text-ivory">Alles is geregeld</p>
              <p className="text-xs text-ivory/55 mt-1">Geen open punten voor vandaag</p>
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-4 border-t border-ivory/15">
            <button onClick={() => setShowVideo(true)} className="flex-1 rounded-xl bg-ivory/10 border border-ivory/15 text-ivory py-2.5 text-xs font-semibold hover:bg-ivory/15 transition flex items-center justify-center gap-1.5">
              <Play className="h-3 w-3" /> Video
            </button>
            <button onClick={() => openModule("insights")} className="flex-1 rounded-xl bg-ivory/10 border border-ivory/15 text-ivory py-2.5 text-xs font-semibold hover:bg-ivory/15 transition">
              Inzichten
            </button>
            <button onClick={() => openModule("voice")} className="flex-1 rounded-xl bg-olive text-ivory py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-olive/90 transition">
              <Phone className="h-3 w-3" /> Bel
            </button>
          </div>
        </div>
      </WidgetShell>

      {/* Full video popup */}
      <FloatingPanel open={showVideo} onClose={() => setShowVideo(false)} position="center" level={4} showOverlay>
        <div className="relative aspect-video w-[min(86vw,820px)] rounded-[24px] overflow-hidden bg-charcoal">
          <video src={INTRO_VIDEO} autoPlay controls playsInline loop className="h-full w-full object-cover" />
        </div>
      </FloatingPanel>
    </>
  );
}