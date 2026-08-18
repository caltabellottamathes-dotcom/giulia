import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, ActionBtn } from "@/system/panels/previewParts";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { Sunrise, ArrowRight, SkipForward, Check, ArrowUpRight, Sparkles } from "lucide-react";

const PHASES = ["wake", "orient", "routine", "getup"];
const PHASE_LABEL = { wake: "WAKE", orient: "ORIENT", routine: "ROUTINE", getup: "GET UP" };
const circ = (r) => 2 * Math.PI * r;

export default function WakePanel() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIntention, setShowIntention] = useState(false);
  const [intention, setIntention] = useState("");

  const load = async () => {
    try {
      const list = await base44.entities.WakeSession.list("-created_date", 1).catch(() => []);
      setSession((list || [])[0] || null);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const phase = session?.phase || "orient";
  const phaseIdx = PHASES.indexOf(phase);
  const nextPhase = phaseIdx < PHASES.length - 1 ? PHASES[phaseIdx + 1] : null;
  const pct = Math.round(((phaseIdx + 1) / PHASES.length) * 100);
  const isComplete = session?.status === "completed";

  const startWake = async () => {
    try { const s = await base44.entities.WakeSession.create({ phase: "wake", created_date: new Date().toISOString(), status: "active" }); setSession(s); } catch { /* ignore */ }
  };
  const setPhase = async (p) => { try { await base44.entities.WakeSession.update(session.id, { phase: p }); await load(); } catch { /* ignore */ } };
  const saveIntention = async () => { try { await base44.entities.WakeSession.update(session.id, { intention }); setShowIntention(false); await load(); } catch { /* ignore */ } };
  const endWake = async () => { try { await base44.entities.WakeSession.update(session.id, { phase: "getup", status: "completed" }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const r = 48, c = circ(r);
  const METRICS = [
    { l: "WAKE TIME", v: session?.wake_time || "—" },
    { l: "SNOOZED", v: `${session?.snooze_count || 0}×` },
    { l: "STEPS", v: `${phaseIdx + 1}/${PHASES.length}` },
    { l: "STATUS", v: isComplete ? "DONE" : PHASE_LABEL[phase] },
  ];

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Wake</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{session ? "Good morning" : "Start je dag"}</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{session ? `Phase: ${PHASE_LABEL[phase] || phase.toUpperCase()}` : "Nog geen wake sessie vandaag."}</p>
        <button onClick={() => navigate("/self/wake")} className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE }}>
          Open Wake <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 shrink-0">
          <div className="absolute inset-4 rounded-full" style={{ background: "rgba(225,231,239,0.10)", filter: "blur(16px)" }} />
          <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke={TRACK} strokeWidth="5" />
            <circle cx="60" cy="60" r={r} fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-ivory text-3xl font-bold tabular-nums leading-none">{pct}<span className="text-base">%</span></span>
            <span className="text-[8px] tracking-[0.2em] mt-1" style={{ color: SAND }}>{session ? PHASE_LABEL[phase] : "IDLE"}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative">
            <div className="absolute top-2 left-3 right-3 h-0.5 rounded-full bg-ivory/15" />
            <div className="absolute top-2 left-3 h-0.5 rounded-full" style={{ width: `${(phaseIdx / (PHASES.length - 1)) * 90}%`, background: BLUE }} />
            <div className="flex justify-between relative">
              {PHASES.map((p, i) => {
                const done = i < phaseIdx || isComplete;
                const current = i === phaseIdx && !isComplete;
                return (
                  <div key={p} className="flex flex-col items-center gap-2 z-10">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${current ? "animate-pulse" : ""}`} style={{ background: current ? SAND : done ? BLUE : "transparent", borderColor: current ? SAND : done ? BLUE : "rgba(255,255,255,0.25)" }} />
                    <span className={`text-[8px] tracking-wide font-semibold ${current ? "" : done ? "text-ivory/70" : "text-ivory/40"}`} style={current ? { color: SAND } : {}}>{PHASE_LABEL[p]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2">
        {METRICS.map((m) => (
          <div key={m.l} className="glass-card-2 rounded-xl p-2.5 text-center">
            <p className="text-ivory text-sm font-semibold tabular-nums">{m.v}</p>
            <p className="text-ivory/45 text-[8px] tracking-[0.15em] mt-1">{m.l}</p>
          </div>
        ))}
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
            <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
              <input value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="Wat is je intentie vandaag?" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" autoFocus />
              <button onClick={saveIntention} disabled={!intention.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Sparkles className="w-4 h-4" /> Stel in</button>
            </div>
          ) : (
            <button onClick={() => setShowIntention(true)} className="text-sm font-semibold" style={{ color: BLUE }}>+ Stel intentie in</button>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        {!session ? (
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn label="Start Wake" icon={Sunrise} onClick={startWake} />
            <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/wake")} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {nextPhase && <ActionBtn label="Volgende" icon={ArrowRight} onClick={() => setPhase(nextPhase)} />}
            {nextPhase && <ActionBtn label="Skip" icon={SkipForward} onClick={() => setPhase(nextPhase)} />}
            <ActionBtn label="Voltooi" icon={Check} onClick={endWake} />
            <ActionBtn label="Intentie" icon={Sparkles} onClick={() => { setIntention(session.intention || ""); setShowIntention(true); }} />
            <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/wake")} />
          </div>
        )}
      </div>
    </div>
  );
}