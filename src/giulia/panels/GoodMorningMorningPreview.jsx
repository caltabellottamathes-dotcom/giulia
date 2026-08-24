import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DEEP, MID, URG, Ring, PaceGauge, SegmentedBar, SectionLabel, Card, Chip, hhmm, fmtMin, clamp01 } from "./goodMorning/gmKit";
import { ArrowRight } from "lucide-react";

/** Good Morning — TAB 01 · MORNING.
 *  Samenvatting van de laatst voltooide ochtend (laatste WakeSession met
 *  session_status === "completed"). Levert context + actie via onFooter. */
export default function GoodMorningMorningPreview({ onOpen, onFooter }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [steps, setSteps] = useState([]);
  const [avgTotal, setAvgTotal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [all, st] = await Promise.all([
        base44.entities.WakeSession.filter({ session_status: "completed" }, "-date", 12).catch(() => []),
        base44.entities.MorningRoutineStep.filter({ enabled: true, phase: "routine" }, "order", 12).catch(() => []),
      ]);
      const latest = all?.[0] || null;
      setSession(latest);
      setSteps(st || []);
      if (all?.length > 1) {
        const totals = all.slice(1).map(totalOf).filter((x) => x > 0);
        setAvgTotal(totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : null);
      }
    } catch { setSession(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // ── derived ──
  const total = totalOf(session);
  const scheduledWake = session?.scheduled_wake_time || session?.wake_time || null;
  const actualWake = session?.actual_wake_time || scheduledWake;
  const readyAt = session?.completion_time || (actualWake ? new Date(new Date(actualWake).getTime() + total * 60000).toISOString() : null);

  const t = (iso) => (iso ? new Date(iso).getTime() : 0);
  const wakeT = t(actualWake);
  const getUpT = wakeT + (session?.wake_duration || 0) * 60000;
  const routineT = getUpT + (session?.orient_duration || 0) * 60000 + (session?.get_up_duration || 0) * 60000;
  const readyT = t(readyAt) || (routineT + (session?.routine_duration || 0) * 60000);

  const nodes = [
    { label: "WAKE", time: actualWake, dur: session?.wake_duration },
    { label: "GET UP", time: getUpT ? new Date(getUpT).toISOString() : null, dur: session?.get_up_duration },
    { label: "ROUTINE", time: routineT ? new Date(routineT).toISOString() : null, dur: session?.routine_duration },
    { label: "READY", time: readyT ? new Date(readyT).toISOString() : null, dur: null },
  ];

  const completed = session?.routine_steps_completed || 0;
  const skipped = session?.routine_steps_skipped || 0;
  const totalSteps = steps.length || (completed + skipped) || 5;
  const routinePct = totalSteps ? completed / totalSteps : 0;

  // pace: this total vs average
  const pace = avgTotal ? clamp01(total / avgTotal) : 0.6;
  const delta = avgTotal ? Math.round(total - avgTotal) : 0;
  const runningLate = delta > 5;

  // footer
  useEffect(() => {
    if (loading) return;
    onFooter?.({
      context: [
        { label: "WAKE", text: scheduledWake ? `Started at ${hhmm(scheduledWake)}.` : "Geen sessie geregistreerd." },
        { label: "READY", text: delta === 0 ? "Op je gebruikelijke tijd klaar." : `Ready ${Math.abs(delta)} min ${delta > 0 ? "later" : "eerder"} than usual.` },
        { label: "ROUTINE", text: skipped > 0 ? `${skipped} optional step${skipped > 1 ? "s" : ""} skipped.` : "Alle stappen voltooid." },
      ],
      actions: [
        { label: "Open Morning Briefing", primary: true, onClick: () => { onOpen?.(); navigate("/briefing"); } },
      ],
    });
  }, [loading, session, delta, skipped, onOpen]);

  if (loading) return <p className="text-storm/40 text-sm py-4">Ochtend laden…</p>;
  if (!session) return <p className="text-storm/40 text-sm py-4">Nog geen voltooide ochtend.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4 h-full overflow-auto pr-1">
      {/* ── LEFT COLUMN ── */}
      <div className="flex flex-col gap-4 min-h-0">
        {/* Wake Journey */}
        <Card className="!p-5">
          <SectionLabel>WAKE JOURNEY</SectionLabel>
          <div className="flex items-end justify-between px-1 pb-1">
            {nodes.slice(0, -1).map((n, i) => (
              <span key={i} className="text-[10px] tracking-[0.14em] text-storm/45">
                {n.dur ? `+${fmtMin(n.dur).replace(" MIN", "")}m` : ""}
              </span>
            ))}
          </div>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-[18px] h-px" style={{ background: `${DEEP}33` }} />
            {nodes.map((n, i) => (
              <div key={i} className="relative flex flex-col items-center z-10">
                <span className="h-9 w-9 rounded-full border-2 flex items-center justify-center bg-marble/95"
                  style={{ borderColor: i === 3 ? DEEP : MID }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: i === 3 ? DEEP : MID }} />
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2.5">
            {nodes.map((n, i) => (
              <div key={i} className="flex flex-col items-center text-center" style={{ flex: 1 }}>
                <p className="text-[9px] tracking-[0.16em] text-storm/55 font-semibold">{n.label}</p>
                <p className="text-[12px] tabular-nums text-storm mt-0.5">{n.time ? hhmm(n.time) : "—"}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Wake comparison */}
        <Card>
          <SectionLabel>TODAY'S WAKE</SectionLabel>
          <div className="flex items-center justify-center gap-5">
            <div className="flex flex-col items-center">
              <p className="text-storm text-[26px] font-display font-semibold tabular-nums leading-none">{hhmm(scheduledWake)}</p>
              <p className="text-[9px] tracking-[0.2em] text-storm/50 mt-1.5">SCHEDULED</p>
            </div>
            <div className="flex flex-col items-center text-storm/40">
              <span className="text-lg leading-none">↓</span>
              <span className="text-[9px] tracking-[0.14em] mt-1">{delta > 0 ? `+${delta}m` : delta < 0 ? `${delta}m` : "on time"}</span>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-storm text-[26px] font-display font-semibold tabular-nums leading-none">{hhmm(readyAt)}</p>
              <p className="text-[9px] tracking-[0.2em] text-storm/50 mt-1.5">READY</p>
            </div>
          </div>
        </Card>

        {/* Morning Quality / Pace */}
        <Card>
          <SectionLabel right={<Chip color={runningLate ? URG : DEEP}>{runningLate ? "RUNNING LATE" : "ON TIME"}</Chip>}>MORNING QUALITY</SectionLabel>
          <PaceGauge value={pace} urgent={runningLate} />
        </Card>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="flex flex-col gap-4 min-h-0">
        <Card className="flex flex-col items-center !py-5">
          <SectionLabel>SESSION</SectionLabel>
          <Ring value={clamp01(total / 45)} size={132} label={fmtMin(total)} sub="WAKE → READY" subSize={8} />
        </Card>

        <Card>
          <SectionLabel>ROUTINE</SectionLabel>
          <p className="text-storm text-[28px] font-display font-semibold leading-none">{completed} <span className="text-storm/35">/ {totalSteps}</span></p>
          <p className="text-[9px] tracking-[0.2em] text-storm/55 mt-1">STEPS COMPLETED</p>
          <div className="mt-3">
            <SegmentedBar segments={totalSteps} active={completed} skipped={skipped} />
          </div>
          {skipped > 0 && <p className="text-[10px] text-storm/55 mt-2">{skipped} skipped</p>}
        </Card>

        <Card onClick={onOpen} className="flex items-center justify-between">
          <div>
            <p className="text-[9px] tracking-[0.2em] text-storm/55 font-semibold">SNOOZE</p>
            <p className="text-storm text-[22px] font-display font-semibold leading-none mt-1">{session?.snooze_count || 0}×</p>
            <p className="text-[10px] text-storm/55 mt-0.5">{fmtMin(session?.snooze_duration)}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-storm/30" />
        </Card>
      </div>
    </div>
  );
}

function totalOf(s) {
  if (!s) return 0;
  return (s.wake_duration || 0) + (s.orient_duration || 0) + (s.get_up_duration || 0) + (s.routine_duration || 0);
}