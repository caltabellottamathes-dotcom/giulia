import React, { useState, useMemo } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Sparkles, Phone, ArrowRight, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const INTRO_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";

/**
 * GiuliaWidget — the day's conductor. A compact step-through of today's
 * priorities. Tap the day-overview card to play Giulia's vertical intro video
 * in a popup.
 */
export default function GiuliaWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("Event", { sort: "start" });
  const { data: tasks } = useEntityList("Task");
  const { data: approvals } = useEntityList("Approval", { filter: { status: "pending" } });
  const { data: emails } = useEntityList("Email", { filter: { folder: "inbox" } });

  const [showVideo, setShowVideo] = useState(false);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState({});

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

  const next = () => {
    if (step) setDone((d) => ({ ...d, [step.id]: true }));
    setCurrent((c) => Math.min(c + 1, Math.max(total - 1, 0)));
  };
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <>
      <WidgetShell size="2x2" radius="large" glass="opaque" className="min-h-[460px]">
        <div className="p-5 lg:p-6 flex flex-col h-full">
          <WidgetHeader icon={Sparkles} label="Giulia · je dag" count={total ? `${doneCount}/${total} klaar` : "leeg"} />

          {/* Day overview — click to play the vertical intro video */}
          <button
            onClick={() => setShowVideo(true)}
            className="relative rounded-2xl overflow-hidden mb-4 aspect-video bg-charcoal group text-left w-full"
          >
            <video src={INTRO_VIDEO} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-11 w-11 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Play className="h-4 w-4 ml-0.5 fill-current" />
              </span>
            </div>
            <div className="absolute bottom-2.5 left-3 text-ivory">
              <p className="text-[9px] uppercase tracking-[0.24em] opacity-75 font-semibold">Giulia · video</p>
              <p className="text-[13px] font-semibold leading-tight">Je dagoverzicht</p>
            </div>
          </button>

          {step ? (
            <>
              <div className="flex items-center gap-1.5 mb-4">
                {steps.map((st, i) => (
                  <button
                    key={st.id}
                    onClick={() => setCurrent(i)}
                    className={cn("h-1.5 flex-1 rounded-full transition-all", i === current ? "bg-olive" : done[st.id] ? "bg-olive/40" : "bg-foreground/15")}
                    aria-label={`Stap ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="h-9 w-9 rounded-xl bg-olive text-ivory flex items-center justify-center font-semibold text-sm shrink-0">{current + 1}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-olive font-semibold">{step.kind}</span>
                </div>
                <p className="text-base font-semibold text-foreground leading-tight">{step.title}</p>
                {step.sub && <p className="text-xs text-foreground/55 mt-1.5">{step.sub}</p>}
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => openModule(step.module)} className="flex-1 rounded-xl bg-olive/15 border border-olive/30 text-olive py-2.5 text-xs font-semibold hover:bg-olive/25 transition">Openen</button>
                <button onClick={prev} disabled={current === 0} className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center disabled:opacity-30 transition" aria-label="Vorige">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
                <button onClick={next} className="h-10 w-10 rounded-xl bg-olive text-ivory flex items-center justify-center hover:bg-olive/90 transition" aria-label="Volgende">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="h-12 w-12 rounded-full bg-olive/15 flex items-center justify-center mb-3"><Check className="h-6 w-6 text-olive" /></span>
              <p className="text-sm font-semibold text-foreground">Alles is geregeld</p>
              <p className="text-xs text-foreground/50 mt-1">Geen open punten voor vandaag</p>
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-4 border-t border-foreground/10">
            <button onClick={() => openModule("chat")} className="flex-1 rounded-xl glass-1 py-2.5 text-xs font-semibold hover:bg-foreground/5 transition">Chat</button>
            <button onClick={() => openModule("voice")} className="flex-1 rounded-xl bg-olive text-ivory py-2.5 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-olive/90 transition">
              <Phone className="h-3.5 w-3.5" /> Bel Giulia
            </button>
          </div>
        </div>
      </WidgetShell>

      {/* Vertical intro video popup */}
      <FloatingPanel open={showVideo} onClose={() => setShowVideo(false)} position="center" level={4} showOverlay>
        <div className="relative aspect-video w-[min(86vw,820px)] rounded-[24px] overflow-hidden bg-charcoal">
          <video src={INTRO_VIDEO} autoPlay controls playsInline loop className="h-full w-full object-cover" />
        </div>
      </FloatingPanel>
    </>
  );
}