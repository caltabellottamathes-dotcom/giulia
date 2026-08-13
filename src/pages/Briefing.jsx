import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { useToast } from "@/components/ui/use-toast";
import { X, Sparkles, Mic, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BriefingCard from "@/components/briefing/BriefingCard";
import { IMAGES } from "@/lib/images";

/**
 * Briefing — Giulia's immersive catch-up. One editorial card at a time;
 * swipe ← later, swipe → act. fullscreen, editorial, tactile.
 */
export default function Briefing() {
  const navigate = useNavigate();
  const { openChat } = usePanel();
  const { toast } = useToast();

  const [phase, setPhase] = useState("loading"); // loading | intro | stack | outro
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("compileBriefing", {});
      const d = res?.data ?? res;
      if (d?.ok) {
        setData(d);
        setItems(d.items || []);
        setPhase((d.items || []).length ? "intro" : "outro");
      } else {
        setPhase("outro");
        setData({ intro: { greeting: "Goedemorgen", subline: "Even geen briefing." }, outro: { head: "Je bent weer bij.", subline: "Er staat niets dringend.", next: "" } });
      }
    } catch {
      setPhase("outro");
      setData({ intro: { greeting: "Goedemorgen", subline: "Even geen briefing." }, outro: { head: "Je bent weer bij.", subline: "Er staat niets dringend.", next: "" } });
    }
  }, []);

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

  // Keyboard
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
    updateStatus(item.id, "actioned");
    const params = item.action_params && Object.keys(item.action_params).length
      ? "?" + new URLSearchParams(item.action_params).toString()
      : "";
    navigate((item.action_route || "/") + params);
  };

  const askGiulia = () => openChat();

  /* ---------- LOADING ---------- */
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-[120] bg-charcoal text-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
          <p className="text-sm text-ivory/60 font-display">Giulia stelt je briefing samen…</p>
        </div>
      </div>
    );
  }

  /* ---------- INTRO ---------- */
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-[120] bg-charcoal text-ivory flex flex-col justify-center px-6 animate-fade-in overflow-hidden">
        <img src={IMAGES.feetChair} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/60" />
        <div className="relative max-w-xl mx-auto w-full">
          <p className="text-[11px] uppercase tracking-[0.28em] text-ivory/55 font-semibold mb-5">{data?.intro?.greeting}</p>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-[1.05] tracking-tight mb-4 text-balance">
            Ik heb de boel in de gaten gehouden.
          </h1>
          <p className="text-lg text-ivory/70 mb-10">{data?.intro?.subline}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setPhase("stack")}
              className="h-12 px-7 rounded-2xl bg-ivory text-charcoal font-semibold text-sm hover:bg-ivory/90 transition inline-flex items-center justify-center gap-2"
            >
              Start briefing <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={askGiulia}
              className="h-12 px-7 rounded-2xl bg-ivory/10 border border-ivory/15 text-ivory font-medium text-sm hover:bg-ivory/15 transition inline-flex items-center justify-center gap-2"
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
      <div className="fixed inset-0 z-[120] bg-charcoal text-ivory flex flex-col justify-center px-6 animate-fade-in">
        <div className="max-w-xl mx-auto w-full text-center">
          <div className="h-16 w-16 rounded-full bg-olive/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-7 w-7 text-olive" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-tight tracking-tight mb-3">
            {data?.outro?.head || "Je bent weer bij."}
          </h1>
          <p className="text-lg text-ivory/70 mb-2">{data?.outro?.subline}</p>
          {data?.outro?.next && <p className="text-sm text-ivory/50 mb-8">{data.outro.next}</p>}
          {!data?.outro?.next && <div className="mb-8" />}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="h-12 px-7 rounded-2xl bg-ivory text-charcoal font-semibold text-sm hover:bg-ivory/90 transition"
            >
              Naar dashboard
            </button>
            <button
              onClick={askGiulia}
              className="h-12 px-7 rounded-2xl bg-ivory/10 border border-ivory/15 text-ivory font-medium text-sm hover:bg-ivory/15 transition inline-flex items-center justify-center gap-2"
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
    <div className="fixed inset-0 z-[120] bg-charcoal text-ivory flex flex-col animate-fade-in overflow-hidden">
      {/* Ambient backdrop */}
      <img src={IMAGES.topDownWalk} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-3 py-1.5 text-[12px] font-medium text-ivory/85 hover:bg-ivory/15 transition">
          <X className="h-3.5 w-3.5" /> Sluiten
        </button>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${i === index ? "w-6 bg-ivory" : i < index ? "w-1.5 bg-ivory/40" : "w-1.5 bg-ivory/20"}`} />
          ))}
        </div>
        <button onClick={askGiulia} className="inline-flex items-center gap-1.5 rounded-full bg-olive/20 text-olive px-3 py-1.5 text-[12px] font-semibold hover:bg-olive/30 transition">
          <Sparkles className="h-3.5 w-3.5" /> Ask Giulia
        </button>
      </div>

      {/* Card stage */}
      <div className="relative flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
        <div className="relative w-[min(90vw,440px)] h-[min(68vh,600px)]">
          {/* behind-behind */}
          {after && (
            <div className="absolute inset-0 scale-90 -translate-y-6 opacity-30">
              <BriefingCard item={after} interactive={false} />
            </div>
          )}
          {/* behind */}
          {next && (
            <div className="absolute inset-0 scale-[0.94] -translate-y-3 opacity-55">
              <BriefingCard item={next} interactive={false} />
            </div>
          )}
          {/* current */}
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
                ? { x: exitDir * 1100, rotate: exitDir * 16, opacity: 0 }
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
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Hint + actions */}
      <div className="relative px-5 pb-6 pt-2">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => swipe(-1)}
            className="flex-1 h-11 rounded-2xl bg-ivory/8 border border-ivory/12 text-ivory/80 text-[13px] font-medium hover:bg-ivory/12 transition inline-flex items-center justify-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Later
          </button>
          <span className="text-[11px] uppercase tracking-wider text-ivory/40 font-medium px-2 hidden sm:block">veeg</span>
          <button
            onClick={() => swipe(1)}
            className="flex-1 h-11 rounded-2xl bg-ivory/8 border border-ivory/12 text-ivory/80 text-[13px] font-medium hover:bg-ivory/12 transition inline-flex items-center justify-center gap-2"
          >
            Actie <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[11px] text-ivory/40 mt-3">
          {index + 1} van {items.length} · ← later · → actie
        </p>
      </div>
    </div>
  );
}