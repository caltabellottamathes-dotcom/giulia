import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { DEEP, MID, SectionLabel, Card, Chip, PrimaryAction } from "./goodMorning/gmKit";
import { Minus, Plus } from "lucide-react";

const DAYS = [
  { k: "mon", l: "M" }, { k: "tue", l: "T" }, { k: "wed", l: "W" },
  { k: "thu", l: "T" }, { k: "fri", l: "F" }, { k: "sat", l: "S" }, { k: "sun", l: "S" },
];
const STYLES = [{ k: "gentle", l: "GENTLE" }, { k: "normal", l: "STANDARD" }, { k: "direct", l: "DIRECT" }];
const SOUNDS = [
  { k: "silent", l: "SILENT" }, { k: "soft-chime", l: "CHIME" }, { k: "birds", l: "BIRDS" },
  { k: "waves", l: "WAVES" }, { k: "rain", l: "RAIN" }, { k: "ambient", l: "AMBIENT" },
];
const DEFAULTS = {
  enabled: true, wake_time: "07:30", days: ["mon", "tue", "wed", "thu", "fri"], wake_style: "gentle",
  alarm_sound: "silent", voice_enabled: true, gradual_wake: true,
  snooze_minutes: 5, max_snoozes: 3, briefing_after_routine: true,
};

/** Good Morning — TAB 03 · SETTINGS.
 *  Visueel configuratie-grid in één paneelhoogte. Draft-state; persisteert op Save. */
