import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  DEEP, MID, URG, LIGHT, Ring, PaceGauge, SegmentedBar,
  SectionLabel, Card, Chip, PrimaryAction, hhmm, fmtMin, clamp01,
} from "./goodMorning/gmKit";

/** Good Morning — TAB 01 · MORNING.
 *  Visuele samenvatting van de laatst voltooide WakeSession in één paneelhoogte. */
export default function GoodMorningMorningPreview() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [steps, setSteps] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(null);

  const load = async () => {
    try {
      const [all, st] = await Promise.all([
        base44.entities.WakeSession.filter({ session_status: "completed" }, "-date", 8).catch(() => []),
        base44.entities.MorningRoutineStep.filter({ enabled: true, phase: "routine" }, "order", 12).catch(() => []),
      ]);
      setSession(all?.[0] || null);
      setSteps(st || []);
      setHistory((all || []).slice(1).map(totalOf).filter((x) => x > 0));
    } catch { setSession(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const total = totalOf(session);
  const avgTotal = history.length ? history.reduce((a, b) => a + b, 0) / history.length : null;
  const scheduledWake = session?.scheduled_wake_time || session?.wake_time || null;
  const actualWake = session?.actual_wake_time || scheduledWake;
  const readyAt = session?.completion_time || (actualWake ? new Date(new Date(actualWake).getTime() + total * 60000).toISOString() : null);

  const t = (iso) => (iso ? new Date(iso).getTime() : 0);
  const wakeT = t(actualWake);
  const getUpT = wakeT + (session?.wake_duration || 0) * 60000;
  const routineT = getUpT + (session?.orient_duration || 0) * 60000 + (session?.get_up_duration || 0) * 60000;
  const readyT = t(readyAt) || (routineT + (session?.routine_duration || 0) * 60000);

  const nodes = [
    { key: "wake", label: "WAKE", time: actualWake, dur: session?.wake_duration },
    { key: "getup", label: "GET UP", time: getUpT ? new Date(getUpT).toISOString() : null, dur: session?.get_up_duration },
    { key: "routine", label: "ROUTINE", time: routineT ? new Date(routineT).toISOString() : null, dur: session?.routine_duration },
    { key: "ready", label: "READY", time: readyT ? new Date(readyT).toISOString() : null, dur: null },
  ];

  const completed = session?.routine_steps_completed || 0;
  const skipped = session?.routine_steps_skipped || 0;
  const totalSteps = steps.length || (completed + skipped) || 5;

  const pace = avgTotal ? clamp01(total / avgTotal) : 0.5;
  const delta = avgTotal ? Math.round(total - avgTotal) : 0;
  const runningLate = delta > 5;
  const snoozeCount = session?.snooze_count || 0;
  const snoozeDur = session?.snooze_duration || 0;
  const maxHist = Math.max(total, ...history, 1);

  if (loading) return <div className="h-full flex items-center justify-center text-storm/40 text-sm">Ochtend laden…</div>;
  if (!session) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <p className="text-storm/40 text-sm">Nog geen voltooide ochtend.</p>
      <PrimaryAction label="Start Good Morning" onClick={() => navigate("/wake")} />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-3">
      {/* WAKE JOURNEY */}
      <Card className="!p-4">
        <SectionLabel right={<Chip color={runningLate ? URG : DEEP}>{runningLate ? "RUNNING LATE" : "ON TIME"}</Chip>}>WAKE JOURNEY</SectionLabel>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-[15px] h-px" style={{ background: `${DEEP}33` }} />
          {nodes.map((n) => {
            const isActive = activePhase === n.key;
            return (
              <button key={n.key} onClick={() => setActivePhase(isActive ? null : n.key)}
                className="relative flex flex-col items-center z-10 group">
                <span className="h-8 w-8 rounded-full border-2 flex items-center justify-center bg-marble/95 transition-transform group-hover:scale-110"
                  style={{ borderColor: n.key === "ready" ? DEEP : MID, boxShadow: isActive ? `0 0 0 3px ${LIGHT}` : "none" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: n.key === "ready" ? DEEP : MID }} />
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          {nodes.map((n) => (
            <div key={n.key} className="flex flex-col items-center text-center" style={{ flex: 1 }}>
              <p className="text-[9px] tracking-[0.16em] text-storm/55 font-semibold">{n.label}</p>
              <p className="text-[11px] tabular-nums text-storm mt-0.5">{n.time ? hhmm(n.time) : "—"}</p>
            </div>
          ))}
        </div>
        {activePhase && (
          <div className="mt-2 pt-2 border-t border-storm/10 text-[11px] text-storm/65">
            {(() => {
              const n = nodes.find((x) => x.key === activePhase);
              return n?.dur != null ? `${n.label} phase · ${fmtMin(n.dur).replace(" MIN", " min")}` : `${n?.label} — voltooid`;
            })()}
          </div>
        )}
      </Card>

      {/* STAT ROW */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="flex flex-col items-center !py-3">
          <SectionLabel>SESSION</SectionLabel>
          <Ring value={clamp01(total / 45)} size={84} label={fmtMin(total)} sub="TOTAL" subSize={7} />
        </Card>
        <Card className="flex flex-col justify-center">
          <SectionLabel>SNOOZE</SectionLabel>
          <p className="text-storm text-[24px] font-display font-semibold leading-none">{snoozeCount}<span className="text-storm/35 text-[13px]">×</span></p>
          <p className="text-[9px] tracking-[0.18em] text-storm/55 mt-1.5">{fmtMin(snoozeDur)}</p>
        </Card>
        <Card className="flex flex-col justify-center">
          <SectionLabel>ROUTINE</SectionLabel>
          <p className="text-storm text-[24px] font-display font-semibold leading-none">{completed}<span className="text-storm/35 text-[13px]"> / {totalSteps}</span></p>
          <div className="mt-2"><SegmentedBar segments={totalSteps} active={completed} skipped={skipped} /></div>
        </Card>
        <Card className="flex flex-col justify-center">
          <SectionLabel>PACE</SectionLabel>
          <div className="mt-1"><PaceGauge value={pace} urgent={runningLate} /></div>
        </Card>
      </div>

      {/* COMPARISON ROW */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        <Card className="flex flex-col">
          <SectionLabel>TODAY'S WAKE</SectionLabel>
          <div className="flex items-center justify-center gap-4 flex-1">
            <div className="flex flex-col items-center">
              <p className="text-storm text-[20px] font-display font-semibold tabular-nums leading-none">{hhmm(scheduledWake)}</p>
              <p className="text-[9px] tracking-[0.2em] text-storm/50 mt-1.5">SCHEDULED</p>
            </div>
            <div className="flex flex-col items-center text-storm/40">
              <span className="text-[9px] tracking-[0.14em]">{delta > 0 ? `+${delta}m` : delta < 0 ? `${delta}m` : "on time"}</span>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-storm text-[20px] font-display font-semibold tabular-nums leading-none">{hhmm(readyAt)}</p>
              <p className="text-[9px] tracking-[0.2em] text-storm/50 mt-1.5">READY</p>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col">
          <SectionLabel right={<Chip color={MID}>{history.length} PRIOR</Chip>}>PATTERNS</SectionLabel>
          <div className="flex items-end gap-1.5 flex-1 pt-1 min-h-0">
            {[...history].reverse().map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.max(6, (h / maxHist) * 100)}%`, background: i === history.length - 1 ? MID : `${MID}66` }} />
            ))}
            <div className="flex-1 rounded-t-md" style={{ height: `${Math.max(6, (total / maxHist) * 100)}%`, background: DEEP }} />
          </div>
          <p className="text-[10px] text-storm/55 mt-1.5">
            {avgTotal ? `Avg ${Math.round(avgTotal)} min · ${delta === 0 ? "op tijd" : delta > 0 ? `${delta}m trager` : `${Math.abs(delta)}m sneller`}` : "Eerste sessie"}
          </p>
        </Card>
      </div>

      <PrimaryAction label="Open Morning Briefing" onClick={() => navigate("/briefing")} />
    </div>
  );
}

function totalOf(s) {
  if (!s) return 0;
  return (s.wake_duration || 0) + (s.orient_duration || 0) + (s.get_up_duration || 0) + (s.routine_duration || 0);
}