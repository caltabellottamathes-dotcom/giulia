import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  DEEP, MID, Ring, SectionLabel, Card, Chip, PrimaryAction, stepIcon, fmtMin, clamp01,
} from "./goodMorning/gmKit";
import { Mic, Plus, Trash2, ChevronUp, ChevronDown, Power } from "lucide-react";

/** Good Morning — TAB 02 · ROUTINE.
 *  Visueel grid van interactieve routine-stappen in één paneelhoogte. */
export default function GoodMorningRoutinePreview({ onOpen }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const list = await base44.entities.MorningRoutineStep.filter({ phase: "routine" }, "order", 20).catch(() => []);
      setSteps(list || []);
    } catch { setSteps([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const total = steps.reduce((a, s) => a + (s.duration_minutes || 0), 0);
  const enabledSteps = steps.filter((s) => s.enabled);
  const required = enabledSteps.filter((s) => !s.optional).length;
  const optional = enabledSteps.length - required;

  const updateLocal = (id, patch) => setSteps((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x));
  const persist = (id, patch) => base44.entities.MorningRoutineStep.update(id, patch).catch(() => {});

  const toggleOptional = (s) => { updateLocal(s.id, { optional: !s.optional }); persist(s.id, { optional: !s.optional }); };
  const toggleEnabled = (s) => { updateLocal(s.id, { enabled: !s.enabled }); persist(s.id, { enabled: !s.enabled }); };
  const setDuration = (s, d) => { const v = Math.max(1, d); updateLocal(s.id, { duration_minutes: v }); persist(s.id, { duration_minutes: v }); };
  const rename = (s, title) => { updateLocal(s.id, { title }); persist(s.id, { title }); };

  const addStep = async () => {
    await base44.entities.MorningRoutineStep.create({ title: "New Step", phase: "routine", order: steps.length, enabled: true, optional: false, duration_minutes: 5 }).catch(() => {});
    load();
  };
  const deleteStep = async (id) => { await base44.entities.MorningRoutineStep.delete(id).catch(() => {}); load(); };
  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return;
    const a = steps[idx], b = steps[j];
    await Promise.all([persist(a.id, { order: j }), persist(b.id, { order: idx })]);
    load();
  };

  if (loading) return <div className="h-full flex items-center justify-center text-storm/40 text-sm">Routine laden…</div>;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* ROUTINE FLOW */}
      <Card className="!p-4">
        <SectionLabel right={<Chip color={DEEP}>{enabledSteps.length} STEPS</Chip>}>ROUTINE FLOW</SectionLabel>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-[15px] h-px" style={{ background: `${DEEP}33` }} />
          {steps.map((s) => {
            const Icon = stepIcon(s.title);
            return (
              <div key={s.id} className="relative flex flex-col items-center z-10" style={{ opacity: s.enabled ? 1 : 0.35 }}>
                <span className="h-8 w-8 rounded-full border-2 flex items-center justify-center bg-marble/95"
                  style={{ borderColor: s.optional ? MID : DEEP }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: s.optional ? MID : DEEP }} />
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center text-center" style={{ flex: 1, opacity: s.enabled ? 1 : 0.35 }}>
              <p className="text-[9px] tracking-[0.16em] text-storm/55 font-semibold">{String(i + 1).padStart(2, "0")}</p>
              <p className="text-[10px] text-storm/70 mt-0.5 truncate max-w-[72px]">{s.duration_minutes ? `${s.duration_minutes}m` : "—"}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col items-center !py-3">
          <SectionLabel>TOTAL</SectionLabel>
          <Ring value={clamp01(total / 60)} size={84} label={fmtMin(total)} sub="DURATION" subSize={7} />
        </Card>
        <Card className="flex flex-col justify-center">
          <SectionLabel>BREAKDOWN</SectionLabel>
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-storm/70"><span className="font-semibold text-storm">{required}</span> required</p>
            <p className="text-[11px] text-storm/70"><span className="font-semibold text-storm">{optional}</span> optional</p>
            <p className="text-[11px] text-storm/70"><span className="font-semibold text-storm">{enabledSteps.length}</span> active</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-center">
          <SectionLabel right={<Chip color={DEEP}>ON</Chip>}>ADAPTIVE</SectionLabel>
          <p className="text-storm/65 text-[11px] leading-relaxed">Optional steps skip automatically when your morning is running tight.</p>
        </Card>
      </div>

      {/* STEP CARDS */}
      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden content-start">
        {steps.map((s, i) => {
          const Icon = stepIcon(s.title);
          const isEditing = editing === s.id;
          return (
            <Card key={s.id} className="flex flex-col gap-2 !p-3" style={{ opacity: s.enabled ? 1 : 0.55 }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-[0.16em] text-storm/40 font-semibold">{String(i + 1).padStart(2, "0")}</span>
                <button onClick={() => toggleOptional(s)}>
                  {s.optional ? <Chip color={MID}>OPTIONAL</Chip> : <Chip color={DEEP}>REQUIRED</Chip>}
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${DEEP}1a` }}>
                  <Icon className="h-4 w-4" style={{ color: DEEP }} />
                </span>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input autoFocus value={s.title}
                      onChange={(e) => updateLocal(s.id, { title: e.target.value })}
                      onBlur={() => { rename(s, s.title); setEditing(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { rename(s, s.title); setEditing(null); } }}
                      className="w-full bg-transparent text-storm text-[12px] font-medium outline-none border-b border-storm/20" />
                  ) : (
                    <button onClick={() => setEditing(s.id)} className="text-left w-full">
                      <p className="text-storm text-[12px] font-medium leading-tight truncate">{s.title}</p>
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <button onClick={() => setDuration(s, (s.duration_minutes || 5) - 1)}
                      className="h-5 w-5 rounded-full flex items-center justify-center text-storm/55 hover:bg-marble/20"
                      style={{ border: `1px solid ${DEEP}22` }}>
                      <span className="text-[11px] leading-none">−</span>
                    </button>
                    <span className="text-[11px] text-storm tabular-nums w-10 text-center">{s.duration_minutes || 0}m</span>
                    <button onClick={() => setDuration(s, (s.duration_minutes || 5) + 1)}
                      className="h-5 w-5 rounded-full flex items-center justify-center text-storm/55 hover:bg-marble/20"
                      style={{ border: `1px solid ${DEEP}22` }}>
                      <span className="text-[11px] leading-none">+</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-storm/10">
                <div className="flex items-center gap-1 text-storm/35">
                  <Mic className="h-3 w-3" /><span className="text-[8px] tracking-[0.12em]">VOICE</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => toggleEnabled(s)} className="h-6 w-6 rounded-full flex items-center justify-center text-storm/55 hover:bg-marble/20" title="Enable/disable">
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="h-6 w-6 rounded-full flex items-center justify-center text-storm/55 hover:bg-marble/20 disabled:opacity-25">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === steps.length - 1} className="h-6 w-6 rounded-full flex items-center justify-center text-storm/55 hover:bg-marble/20 disabled:opacity-25">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteStep(s.id)} className="h-6 w-6 rounded-full flex items-center justify-center text-storm/55 hover:bg-marble/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        <button onClick={addStep}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-storm/50 hover:text-storm transition-colors"
          style={{ borderColor: `${DEEP}33` }}>
          <Plus className="h-5 w-5" />
          <span className="text-[10px] tracking-[0.14em] font-semibold">ADD STEP</span>
        </button>
      </div>

      <PrimaryAction label="Edit Routine" onClick={() => onOpen?.()} />
    </div>
  );
}