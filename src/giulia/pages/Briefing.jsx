import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { X, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BriefingCard from "@/giulia/components/BriefingCard";
import { IMAGES } from "@/lib/images";
import { GIULIA_QUESTIONS } from "@/lib/giuliaQuestions";

/**
 * Briefing — light, fashion-editorial catch-up. Layered glass, bold
 * infographics, large brutalist typography. One card at a time;
 * swipe ← later, → act.
 */
export default function Briefing() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [phase, setPhase] = useState("loading");
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Tinder-style drag — rotation + ACTIE/LATER stamps volgen je vinger.
  const xDrag = useMotionValue(0);
  const rotate = useTransform(xDrag, [-220, 220], [-16, 16]);
  const likeOp = useTransform(xDrag, [50, 140], [0, 1]);
  const nopeOp = useTransform(xDrag, [-140, -50], [1, 0]);

  const buildItems = useCallback((rawItems, answered) => {
    const pool = GIULIA_QUESTIONS.filter((q) => !answered.has(q.key));
    if (!pool.length) return rawItems;
    // Shuffle so a different set of questions surfaces each briefing.
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 2);
    const positions = rawItems.length > 4 ? [3, 6] : [2, 5];
    const result = [...rawItems];
    picks.forEach((q, i) => {
      const pos = Math.min(positions[i] ?? result.length, result.length);
      result.splice(pos, 0, {
        ...q, type: "question", id: `q-${q.key}`, status: "new",
        suggested_action: "Vertel het Giulia", priority: "relevant",
      });
    });
    return result;
  }, []);

  const load = useCallback(async () => {
    const rank = { critical: 0, important: 1, relevant: 2, later: 3 };
    const greet = (() => { const h = new Date().getHours(); return h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond"; })();
    try {
      const me = await base44.auth.me().catch(() => null);
      const answered = new Set(Object.keys(me?.giulia_answers || {}));
      const now = new Date();
      const todayIso = now.toISOString().slice(0, 10);

      // Altijd verse data — direct uit de entiteiten, onafhankelijk van LLM-credits.
      const [briefingItems, tasks, events, emails, approvals, insights] = await Promise.all([
        base44.entities.BriefingItem.filter({ status: "new" }, "-timestamp", 30).catch(() => []),
        base44.entities.Task.list("deadline", 80).catch(() => []),
        base44.entities.Event.list("start").catch(() => []),
        base44.entities.Email.filter({ status: "unread" }, "-timestamp", 20).catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }, "-created_date", 20).catch(() => []),
        base44.entities.Insight.filter({ status: "new" }, "-created_date", 10).catch(() => []),
      ]);

      const raw = [];
      (briefingItems || []).forEach((b) => raw.push({ ...b, status: b.status || "new", priority: b.priority || "relevant" }));
      (tasks || []).filter((t) => ["today", "overdue", "in_progress"].includes(t.status)).forEach((t) => raw.push({
        id: `t-${t.id}`, type: "task", title: t.title,
        summary: t.deadline ? `Deadline: ${t.deadline}` : (t.description || "Taak"),
        related_task: t.id, status: "new", suggested_action: "Open taak",
        action_route: "/tasks", priority: t.status === "overdue" ? "critical" : "important",
      }));
      (events || []).filter((e) => (e.start || "").slice(0, 10) === todayIso).forEach((e) => raw.push({
        id: `e-${e.id}`, type: "calendar",
        title: `${new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} · ${e.title}`,
        summary: e.location || "Afspraak vandaag", status: "new",
        suggested_action: "Naar agenda", action_route: "/agenda", priority: "important",
      }));
      (emails || []).filter((m) => m.important).slice(0, 3).forEach((m) => raw.push({
        id: `m-${m.id}`, type: "email", title: m.subject || "Email",
        summary: `Van ${m.sender_email || m.sender || "?"}`,
        payload: { count: 1, important: 1 }, status: "new",
        suggested_action: "Open email", action_route: "/email", priority: "important",
      }));
      (approvals || []).slice(0, 4).forEach((a) => raw.push({
        id: `a-${a.id}`, type: "important", title: a.title || "Goedkeuring",
        summary: a.description || "Wacht op jouw ja", status: "new",
        suggested_action: "Bekijk", action_route: "/approvals",
        priority: a.category === "urgent" ? "critical" : "important",
      }));
      (insights || []).slice(0, 2).forEach((i) => raw.push({
        id: `i-${i.id}`, type: "insight", title: i.title, summary: i.content,
        status: "new", suggested_action: "Bekijk", action_route: "/insights", priority: "relevant",
      }));

      raw.sort((a, b) => (rank[a.priority] ?? 2) - (rank[b.priority] ?? 2));
      const enriched = buildItems(raw, answered);
      setData({
        intro: { greeting: greet, subline: enriched.length ? `${enriched.length} dingen die je aandacht verdienen.` : "Alles is rustig.", personal_note: "" },
        outro: { head: "Je bent weer bij.", subline: "Niets dringends meer.", next: "" },
      });
      setItems(enriched);
      setPhase(enriched.length ? "intro" : "outro");
    } catch {
      setPhase("outro");
      setData({ outro: { head: "Je bent weer bij.", subline: "Er staat niets dringend.", next: "" } });
    }
  }, [buildItems]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = (id, status) => {
    if (!id) return;
    base44.entities.BriefingItem.update(id, { status }).catch(() => {});
  };

  const swipe = useCallback((dir) => {
    setExitDir((cur) => {
      if (cur) return cur;
      const item = items[index];
      if (item) updateStatus(item.id, dir > 0 ? "actioned" : "later");
      setTimeout(() => {
        setIndex((i) => {
          const next = i + 1;
          if (next >= items.length) setPhase("outro");
          return next;
        });
        setExitDir(0);
        setExpanded(false);
      }, 300);
      return dir;
    });
  }, [items, index]);

  useEffect(() => {
    if (phase !== "stack") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") swipe(-1);
      else if (e.key === "ArrowRight") swipe(1);
      else if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, swipe, navigate]);

  const openAction = (item) => {
    if (!item) return;
    // Question cards go to chat for the user to type their answer
    if (item.type === "question") {
      navigate("/chat");
      return;
    }
    updateStatus(item.id, "actioned");
    const params = item.action_params && Object.keys(item.action_params).length
      ? "?" + new URLSearchParams(item.action_params).toString()
      : "";
    navigate((item.action_route || "/") + params);
  };

  // "Leg uit" — stuurt het item naar Giulia in de chat voor extra context
  const explain = (item) => {
    if (!item) return;
    const q = `Leg dit kort en duidelijk uit — wat is het, waarom staat het in mijn briefing en wat moet ik ermee doen?\n\n• Type: ${item.type}\n• Titel: ${item.title}\n• Samenvatting: ${item.summary}${item.context ? `\n• Context: ${item.context}` : ""}`;
    navigate(`/chat?ask=${encodeURIComponent(q)}`);
  };

  const onAnswer = useCallback(async (key, text) => {
    if (!text.trim()) return;
    try {
      const me = await base44.auth.me();
      const existing = me?.giulia_answers || {};
      await base44.auth.updateMe({ giulia_answers: { ...existing, [key]: text.trim() } });
      toast({ title: "Giulia noteert dit", description: "Ik onthoud het voor de volgende keer." });
    } catch {}
    swipe(1);
  }, [swipe, toast]);

  // One-click task done — subtle confirmation, then auto-advance.
  const onDone = useCallback(async (taskId) => {
    if (!taskId) return;
    try {
      await base44.entities.Task.update(taskId, { status: "completed" });
      const cur = items[index];
      if (cur?.id) updateStatus(cur.id, "actioned");
      // Registreer de afronding zodat de taak niet opnieuw wordt voorgesteld.
      base44.entities.Activity.create({
        action: "task_completed",
        description: (cur?.title || "Taak").slice(0, 120),
        source: "briefing",
        timestamp: new Date().toISOString(),
      }).catch(() => null);
    } catch {}
    toast({ title: "Taak gedaan", description: "Giulia noteert het als afgerond." });
    setTimeout(() => swipe(1), 780);
  }, [items, index, swipe, toast]);

  const askGiulia = () => navigate("/chat");

  /* ---------- LOADING ---------- */
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-[120] bg-warm-white text-charcoal flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 border-2 border-charcoal/15 border-t-charcoal rounded-full animate-spin" />
          <p className="text-sm text-charcoal/60 font-display">Giulia stelt je briefing samen…</p>
        </div>
      </div>
    );
  }

  /* ---------- INTRO ---------- */
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-[120] bg-warm-white text-charcoal flex animate-fade-in overflow-hidden">
        {/* Mobile — top editorial photo band */}
        <img src={IMAGES.walkChairsBeach} alt="" className="sm:hidden absolute top-0 inset-x-0 h-[38vh] w-full object-cover" />
        <div className="sm:hidden absolute top-0 inset-x-0 h-[38vh] bg-gradient-to-b from-transparent via-warm-white/30 to-warm-white" />
        {/* Editorial photo — right half, no overlay */}
        <img src={IMAGES.walkChairsBeach} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover hidden sm:block" />
        <div className="absolute right-0 top-0 h-full w-1/2 hidden sm:block">
          <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 rounded-full bg-ivory/75 backdrop-blur-xl border border-white/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] font-bold text-charcoal">
            Giulia Briefing
          </div>
        </div>

        <div className="relative w-full sm:w-1/2 flex flex-col justify-end sm:justify-center px-8 sm:px-14 lg:px-20 pt-10 sm:pt-0 pb-14 sm:pb-0">
          <p className="text-[11px] uppercase tracking-[0.3em] text-charcoal/55 font-bold mb-6">{data?.intro?.greeting}</p>
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-display font-bold leading-[0.95] tracking-[-0.035em] mb-5 text-balance">
            Ik heb de boel in de gaten gehouden.
          </h1>
          <p className="text-lg text-charcoal/65 mb-2 max-w-md">{data?.intro?.subline}</p>
          {data?.intro?.personal_note && (
            <p className="text-base text-olive mb-10 max-w-md italic font-medium">{data.intro.personal_note}</p>
          )}
          {!data?.intro?.personal_note && <div className="mb-10" />}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <button
              onClick={() => setPhase("stack")}
              className="h-12 px-7 rounded-full bg-charcoal text-ivory font-bold text-sm hover:bg-charcoal/90 transition inline-flex items-center justify-center gap-2"
            >
              Start briefing <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={askGiulia}
              className="h-12 px-7 rounded-full bg-ivory/70 backdrop-blur-xl border border-charcoal/15 text-charcoal font-semibold text-sm hover:bg-ivory transition inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Ask Giulia
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- OUTRO ---------- */
  if (phase === "outro") {
    return (
      <div className="fixed inset-0 z-[120] bg-warm-white text-charcoal flex flex-col justify-center px-6 animate-fade-in overflow-hidden">
        <img src={IMAGES.loungeChairs} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative max-w-xl mx-auto w-full text-center">
          <div className="h-16 w-16 rounded-full bg-olive/15 border border-olive/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-7 w-7 text-olive" />
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-display font-bold leading-[0.98] tracking-[-0.03em] mb-3">
            {data?.outro?.head || "Je bent weer bij."}
          </h1>
          <p className="text-lg text-charcoal/65 mb-2">{data?.outro?.subline}</p>
          {data?.outro?.next && <p className="text-sm text-charcoal/45 mb-8">{data.outro.next}</p>}
          {!data?.outro?.next && <div className="mb-8" />}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/")} className="h-12 px-7 rounded-full bg-charcoal text-ivory font-bold text-sm hover:bg-charcoal/90 transition">
              Naar dashboard
            </button>
            <button
              onClick={askGiulia}
              className="h-12 px-7 rounded-full bg-ivory/70 backdrop-blur-xl border border-charcoal/15 text-charcoal font-semibold text-sm hover:bg-ivory transition inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Ask Giulia
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- STACK ---------- */
  const current = items[index];
  const next = items[index + 1];
  const after = items[index + 2];

  return (
    <div className="fixed inset-0 z-[120] bg-warm-white text-charcoal flex flex-col animate-fade-in overflow-hidden">
      {/* Mobile — full-color blurred close-up editorial backdrop */}
      <img src={IMAGES.salvoFeetPebbles} alt="" className="lg:hidden absolute inset-0 h-full w-full object-cover scale-110 blur-2xl pointer-events-none" />
      <div className="lg:hidden absolute inset-0 bg-warm-white/15 pointer-events-none" />
      {/* Desktop — faint wash (unchanged) */}
      <img src={IMAGES.salvoWalkingBeach} alt="" className="hidden lg:block absolute inset-0 h-full w-full object-cover opacity-[0.05] pointer-events-none" />
      {/* Top bar — light glass */}
      <div className="relative flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 rounded-full bg-ivory/70 backdrop-blur-xl border border-charcoal/10 px-3.5 py-1.5 text-[12px] font-semibold text-charcoal/80 hover:bg-ivory transition">
          <X className="h-3.5 w-3.5" /> Sluiten
        </button>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${i === index ? "w-6 bg-charcoal" : i < index ? "w-1.5 bg-charcoal/40" : "w-1.5 bg-charcoal/20"}`} />
          ))}
        </div>
        <button onClick={askGiulia} className="inline-flex items-center gap-1.5 rounded-full bg-olive text-ivory px-3.5 py-1.5 text-[12px] font-bold hover:bg-olive/90 transition">
          <Sparkles className="h-3.5 w-3.5" /> Ask Giulia
        </button>
      </div>

      {/* Card stage */}
      <div className="relative flex-1 flex items-center justify-center px-3 pb-4 min-h-0">
        <div className="relative w-[min(92vw,440px)] h-[min(78vh,660px)] lg:w-[min(90vw,440px)] lg:h-[min(70vh,620px)]">
          {after && (
            <div className="absolute inset-0 scale-90 -translate-y-6 opacity-40 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <BriefingCard item={after} interactive={false} />
            </div>
          )}
          {next && (
            <div className="absolute inset-0 scale-[0.94] -translate-y-3 opacity-65 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <BriefingCard item={next} interactive={false} />
            </div>
          )}
          {current && (
            <motion.div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              dragSnapToOrigin
              onDrag={(e, info) => xDrag.set(info.offset.x)}
              onDragEnd={(e, info) => {
                xDrag.set(0);
                if (info.offset.x > 120 || info.velocity.x > 600) swipe(1);
                else if (info.offset.x < -120 || info.velocity.x < -600) swipe(-1);
              }}
              animate={exitDir
                ? { x: exitDir * 1100, opacity: 0, scale: 0.92 }
                : { x: 0, opacity: 1, scale: 1 }}
              transition={exitDir
                ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                : { type: "spring", stiffness: 320, damping: 34 }}
              style={{ rotate, zIndex: 3 }}
            >
              <motion.div style={{ opacity: likeOp }} className="absolute top-10 left-7 z-30 pointer-events-none -rotate-12">
                <span className="text-4xl sm:text-5xl font-display font-black text-olive border-[3px] border-olive rounded-xl px-3 py-0.5 tracking-tight">ACTIE</span>
              </motion.div>
              <motion.div style={{ opacity: nopeOp }} className="absolute top-10 right-7 z-30 pointer-events-none rotate-12">
                <span className="text-4xl sm:text-5xl font-display font-black text-destructive border-[3px] border-destructive rounded-xl px-3 py-0.5 tracking-tight">LATER</span>
              </motion.div>
              <BriefingCard
                key={index}
                item={current}
                onAct={() => openAction(current)}
                onAnswer={onAnswer}
                onDone={onDone}
                onExplain={() => explain(current)}
                expanded={expanded}
                onToggleExpand={() => setExpanded((v) => !v)}
                photoIndex={index}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Hint + actions — light glass */}
      <div className="relative px-5 pb-6 pt-2">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => swipe(-1)}
            className="flex-1 h-11 rounded-2xl bg-ivory/70 backdrop-blur-xl border border-charcoal/12 text-charcoal/75 text-[13px] font-semibold hover:bg-ivory transition inline-flex items-center justify-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Later
          </button>
          <span className="text-[11px] uppercase tracking-wider text-charcoal/40 font-bold px-2 hidden sm:block">veeg</span>
          <button
            onClick={() => swipe(1)}
            className="flex-1 h-11 rounded-2xl bg-charcoal text-ivory text-[13px] font-bold hover:bg-charcoal/90 transition inline-flex items-center justify-center gap-2"
          >
            Actie <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[11px] text-charcoal/45 mt-3 font-medium">
          {index + 1} van {items.length} · ← later · → actie
        </p>
      </div>
    </div>
  );
}