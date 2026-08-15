import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, ActionBtn } from "@/system/panels/previewParts";
import { fmtTime } from "@/lib/selfUtils";
import { Sunrise, ArrowRight, SkipForward, Check, ArrowUpRight, Sparkles } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";
const PHASES = ["wake", "orient", "routine", "getup"];

/** Wake panel — huidige phase, intentie en volgende stap. */
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

  const startWake = async () => {
    try { const s = await base44.entities.WakeSession.create({ phase: "wake", created_date: new Date().toISOString(), status: "active" }); setSession(s); } catch { /* ignore */ }
  };
  const setPhase = async (p) => { try { await base44.entities.WakeSession.update(session.id, { phase: p }); await load(); } catch { /* ignore */ } };
  const saveIntention = async () => { try { await base44.entities.WakeSession.update(session.id, { intention }); setShowIntention(false); await load(); } catch { /* ignore */ } };
  const endWake = async () => { try { await base44.entities.WakeSession.update(session.id, { phase: "getup", status: "completed" }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Wake</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{session ? "Good morning" : "Start je dag"}</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{session ? `Phase: ${phase.toUpperCase()}` : "Nog geen wake sessie vandaag."}</p>
      </div>

      {/* Phase progress */}
      {session && (
        <div className="glass-card-2 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2">
            {PHASES.map((p, i) => (
              <div key={p} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: i <= phaseIdx ? SAGE : "rgba(255,255,255,0.15)" }} />
                <span className="text-[9px] uppercase tracking-wide text-ivory/55 font-semibold">{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <button onClick={saveIntention} disabled={!intention.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAGE }}><Sparkles className="w-4 h-4" /> Stel in</button>
            </div>
          ) : (
            <button onClick={() => setShowIntention(true)} className="text-sm font-semibold" style={{ color: SAGE }}>+ Stel intentie in</button>
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