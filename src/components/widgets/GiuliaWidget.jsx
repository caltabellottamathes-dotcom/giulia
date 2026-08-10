import React, { useState, useEffect, useCallback } from "react";
import WidgetShell from "./WidgetShell";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const GIULIA_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";

const greetingWord = () => {
  const h = new Date().getHours();
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
};

const ringAngle = (date) => {
  const h = (date.getHours() + date.getMinutes() / 60) % 24;
  return (2 * Math.PI * h) / 24 - Math.PI / 2;
};
const ringPt = (date, r = 40) => {
  const a = ringAngle(date);
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
};
const RING_C = 2 * Math.PI * 40;

/**
 * GiuliaWidget — "Je dag". Bold graphical tile: a vertical Giulia video on the
 * left, and a motion day-ring infographic on the right with the things that
 * matter today. Pulls today's DailyPlan; synthesises a plan from the live
 * situation when none exists. Expandable to the full time-block context.
 */
export default function GiuliaWidget() {
  const [priorities, setPriorities] = useState([]);
  const [summary, setSummary] = useState("");
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [updated, setUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    const [plans, tasks, events, emails, approvals] = await Promise.all([
      base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
      base44.entities.Task.list().catch(() => []),
      base44.entities.Event.list().catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
    ]);
    const p = plans[0];
    if (p && (p.priorities?.length || p.plan_data?.summary)) {
      setPriorities((p.priorities || []).slice(0, 3));
      setSummary(p.plan_data?.summary || "Ik heb je dag heringericht op wat veranderd is.");
      setTimeBlocks(Array.isArray(p.plan_data?.plan) ? p.plan_data.plan : []);
      setUpdated(p.last_updated || p.updated_date || null);
    } else {
      const todayEvents = events
        .filter((e) => (e.start || "").slice(0, 10) === today)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      const overdue = tasks
        .filter((t) => t.status === "overdue")
        .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
      const todayTasks = tasks.filter((t) => t.status === "today");
      const prio = [];
      overdue.slice(0, 2).forEach((t) => prio.push(`Afronden — ${t.title}`));
      todayEvents.slice(0, 1).forEach((e) => prio.push(`Voorbereiden — ${e.title}`));
      todayTasks.slice(0, 2).forEach((t) => prio.push(t.title));
      if (emails.length && prio.length < 3) prio.push(`${emails.length} belangrijke berichten beantwoorden`);
      if (approvals.length && prio.length < 3) prio.push(`${approvals.length} goedkeuringen afhandelen`);
      setPriorities(prio.slice(0, 3));
      setSummary("Ik heb je dag opgebouwd op basis van wat er nu speelt.");
      setTimeBlocks(
        todayEvents.map((e) => ({
          time: new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
          item: e.title,
        }))
      );
      setUpdated(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const n = priorities.length;
  const now = ringPt(new Date());
  const blockPoints = timeBlocks
    .map((b) => {
      const m = /^(\d{1,2}):(\d{2})/.exec(b.time || "");
      if (!m) return null;
      const d = new Date();
      d.setHours(+m[1], +m[2], 0, 0);
      return { ...ringPt(d), item: b.item };
    })
    .filter(Boolean);
  const updatedStr = updated
    ? new Date(updated).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[400px]">
      <div className="flex flex-row h-full">
        {/* Left — vertical Giulia video */}
        <div className="relative w-[40%] shrink-0 overflow-hidden">
          <video src={GIULIA_VIDEO} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/15 to-transparent" />
          <div className="absolute left-3 bottom-3">
            <p className="text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/70">Giulia</p>
            <p className="text-[10px] text-ivory/55">je dag</p>
          </div>
        </div>

        {/* Right — motion infographic + plan */}
        <div className="flex-1 p-5 flex flex-col text-current min-h-0 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-7 w-7 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.26em] font-semibold text-current/60">Giulia · je dag</p>
                  <p className="text-base font-display font-semibold text-current leading-tight mt-0.5">{greetingWord()}.</p>
                </div>
                <span className="text-[10px] text-current/45 text-right leading-tight">{new Date().toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}</span>
              </div>

              {/* Motion day-ring */}
              <div className="relative flex items-center justify-center my-3">
                <svg viewBox="0 0 100 100" className="w-[120px] h-[120px]">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" className="opacity-15" />
                  <motion.circle
                    cx="50" cy="50" r="40" fill="none" stroke="var(--tile-accent)" strokeWidth="1.6" strokeLinecap="round"
                    strokeDasharray={RING_C}
                    initial={{ strokeDashoffset: RING_C }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                  {[0, 6, 12, 18].map((h) => {
                    const a = (2 * Math.PI * h) / 24 - Math.PI / 2;
                    return <line key={h} x1={50 + 36 * Math.cos(a)} y1={50 + 36 * Math.sin(a)} x2={50 + 40 * Math.cos(a)} y2={50 + 40 * Math.sin(a)} stroke="currentColor" strokeWidth="0.5" className="opacity-25" />;
                  })}
                  {blockPoints.map((p, i) => (
                    <motion.circle key={i} cx={p.x} cy={p.y} r="2" fill="hsl(var(--sand))"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }} />
                  ))}
                  <motion.circle cx={now.x} cy={now.y} r="2.2" fill="var(--tile-accent)" />
                  <motion.circle cx={now.x} cy={now.y} r="2.2" fill="none" stroke="var(--tile-accent)" strokeWidth="0.6"
                    animate={{ opacity: [0.7, 0], r: [2.2, 8] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-[34px] leading-none font-display font-bold tabular-nums text-current">{n}</motion.span>
                  <span className="text-[8px] uppercase tracking-[0.16em] text-current/55 mt-0.5">vandaag</span>
                </div>
              </div>

              <p className="text-[11px] leading-snug text-current/70 text-balance line-clamp-2">{summary}</p>

              <ol className="mt-2.5 space-y-1.5">
                {priorities.map((p, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-start gap-2">
                    <span className="text-[11px] font-display font-bold text-current/40 tabular-nums pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[11px] leading-snug text-current/90">{p}</span>
                  </motion.li>
                ))}
                {n === 0 && <li className="text-[11px] text-current/55">Een rustige dag — niets dringends.</li>}
              </ol>

              {timeBlocks.length > 0 && (
                <button onClick={() => setExpanded((x) => !x)}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-current/60 hover:text-current transition self-start">
                  {expanded ? "Minder" : "Context"} <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
                </button>
              )}
              {expanded && timeBlocks.length > 0 && (
                <div className="mt-1.5 space-y-1 max-h-20 overflow-y-auto pr-1">
                  {timeBlocks.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <span className="tabular-nums text-current/55 w-10 shrink-0">{b.time}</span>
                      <span className="w-1 h-1 rounded-full bg-current/40 shrink-0" />
                      <span className="text-current/85 truncate">{b.item}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-2 text-[9px] text-current/40">
                {updatedStr ? `Bijgewerkt om ${updatedStr}` : "Nog geen planning vandaag"}
              </div>
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}