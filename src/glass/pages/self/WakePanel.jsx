import React, { useEffect, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";

const PHASE_ORDER = ["wake", "orient", "routine", "getup", "briefing", "complete"];
const PHASE_LABEL = { wake: "WAKE", orient: "ORIENT", routine: "ROUTINE", getup: "GET UP", briefing: "BRIEFING", complete: "COMPLETE", snoozed: "SNOOZED" };

export default function WakePanel() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.WakeSession.list("-created_date", 5).then((s) => setSession((s || [])[0])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const phase = session?.phase || "wake";
  const currentIdx = Math.max(0, PHASE_ORDER.indexOf(phase));
  const pct = Math.round(((currentIdx + 1) / PHASE_ORDER.length) * 100);
  const isComplete = phase === "complete" || session?.status === "completed";

  const PHASES = ["wake", "orient", "routine", "getup"].map((p) => ({
    label: PHASE_LABEL[p],
    state: currentIdx > PHASE_ORDER.indexOf(p) || isComplete ? "DONE" : p === phase && !isComplete ? "NOW" : PHASE_ORDER.indexOf(p) < currentIdx ? "DONE" : "—",
  }));

  const stepCount = session?.completed_steps?.length || currentIdx;
  const METRICS = [
    { l: "WAKE TIME", v: session?.wake_time || "—" },
    { l: "SNOOZED", v: `${session?.snooze_count || 0}×` },
    { l: "STEPS", v: `${stepCount}/${PHASE_ORDER.length}` },
    { l: "STATUS", v: isComplete ? "DONE" : phase.toUpperCase() },
  ];

  if (loading) return <PanelShell index="03" section="GOOD MORNING" statement="LADEN…">{null}</PanelShell>;

  const r = 96, c = 2 * Math.PI * r;

  return (
    <PanelShell
      index="03"
      section="GOOD MORNING"
      statement={isComplete ? "COMPLETE" : PHASE_LABEL[phase]}
      context={[
        { label: "CURRENT PHASE", text: isComplete ? "Wake Mode afgerond — je dag is begonnen." : `${PHASE_LABEL[phase]} fase loopt, ${pct}% voltooid.` },
        { label: "WAKE TIME", text: session?.wake_time ? `Gepland om ${session.wake_time}.` : "Geen wake time ingesteld." },
        { label: "MORNING CONTEXT", text: session?.morning_context || "Geen ochtend-context vastgelegd." },
      ]}
      actions={[
        { label: "Open Wake", primary: true, to: "/self/wake" },
        { label: "Start Wake Mode", to: "/wake" },
      ]}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-72 h-72">
          <div className="absolute inset-8 rounded-full" style={{ background: "rgba(225,231,239,0.15)", filter: "blur(28px)" }} />
          <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={r} fill="none" stroke={TRACK} strokeWidth="6" />
            <circle cx="100" cy="100" r={r} fill="none" stroke={BLUE} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
            {[...Array(40)].map((_, i) => {
              const a = (i / 40) * 2 * Math.PI;
              return <line key={i} x1={100 + Math.cos(a) * 108} y1={100 + Math.sin(a) * 108} x2={100 + Math.cos(a) * 114} y2={100 + Math.sin(a) * 114} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-storm text-6xl font-bold tabular-nums leading-none">{pct}<span className="text-3xl">%</span></span>
            <span className="text-[11px] tracking-[0.3em] mt-3" style={{ color: SAND }}>{PHASE_LABEL[phase]}</span>
          </div>
        </div>

        <div className="mt-10 w-full max-w-xl">
          <div className="relative">
            <div className="absolute top-4 left-6 right-6 h-1 rounded-full bg-marble/15" />
            <div className="absolute top-4 left-6 h-1 rounded-full" style={{ width: `${(currentIdx / (PHASES.length - 1)) * (100 - 12)}%`, background: BLUE }} />
            <div className="flex justify-between relative">
              {PHASES.map((p) => {
                const done = p.state === "DONE";
                const current = p.state === "NOW";
                return (
                  <div key={p.label} className="flex flex-col items-center gap-3 z-10">
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${current ? "animate-pulse" : done ? "" : "bg-marble/10 border-marble/30"}`} style={{ background: current ? SAND : done ? BLUE : "transparent", borderColor: current ? SAND : done ? BLUE : "rgba(255,255,255,0.3)" }} />
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${current ? "" : done ? "text-storm" : "text-storm/60"}`} style={current ? { color: SAND } : {}}>{p.label}</p>
                      <p className={`text-[9px] tracking-[0.2em] mt-1 ${current ? "" : "text-storm/40"}`} style={current ? { color: SAND } : {}}>{p.state}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
          {METRICS.map((m) => (
            <div key={m.l} className="rounded-2xl border border-marble/20 bg-marble/5 p-4 text-center">
              <p className="text-storm text-xl font-semibold tabular-nums">{m.v}</p>
              <p className="text-storm/50 text-[9px] tracking-[0.2em] mt-1.5">{m.l}</p>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}