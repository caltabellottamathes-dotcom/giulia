import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { fetchUnifiedAttention, DOMAIN_META } from "@/lib/unifiedStream";

const EASE = [0.22, 1, 0.36, 1];
const ACCENT = "hsl(var(--sand))";

const greetingWord = () => {
  const h = new Date().getHours();
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
};

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

/* ── Accordion card — one open at a time, smooth height + opacity ── */
function AccordionCard({ label, count, isOpen, onToggle, children }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-[22px] border border-white/12 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(18px) saturate(1.3)",
        WebkitBackdropFilter: "blur(18px) saturate(1.3)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 6px 20px rgba(0,0,0,0.10)",
        transition: "background 0.5s " + EASE.map(String).join(","),
      }}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-3 w-full px-4 py-3 text-left"
      >
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight whitespace-nowrap"
          style={{ background: "var(--tile-on-accent)", color: "var(--tile-accent)" }}
        >
          {label}
        </span>
        {count != null && count !== "" && (
          <span className="text-[10px] uppercase tracking-wider opacity-50">{count}</span>
        )}
        <motion.span
          className="ml-auto h-7 w-7 rounded-full flex items-center justify-center border border-white/20 shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Plus className="h-3.5 w-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * GiuliaWidget — "GIULIA · JE DAG". Een compact dagoverzicht met drie
 * uitvouwbare secties die elk één vraag beantwoorden:
 *   1. Dagplanning  — "Waar ben ik?"      (vandaag's tijdlijn + NU-indicator)
 *   2. Urgent      — "Wat vraagt aandacht?" (meest tijdkritieke items)
 *   3. Voortgang   — "Hoe gaat mijn dag?"  (groot % + voortgangsbalk)
 * Eén sectie tegelijk open; de andere blijven compact. Zachte frosted glass,
 * grote typografie, ingetogen GIULIA-accent.
 */
export default function GiuliaWidget() {
  const { openModule } = usePanel();
  const [open, setOpen] = useState(0); // 0=Dagplanning, 1=Urgent, 2=Voortgang
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [urgent, setUrgent] = useState([]);
  const [progress, setProgress] = useState({ pct: 0, tasksDone: 0, tasksTotal: 0, eventsDone: 0, eventsTotal: 0 });

  // live klok — beweegt de NU-indicator elke minuut
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    const todayStr = new Date().toLocaleDateString("sv-SE");
    const [events, tasks, emails, approvals, plans, att] = await Promise.all([
      base44.entities.CalendarEvent.list("start", 200).catch(() => []),
      base44.entities.Task.list().catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
      base44.entities.DailyPlan.filter({ date: todayStr }).catch(() => []),
      fetchUnifiedAttention().catch(() => ({ eventsByDomain: {}, lifeItemsDue: [], routinesDueToday: [], selfNeeds: [] })),
    ]);
    const plan = plans[0];
    const nowMs = Date.now();

    // ── 1. DAGPLANNING — tijdlijn van vandaag ──
    const tl = [];
    (events || []).forEach((e) => {
      if (!e.start) return;
      const d = new Date(e.start);
      if (d.toLocaleDateString("sv-SE") !== todayStr) return;
      tl.push({
        time: d.getTime(),
        title: e.title,
        domain: e.domain || "focus",
        to: "/agenda",
      });
    });
    if (plan?.plan_data?.focus_items) {
      plan.plan_data.focus_items.forEach((f) => {
        tl.push({ time: null, title: f?.title || "Focus blok", domain: "focus", to: "/planning" });
      });
    }
    tl.sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));
    setTimeline(tl);

    // ── 2. URGENT — meest tijdkritiek ──
    const u = [];
    (tasks || [])
      .filter((t) => t.status === "overdue")
      .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
      .slice(0, 2)
      .forEach((t) => u.push({ label: t.title, to: t.project_id ? `/projects/${t.project_id}` : "/tasks", domain: "focus" }));
    (approvals || []).slice(0, 1).forEach((a) => u.push({ label: a.title || "Goedkeuring wacht", to: "/approvals", domain: "giulia" }));
    (emails || []).filter((e) => e.important).slice(0, 1).forEach((e) => u.push({ label: e.subject, to: "/email", domain: "focus" }));
    (att.selfNeeds || []).filter((n) => n.priority === "high").slice(0, 1).forEach((n) => u.push({ label: n.title, to: "/self/daily-state", domain: "self" }));
    (att.lifeItemsDue || []).slice(0, 1).forEach((h) => u.push({ label: h.title, to: "/life/household", domain: "life" }));
    (att.eventsByDomain?.focus || []).slice(0, 1).forEach((e) => u.push({ label: e.title, to: "/agenda", domain: "focus" }));
    setUrgent(u.slice(0, 4));

    // ── 3. VOORTGANG — dagvoortgang ──
    const totalTasks = (tasks || []).length;
    const doneTasks = (tasks || []).filter((t) => t.status === "done" || t.status === "completed").length;
    const timedEvents = tl.filter((t) => t.time != null);
    const eventsDone = timedEvents.filter((t) => t.time < nowMs).length;
    const taskPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const evtPct = timedEvents.length ? Math.round((eventsDone / timedEvents.length) * 100) : 0;
    const pct = totalTasks || timedEvents.length ? Math.round((taskPct + evtPct) / 2) : 0;
    setProgress({ pct, tasksDone: doneTasks, tasksTotal: totalTasks, eventsDone, eventsTotal: timedEvents.length });

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const i = setInterval(load, 5 * 60000); return () => clearInterval(i); }, [load]);

  const toggle = (i) => setOpen((cur) => (cur === i ? cur : i));

  const dateStr = now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  const nowMs = now.getTime();

  // NU-marker positie in de tijdlijn
  const nowIndex = useMemo(() => {
    const timed = timeline.filter((t) => t.time != null);
    const idx = timed.findIndex((t) => t.time > nowMs);
    if (idx === -1) return timeline.length; // alles voorbij
    return timeline.indexOf(timed[idx]);
  }, [timeline, nowMs]);

  return (
    <WidgetShell size="2x2" radius="xl" interactive onClick={() => openModule("jedag")} className="min-h-[340px]">
      <div className="flex flex-col h-full p-4 gap-3">
        {/* Masthead */}
        <div className="flex items-end justify-between px-1 shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] font-semibold opacity-60">Giulia · je dag</p>
            <h3 className="text-xl font-display font-semibold tracking-[-0.02em] leading-tight mt-0.5">{greetingWord()}.</h3>
          </div>
          <p className="text-[10px] opacity-45 capitalize shrink-0">{dateStr}</p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 min-h-0">
            {/* ── 1. DAGPLANNING ── */}
            <AccordionCard
              label="Dagplanning"
              count={timeline.length ? `${timeline.length} vandaag` : "rustig"}
              isOpen={open === 0}
              onToggle={() => toggle(0)}
            >
              {timeline.length === 0 ? (
                <p className="text-[12px] opacity-50 py-2">Geen afspraken of focus-blokken vandaag.</p>
              ) : (
                <div className="relative pl-5">
                  {/* verticale tijdlijn-lijn */}
                  <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-current/15" />
                  {timeline.map((item, i) => {
                    const meta = DOMAIN_META[item.domain] || DOMAIN_META.giulia;
                    const isPast = item.time != null && item.time < nowMs;
                    // NU-indicator vóór het eerste aankomende item
                    const showNow = i === nowIndex;
                    return (
                      <React.Fragment key={i}>
                        {showNow && (
                          <div className="relative flex items-center gap-2 -ml-5 mb-1.5 animate-fade-in">
                            <motion.span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ background: ACCENT }}
                              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Nu</span>
                            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
                          </div>
                        )}
                        <Link
                          to={item.to}
                          onClick={(e) => e.stopPropagation()}
                          className="relative flex items-baseline gap-2.5 py-1 group"
                        >
                          <span
                            className="absolute -left-[15px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-current/10 shrink-0"
                            style={{ background: meta.color, opacity: isPast ? 0.4 : 1 }}
                          />
                          {item.time != null && (
                            <span className="text-[10px] font-mono tabular-nums opacity-50 w-10 shrink-0">{fmtTime(item.time)}</span>
                          )}
                          {item.time == null && (
                            <Clock className="h-3 w-3 opacity-40 shrink-0" />
                          )}
                          <span className={`text-[12px] leading-snug ${isPast ? "opacity-45 line-through" : "opacity-90 group-hover:opacity-100"}`}>
                            {item.title}
                          </span>
                        </Link>
                      </React.Fragment>
                    );
                  })}
                  {nowIndex === timeline.length && timeline.length > 0 && (
                    <div className="relative flex items-center gap-2 -ml-5 mt-1.5 animate-fade-in">
                      <motion.span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: ACCENT }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Nu · dag voorbij</span>
                    </div>
                  )}
                </div>
              )}
            </AccordionCard>

            {/* ── 2. URGENT ── */}
            <AccordionCard
              label="Urgent"
              count={urgent.length ? `${urgent.length} items` : "niets"}
              isOpen={open === 1}
              onToggle={() => toggle(1)}
            >
              {urgent.length === 0 ? (
                <p className="text-[12px] opacity-50 py-2 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 opacity-60" /> Niets dringends vandaag.
                </p>
              ) : (
                <ol className="space-y-1.5">
                  {urgent.map((item, i) => {
                    const meta = DOMAIN_META[item.domain] || DOMAIN_META.giulia;
                    return (
                      <li key={i}>
                        <Link
                          to={item.to}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/8 transition group"
                        >
                          <span className="text-[18px] leading-none font-display font-bold tabular-nums w-5 shrink-0" style={{ color: meta.color }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider font-bold w-12 shrink-0" style={{ color: meta.color }}>{meta.label}</span>
                          <span className="text-[12px] leading-snug opacity-90 group-hover:opacity-100 truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </AccordionCard>

            {/* ── 3. VOORTGANG ── */}
            <AccordionCard
              label="Voortgang"
              count={progress.pct > 0 ? `${progress.pct}%` : "start"}
              isOpen={open === 2}
              onToggle={() => toggle(2)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline gap-1">
                  <motion.span
                    className="text-[44px] leading-[0.85] font-display font-light tabular-nums tracking-[-0.05em]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CountTo value={progress.pct} />
                  </motion.span>
                  <span className="text-[16px] font-light opacity-50 tracking-[-0.02em]">%</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider opacity-45 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> vandaag
                  </span>
                </div>
                {/* voortgangsbalk */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.14)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.pct}%` }}
                    transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
                  />
                </div>
                {/* breakdown */}
                <div className="flex items-center gap-4 text-[10px] opacity-60">
                  <span><strong className="font-semibold opacity-90">{progress.tasksDone}</strong>/{progress.tasksTotal || 0} taken</span>
                  <span><strong className="font-semibold opacity-90">{progress.eventsDone}</strong>/{progress.eventsTotal || 0} afspraken</span>
                </div>
              </div>
            </AccordionCard>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}

/* kleine count-up helper voor het voortgangs-% */
function CountTo({ value }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    let raf;
    const start = disp;
    const t0 = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setDisp(Math.round(start + (value - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{disp}</>;
}