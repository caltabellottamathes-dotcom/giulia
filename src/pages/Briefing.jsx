import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { X, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BriefingCard from "@/components/briefing/BriefingCard";
import { IMAGES } from "@/lib/images";

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

  // Giulia question cards — mixed in at positions 2, 5, 9 etc.
  const GIULIA_QUESTIONS = [
    { type: "question", title: "Wat geeft jou 's ochtends energie voor de dag?", summary: "Koffie, muziek, stilte? Ik wil begrijpen wat jouw dag goed start.", suggested_action: "Antwoord typen", priority: "relevant" },
    { type: "question", title: "Welk type taak doe je het liefst als eerste?", summary: "De makkelijkste om warm te draaien, of juist de zwaarste terwijl je scherp bent?", suggested_action: "Vertel het", priority: "relevant" },
    { type: "question", title: "Is er iemand waar je vaker van hoort dan je wil?", summary: "Of juist iemand van wie je te weinig hoort? Ik leer graag je sociale landschap kennen.", suggested_action: "Vertel me", priority: "relevant" },
    { type: "question", title: "Hoe weet jij dat een dag geslaagd was?", summary: "Een gevoel, een lijst, iets wat gedaan is? Ik wil weten wat voor jou 'goed' betekent.", suggested_action: "Vertel het", priority: "relevant" },
    { type: "question", title: "Wat stel je het meest uit?", summary: "Niet om je te bekritiseren — ik wil er gewoon rekening mee houden.", suggested_action: "Eerlijk antwoorden", priority: "relevant" },
  ];
  const questionIdx = useRef(0);

  const injectQuestions = useCallback((rawItems) => {
    const result = [...rawItems];
    const positions = [2, 5, 9]; // inject at these positions
    let qIdx = questionIdx.current % GIULIA_QUESTIONS.length;
    positions.forEach((pos, i) => {
      if (pos <= result.length) {
        const q = { ...GIULIA_QUESTIONS[(qIdx + i) % GIULIA_QUESTIONS.length], id: `q-${i}`, status: "new" };
        result.splice(pos + i, 0, q);
      }
    });
    questionIdx.current = (qIdx + positions.length) % GIULIA_QUESTIONS.length;
    return result;
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("compileBriefing", {});
      const d = res?.data ?? res;
      if (d?.ok) {
        setData(d);
        const enriched = injectQuestions(d.items || []);
        setItems(enriched);
        setPhase(enriched.length ? "intro" : "outro");
      } else {
        setPhase("outro");
        setData({ outro: { head: "Je bent weer bij.", subline: "Er staat niets dringend.", next: "" } });
      }
    } catch {
      setPhase("outro");
      setData({ outro: { head: "Je bent weer bij.", subline: "Er staat niets dringend.", next: "" } });
    }
  }, [injectQuestions]);

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
        {/* Editorial photo — right half, no overlay */}
        <img src={IMAGES.walkChairsBeach} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover hidden sm:block" />
        <div className="absolute right-0 top-0 h-full w-1/2 hidden sm:block">
          <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 rounded-full bg-ivory/75 backdrop-blur-xl border border-white/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] font-bold text-charcoal">
            Giulia Briefing
          </div>
        </div>

        <div className="relative w-full sm:w-1/2 flex flex-col justify-center px-8 sm:px-14 lg:px-20">
          <p className="text-[11px] uppercase tracking-[0.3em] text-charcoal/55 font-bold mb-6">{data?.intro?.greeting}</p>
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-display font-bold leading-[0.95] tracking-[-0.035em] mb-5 text-balance">
            Ik heb de boel in de gaten gehouden.
          </h1>
          <p className="text-lg text-charcoal/65 mb-10 max-w-md">{data?.intro?.subline}</p>
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
      <div className="relative flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
        <div className="relative w-[min(90vw,440px)] h-[min(70vh,620px)]">
          {after && (
            <div className="absolute inset-0 scale-90 -translate-y-6 opacity-40">
              <BriefingCard item={after} interactive={false} />
            </div>
          )}
          {next && (
            <div className="absolute inset-0 scale-[0.94] -translate-y-3 opacity-65">
              <BriefingCard item={next} interactive={false} />
            </div>
          )}
          {current && (
            <motion.div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.55}
              dragSnapToOrigin
              onDragEnd={(e, info) => {
                if (info.offset.x > 130 || info.velocity.x > 650) swipe(1);
                else if (info.offset.x < -130 || info.velocity.x < -650) swipe(-1);
              }}
              animate={exitDir
                ? { x: exitDir * 1100, rotate: exitDir * 14, opacity: 0 }
                : { x: 0, rotate: 0, opacity: 1 }}
              transition={exitDir
                ? { duration: 0.3, ease: "easeOut" }
                : { type: "spring", stiffness: 320, damping: 32 }}
              style={{ zIndex: 3 }}
            >
              <BriefingCard
                item={current}
                onAct={() => openAction(current)}
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