import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { Sunrise, ArrowRight, Check, Sparkles } from "lucide-react";

const PHASES = ["wake", "orient", "routine", "getup"];
const PHASE_LABEL = { wake: "WAKE", orient: "ORIENT", routine: "ROUTINE", getup: "GET UP" };

export default function WakePanel() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIntention, setShowIntention] = useState(false);
  const [intention, setIntention] = useState("");

  const load = async () => {
    try { const list = await base44.entities.WakeSession.list("-created_date", 1).catch(() => []); setSession((list || [])[0] || null); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const phase = session?.phase || "orient";
  const phaseIdx = PHASES.indexOf(phase);
  const nextPhase = phaseIdx < PHASES.length - 1 ? PHASES[phaseIdx + 1] : null;
  const pct = Math.round(((phaseIdx + 1) / PHASES.length) * 100);
  const isComplete = session?.status === "completed";

  const startWake = async () => { try { const s = await base44.entities.WakeSession.create({ phase: "wake", created_date: new Date().toISOString(), status: "active" }); setSession(s); } catch { /* ignore */ } };
  const setPhase = async (p) => { try { await base44.entities.WakeSession.update(session.id, { phase: p }); await load(); } catch { /* ignore */ } };
  const saveIntention = async () => { try { await base44.entities.WakeSession.update(session.id, { intention }); setShowIntention(false); await load(); } catch { /* ignore */ } };
  const endWake = async () => { try { await base44.entities.WakeSession.update(session.id, { phase: "getup", status: "completed" }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const METRICS = [
    { l: "WAKE TIME", v: session?.wake_time || "—" },
    { l: "SNOOZED", v: `${session?.snooze_count || 0}×` },
    { l: "STEPS", v: `${phaseIdx + 1}/${PHASES.length}` },
    { l: "STATUS", v: isComplete ? "DONE" : PHASE_LABEL[phase] },
  ];

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Wake</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{session ? "Good morning" : "Start je dag"}</h2>
            {session && !isComplete && <PulseDot color={SAND} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{session ? `Phase: ${PHASE_LABEL[phase] || phase.toUpperCase()}` : "Nog geen wake sessie vandaag."}</p>
        </div>
        <OpenLink to="/wake" label="Open Wake" />
      </div>

      {/* Big progress ring */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-8 rounded-full" style={{ background: "rgba(225,231,239,0.10)", filter: "blur(28px)" }} />
          <AnimatedRing pct={pct} size={200} stroke={8} color={BLUE}>
            <span className="text-ivory text-6xl font-bold tabular-nums leading-none"><CountUp value={pct} /><span className="text-3xl">%</span></span>
            <span className="text-[11px] tracking-[0.3em] mt-3" style={{ color: SAND }}>{session ? PHASE_LABEL[phase] : "IDLE"}</span>
          </AnimatedRing>
        </div>

        {/* Phase timeline */}
        <div className="mt-8 w-full max-w-lg">
          <div className="relative">
            <div className="absolute top-4 left-6 right-6 h-1 rounded-full bg-ivory/15" />
            <motion.div className="absolute top-4 left-6 h-1 rounded-full" style={{ background: BLUE }}
              initial={{ width: 0 }} animate={{ width: `${(phaseIdx / (PHASES.length - 1)) * (100 - 12)}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            <div className="flex justify-between relative">
              {PHASES.map((p, i) => {
                const done = i < phaseIdx || isComplete;
                const current = i === phaseIdx && !isComplete;
                return (
                  <div key={p} className="flex flex-col items-center gap-3 z-10">
                    <motion.span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${current ? "animate-pulse" : ""}`}
                      animate={{ scale: current ? [1, 1.15, 1] : 1 }}
                      transition={{ duration: 1.5, repeat: current ? Infinity : 0 }}
                      style={{ background: current ? SAND : done ? BLUE : "transparent", borderColor: current ? SAND : done ? BLUE : "rgba(255,255,255,0.25)" }} />
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${current ? "" : done ? "text-ivory" : "text-ivory/55"}`} style={current ? { color: SAND } : {}}>{PHASE_LABEL[p]}</p>
                      <p className={`text-[9px] tracking-[0.2em] mt-1 ${current ? "" : "text-ivory/40"}`} style={current ? { color: SAND } : {}}>{done ? "DONE" : current ? "NOW" : "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
          {METRICS.map((m, i) => (
            <motion.div key={m.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card-2 rounded-2xl p-4 text-center">
              <p className="text-ivory text-xl font-semibold tabular-nums">{m.v}</p>
              <p className="text-ivory/45 text-[9px] tracking-[0.2em] mt-1.5">{m.l}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Intention */}
      {session && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Dagelijkse intentie</p>
          {session.intention ? (
            <div className="glass-card-2 rounded-2xl p-4">
              <p className="text-sm text-ivory/80 italic">"{session.intention}"</p>
              <button onClick={() => { setIntention(session.intention || ""); setShowIntention(true); }} className="text-[10px] uppercase tracking-wide text-ivory/50 mt-2 font-semibold">Bewerk</button>
            </div>
          ) : showIntention ? (
            <div className="rounded-2xl glass-card-2 p-4 space-y-2.5">
              <input value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="Wat is je intentie vandaag?" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" autoFocus />
              <button onClick={saveIntention} disabled={!intention.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Sparkles className="w-4 h-4" /> Stel in</button>
            </div>
          ) : (
            <button onClick={() => setShowIntention(true)} className="text-sm font-semibold" style={{ color: BLUE }}>+ Stel intentie in</button>
          )}
        </div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "CURRENT PHASE", text: isComplete ? "Wake Mode afgerond — je dag is begonnen." : `${PHASE_LABEL[phase]} fase loopt, ${pct}% voltooid.` },
        { label: "WAKE TIME", text: session?.wake_time ? `Gepland om ${session.wake_time}.` : "Geen wake time ingesteld." },
        { label: "MORNING CONTEXT", text: session?.morning_context || "Geen ochtend-context vastgelegd." },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Start Wake", primary: true, onClick: startWake },
        ...(nextPhase ? [{ label: "Volgende Phase", onClick: () => setPhase(nextPhase) }] : []),
        { label: "Voltooi", onClick: endWake },
        { label: "Start Wake Mode", to: "/wake" },
        { label: "Open Wake", to: "/self/wake" },
      ]} />
    </div>
  );
}