export default function GoodMorningSettingsPreview() {
  const { toast } = useToast();
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.MorningSettings.list().catch(() => []);
      const rec = list?.[0] || { ...DEFAULTS };
      setDraft(rec); setSaved(rec);
    } catch { const d = { ...DEFAULTS }; setDraft(d); setSaved(d); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    try {
      if (draft.id) await base44.entities.MorningSettings.update(draft.id, draft);
      else { const rec = await base44.entities.MorningSettings.create(draft); setDraft(rec); setSaved(rec); return; }
      setSaved(draft);
      toast({ title: "Opgeslagen", description: "Wake-instellingen bewaard." });
    } catch { toast({ title: "Fout", description: "Kon niet opslaan." }); }
  };

  if (loading || !draft) return <div className="h-full flex items-center justify-center text-storm/40 text-sm">Instellingen laden…</div>;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* WAKE TIME + DAYS */}
      <Card className="!p-4">
        <SectionLabel right={
          <button onClick={() => set({ enabled: !draft.enabled })}>
            <Chip color={draft.enabled ? DEEP : MID}>{draft.enabled ? "ALARM ON" : "ALARM OFF"}</Chip>
          </button>
        }>WAKE TIME</SectionLabel>
        <div className="flex items-center gap-5">
          <input type="time" value={draft.wake_time || ""} onChange={(e) => set({ wake_time: e.target.value })}
            className="bg-transparent text-storm text-[32px] font-display font-semibold leading-none tabular-nums outline-none" />
          <div className="flex items-center gap-1.5">
            {DAYS.map((d) => {
              const on = (draft.days || []).includes(d.k);
              return (
                <button key={d.k} onClick={() => set({ days: on ? (draft.days || []).filter((x) => x !== d.k) : [...(draft.days || []), d.k] })}
                  className="h-8 w-8 rounded-full text-[11px] font-semibold transition-all"
                  style={{ background: on ? DEEP : "transparent", color: on ? "#fff" : "rgba(60,63,38,0.4)", border: `1px solid ${on ? DEEP : "rgba(60,63,38,0.18)"}` }}>
                  {d.l}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ROW 2 */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <SectionLabel>WAKE STYLE</SectionLabel>
          <div className="flex gap-1.5">
            {STYLES.map((st) => {
              const on = (draft.wake_style || "gentle") === st.k;
              return (
                <button key={st.k} onClick={() => set({ wake_style: st.k })}
                  className="flex-1 rounded-xl py-2.5 text-[9px] tracking-[0.1em] font-semibold transition-all"
                  style={{ background: on ? DEEP : "transparent", color: on ? "#fff" : "rgba(60,63,38,0.55)", border: `1px solid ${on ? DEEP : "rgba(60,63,38,0.15)"}` }}>
                  {st.l}
                </button>
              );
            })}
          </div>
        </Card>
        <Card>
          <SectionLabel>SNOOZE</SectionLabel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-storm text-[20px] font-display font-semibold leading-none">{draft.snooze_minutes || 0}<span className="text-[12px] text-storm/45 ml-1">MIN</span></p>
              <p className="text-[8px] tracking-[0.16em] text-storm/55 mt-1">INTERVAL</p>
            </div>
            <Stepper onPlus={() => set({ snooze_minutes: Math.min(30, (draft.snooze_minutes || 0) + 1) })} onMinus={() => set({ snooze_minutes: Math.max(1, (draft.snooze_minutes || 0) - 1) })} />
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-storm/10">
            <p className="text-[9px] tracking-[0.14em] text-storm/55 font-semibold">MAX SNOOZES</p>
            <div className="flex items-center gap-2">
              <span className="text-storm text-[14px] font-display font-semibold tabular-nums">{draft.max_snoozes || 0}</span>
              <Stepper onPlus={() => set({ max_snoozes: Math.min(5, (draft.max_snoozes || 0) + 1) })} onMinus={() => set({ max_snoozes: Math.max(0, (draft.max_snoozes || 0) - 1) })} small />
            </div>
          </div>
        </Card>
        <Card>
          <SectionLabel>ALARM SOUND</SectionLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {SOUNDS.map((s) => {
              const on = (draft.alarm_sound || "silent") === s.k;
              return (
                <button key={s.k} onClick={() => set({ alarm_sound: s.k })}
                  className="rounded-lg py-2 text-[9px] tracking-[0.06em] font-semibold transition-all"
                  style={{ background: on ? DEEP : "transparent", color: on ? "#fff" : "rgba(60,63,38,0.5)", border: `1px solid ${on ? DEEP : "rgba(60,63,38,0.15)"}` }}>
                  {s.l}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ROW 3 */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col justify-center">
          <SectionLabel>VOICE</SectionLabel>
          <ToggleRow label="Voice guidance" on={!!draft.voice_enabled} onChange={(v) => set({ voice_enabled: v })} />
        </Card>
        <Card className="flex flex-col justify-center">
          <SectionLabel>GRADUAL WAKE</SectionLabel>
          <ToggleRow label="Fade-in wake" on={!!draft.gradual_wake} onChange={(v) => set({ gradual_wake: v })} />
        </Card>
        <Card>
          <SectionLabel>AFTER READY</SectionLabel>
          <div className="flex flex-col gap-1.5">
            <RadioRow active={!draft.briefing_after_routine} onClick={() => set({ briefing_after_routine: false })} label="Stay on dashboard" />
            <RadioRow active={!!draft.briefing_after_routine} onClick={() => set({ briefing_after_routine: true })} label="Open Morning Briefing" />
          </div>
        </Card>
      </div>

      {/* ADAPTIVE */}
      <Card className="flex items-center">
        <div>
          <SectionLabel right={<Chip color={DEEP}>ON</Chip>}>ADAPTIVE ROUTINE</SectionLabel>
          <p className="text-storm/65 text-[11px] leading-relaxed">Optional steps skip automatically when time is limited. Configure which steps are optional in the Routine tab.</p>
        </div>
      </Card>

      <PrimaryAction label="Save Changes" onClick={save} />
    </div>
  );
}

function Stepper({ onPlus, onMinus, small }) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onMinus} className={`rounded-full flex items-center justify-center transition-colors ${small ? "h-6 w-6" : "h-8 w-8"}`}
        style={{ border: "1px solid rgba(60,63,38,0.18)", color: DEEP }}>
        <Minus className="h-3 w-3" />
      </button>
      <button onClick={onPlus} className={`rounded-full flex items-center justify-center transition-colors ${small ? "h-6 w-6" : "h-8 w-8"}`}
        style={{ background: DEEP, color: "#fff" }}>
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

function ToggleRow({ label, on, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-storm text-[12px] font-medium">{label}</p>
      <button onClick={() => onChange(!on)} className="relative h-6 w-11 rounded-full transition-colors"
        style={{ background: on ? DEEP : "rgba(60,63,38,0.2)" }}>
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: on ? "calc(100% - 22px)" : "2px" }} />
      </button>
    </div>
  );
}

function RadioRow({ active, onClick, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 text-left">
      <span className="h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: active ? DEEP : "rgba(60,63,38,0.3)" }}>
        {active && <span className="h-2 w-2 rounded-full" style={{ background: DEEP }} />}
      </span>
      <span className="text-storm text-[11px] leading-tight">{label}</span>
    </button>
  );
}