import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import {
  Calendar, CheckSquare, Mail, MessageCircle, Briefcase, ClipboardCheck, Sparkles,
} from "lucide-react";

/**
 * MobileHome — an iOS-home-screen take on GIULIA.
 * Layered wallpaper + large title + a swipeable "Vandaag" strip of priority
 * cards + a 2-column grid of glanceable widget tiles. Calm, native, in-brand.
 */
const ACCENT = {
  olive: "text-olive",
  sand: "text-sand",
  ridge: "text-ridge",
  powder: "text-powder",
  steel: "text-steel",
};
const DOT = {
  olive: "bg-olive", sand: "bg-sand", ridge: "bg-ridge", powder: "bg-powder", steel: "bg-steel",
};

const TILES = [
  { key: "agenda", label: "Agenda", icon: Calendar, accent: "olive" },
  { key: "tasks", label: "Taken", icon: CheckSquare, accent: "sand" },
  { key: "email", label: "Email", icon: Mail, accent: "ridge" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, accent: "olive" },
  { key: "projects", label: "Projecten", icon: Briefcase, accent: "steel" },
  { key: "approvals", label: "Wacht", icon: ClipboardCheck, accent: "sand" },
];

const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—");

export default function MobileHome() {
  const { openModule } = usePanel();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Event.list("start").catch(() => []),
      base44.entities.Task.list().catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
      base44.entities.Project.filter({ status: "in_progress" }).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([events, tasks, approvals, emails, wa, projects, user]) => {
      if (!alive) return;
      const now = new Date();
      const todayStr = new Date().toDateString();
      const todayEvents = events.filter((e) => e.start && new Date(e.start).toDateString() === todayStr);
      const nextEvent = events.find((e) => e.start && new Date(e.start) >= now) || todayEvents[0];
      const todayTasks = tasks.filter((t) => t.status === "today" || t.status === "overdue" || t.status === "in_progress");
      const overdue = tasks.filter((t) => t.status === "overdue").length;
      setData({
        nextEvent, todayEvents, todayTasks, overdue,
        emailUnread: emails.length, emailLatest: emails[0],
        waUnread: wa.length,
        approvals: approvals.length,
        projects, topProject: projects[0],
        user,
      });
    });
    return () => { alive = false; };
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const rawFirst = data?.user?.full_name ? data.user.full_name.split(" ")[0] : "";
  const name = rawFirst === "Salvatore" ? "Salvo" : rawFirst || "Salvo";

  const priorities = [];
  if (data) {
    (data.todayEvents || []).forEach((e) => priorities.push({ kind: "Afspraak", title: e.title, time: e.start, accent: "olive" }));
    (data.todayTasks || []).forEach((t) => priorities.push({ kind: "Taak", title: t.title, time: t.deadline, accent: "sand" }));
    priorities.sort((a, b) => (a.time ? new Date(a.time).getTime() : Infinity) - (b.time ? new Date(b.time).getTime() : Infinity));
  }
  const top = priorities.slice(0, 4);

  const tileData = {
    agenda: data?.nextEvent
      ? { primary: data.nextEvent.title || "Afspraak", sub: fmtTime(data.nextEvent.start), count: data.todayEvents.length }
      : { primary: "Vrij vandaag", sub: "niks gepland", count: 0 },
    tasks: { primary: `${data?.todayTasks.length || 0} vandaag`, sub: data?.overdue ? `${data.overdue} te laat` : "niet dringend", count: data?.todayTasks.length || 0 },
    email: { primary: `${data?.emailUnread || 0} ongelezen`, sub: data?.emailLatest?.sender || "inbox leeg", count: data?.emailUnread || 0 },
    whatsapp: { primary: `${data?.waUnread || 0} nieuw`, sub: "whatsapp", count: data?.waUnread || 0 },
    projects: { primary: `${data?.projects?.length || 0} actief`, sub: data?.topProject?.title || "—", count: data?.projects?.length || 0 },
    approvals: { primary: `${data?.approvals || 0} wacht`, sub: "jouw goedkeuring", count: data?.approvals || 0 },
  };

  const cards = top.length ? top : [{ kind: "Vandaag", title: "Je dag is open — niks dringends.", time: null, accent: "olive" }];

  return (
    <div className="lg:hidden relative min-h-[calc(100svh-3.5rem)]">
      {/* Wallpaper layer — soft, blurred editorial photo behind everything */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover scale-110" style={{ filter: "blur(3px)" }} draggable={false} />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/55 to-background/78" />
      </div>

      <div className="relative px-4 pt-5 pb-8">
        {/* Large title */}
        <p className="text-[11px] uppercase tracking-[0.24em] text-foreground/55 font-semibold mb-1.5">
          {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-[32px] font-display font-semibold tracking-[-0.02em] leading-[1.05] text-foreground">
          {greet}, {name}.
        </h1>
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full glass-1 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-olive" />
          <span className="text-[11px] font-medium text-foreground/70">Giulia houdt je dag in de gaten</span>
        </div>

        {/* Swipeable "Vandaag" strip */}
        <div className="mt-6 -mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-3 pb-3">
          {cards.map((p, i) => (
            <div key={i} className="snap-center shrink-0 w-[76%] glass-2 rounded-[22px] p-5 min-h-[134px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/55 font-medium">{p.kind}</span>
                <span className={`h-2 w-2 rounded-full ${DOT[p.accent]}`} />
              </div>
              <div>
                <p className="text-[15px] font-display font-medium leading-snug line-clamp-2 text-foreground">{p.title}</p>
                <p className="text-[11px] text-foreground/50 mt-1">{p.time ? fmtTime(p.time) : "vandaag"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Widget grid */}
        <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/55 font-semibold mt-3 mb-2.5">Widgets</p>
        <div className="grid grid-cols-2 gap-3">
          {TILES.map((t) => {
            const td = tileData[t.key];
            return (
              <button
                key={t.key}
                onClick={() => openModule(t.key)}
                className="text-left glass-1 rounded-[22px] p-4 min-h-[118px] flex flex-col justify-between hover:bg-foreground/[0.04] active:scale-[0.97] transition"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-foreground/55 font-medium">
                    <t.icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                    {t.label}
                  </span>
                  {td.count > 0 && <span className={`text-[11px] font-semibold ${ACCENT[t.accent]}`}>{td.count}</span>}
                </div>
                <div>
                  <p className="text-[16px] font-display font-medium leading-tight line-clamp-1 text-foreground">{td.primary}</p>
                  <p className="text-[11px] text-foreground/45 line-clamp-1 mt-0.5">{td.sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Giulia CTA */}
        <button
          onClick={() => openModule("chat")}
          className="mt-3 w-full text-left glass-2 rounded-[24px] p-4 flex items-center gap-4 active:scale-[0.98] transition"
        >
          <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 ring-1 ring-white/30">
            <img src={IMAGES.portraitBootFace} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/55 font-medium">Giulia</p>
            <p className="text-[15px] font-display font-medium leading-tight text-foreground truncate">Praat met je assistent</p>
          </div>
          <span className="text-[11px] text-olive font-semibold shrink-0">Open →</span>
        </button>
      </div>
    </div>
  );
}