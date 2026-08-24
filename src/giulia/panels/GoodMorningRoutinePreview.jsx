import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { DEEP, MID, Ring, SectionLabel, Card, Chip, fmtMin, clamp01, stepIcon } from "./goodMorning/gmKit";
import { Mic, ArrowRight } from "lucide-react";

/** Good Morning — TAB 02 · ROUTINE.
 *  Visueel overzicht van het ochtendritueel (MorningRoutineStep, phase routine).
 *  Levert context + actie via onFooter. */
export default function GoodMorningRoutinePreview({ onOpen, onFooter }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.MorningRoutineStep.filter({ phase: "routine" }, "order", 20).catch(() => []);
      setSteps((list || []).filter((s) => s.enabled));
    } catch { setSteps([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const total = steps.reduce((a, s) => a + (s.duration_minutes || 0), 0);
  const required = steps.filter((s) => !s.optional).length;
  const optional = steps.length - required;

  useEffect(() => {
    if (loading) return;
    onFooter?.({
      context: [
        { label: "STEPS", text: `${steps.length || "—"} steps in your morning.` },
        { label: "DURATION", text: `Approximately ${total || "—"} minutes.` },
        { label: "ADAPTIVE", text: "Optional steps can be removed when needed." },
      ],
      actions: [
        { label: "Edit Routine", primary: true, onClick: () => { onOpen?.(); }, to: "/wake" },
      ],
    });
  }, [loading, steps, total, onOpen]);

  if (loading) return <p className="text-storm/40 text-sm py-4">Routine laden…</p>;
  if (steps.length === 0) return <p className="text-storm/40 text-sm py-4">Nog geen ochtendritueel.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4 h-full overflow-auto pr-1">
      {/* LEFT */}
      <div className="flex flex-col gap-4 min-h-0">
        {/* Routine Flow */}
        <Card className="!p-5">
          <SectionLabel>ROUTINE FLOW</SectionLabel>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-[18px] h-px" style={{ background: `${DEEP}33` }} />
            {steps.map((s, i) => {
              const Icon = stepIcon(s.title);
              return (
                <div key={s.id} className="relative flex flex-col items-center z-10">
                  <span className="h-9 w-9 rounded-full border-2 flex items-center justify-center bg-marble/95"
                    style={{ borderColor: s.optional ? MID : DEEP }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: s.optional ? MID : DEEP }} />
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2.5">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center text-center" style={{ flex: 1 }}>
                <p className="text-[9px] tracking-[0.16em] text-storm/55 font-semibold">{String(i + 1).padStart(2, "0")}</p>
                <p className="text-[10px] text-storm/70 mt-0.5 truncate max-w-[64px]">{s.duration_minutes ? `${s.duration_minutes}m` : "—"}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Routine Step Cards */}
        <div>
          <SectionLabel>ROUTINE STEPS</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {steps.map((s, i) => {
              const Icon = stepIcon(s.title);
              return (
                <Card key={s.id} onClick={onOpen} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.16em] text-storm/40 font-semibold">{String(i + 1).padStart(2, "0")}</span>
                    {s.optional
                      ? <Chip color={MID}>OPTIONAL</Chip>
                      : <Chip color={DEEP}>REQUIRED</Chip>}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${DEEP}1a` }}>
                      <Icon className="h-4 w-4" style={{ color: DEEP }} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-storm text-[13px] font-medium leading-tight truncate">{s.title}</p>
                      <p className="text-[10px] text-storm/55 mt-0.5">{fmtMin(s.duration_minutes)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-storm/35 mt-auto">
                    <Mic className="h-3 w-3" />
                    <span className="text-[9px] tracking-[0.12em]">VOICE</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-4 min-h-0">
        <Card className="flex flex-col items-center !py-5">
          <SectionLabel>TOTAL</SectionLabel>
          <Ring value={clamp01(total / 60)} size={132} label={fmtMin(total)} sub="TOTAL ROUTINE" subSize={8} />
          <div className="flex flex-col items-center gap-1 mt-3">
            <p className="text-[11px] text-storm/70"><span className="font-semibold text-storm">{steps.length}</span> STEPS</p>
            <p className="text-[11px] text-storm/70"><span className="font-semibold text-storm">{required}</span> REQUIRED</p>
          </div>
        </Card>

        <Card>
          <SectionLabel right={<Chip color={DEEP}>ON</Chip>}>ADAPTIVE</SectionLabel>
          <p className="text-storm/70 text-[11px] leading-relaxed">
            Optional steps may be skipped when your morning is running tight.
          </p>
        </Card>
      </div>
    </div>
  );
}