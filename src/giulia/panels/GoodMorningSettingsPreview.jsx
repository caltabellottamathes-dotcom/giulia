import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { DEEP, SectionLabel, Card, Chip } from "./goodMorning/gmKit";
import { ArrowRight, Minus, Plus } from "lucide-react";

const DAYS = [
  { k: "mon", l: "M" }, { k: "tue", l: "T" }, { k: "wed", l: "W" },
  { k: "thu", l: "T" }, { k: "fri", l: "F" }, { k: "sat", l: "S" }, { k: "sun", l: "S" },
];
const STYLES = [
  { k: "gentle", l: "GENTLE" },
  { k: "normal", l: "STANDARD" },
  { k: "direct", l: "DIRECT" },
];
const DEFAULTS = {
  wake_time: "07:30", days: ["mon", "tue", "wed", "thu", "fri"], wake_style: "gentle",
  voice_enabled: true, snooze_minutes: 5, max_snoozes: 2, briefing_after_routine: true, enabled: true,
};

/** Good Morning — TAB 03 · SETTINGS.
 *  Wekker-configuratie (MorningSettings). Levert context + actie via onFooter. */
export default function GoodMorningSettingsPreview({ onFooter }) {
  const { toast } = useToast();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.MorningSettings.list().catch(() => []);
      setS(list?.[0] || { ...DEFAULTS });
    } catch { setS({ ...DEFAULTS }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (next) => {
    setS(next);
    try {
      if (next.id) await base44.entities.MorningSettings.update(next.id, next);
      else { const rec = await base44.entities.MorningSettings.create(next); setS(rec); }
    } catch { /* ignore */ }
  };

  const toggleDay = (k) => {
    const days = (s.days || []).includes(k) ? (s.days || []).filter((d) => d !== k) : [...(s.days || []), k];
    save({ ...s, days });
  };
  const setStyle = (k) => save({ ...s, wake_style: k });
  const adj = (field, min, max, step = 1) => (dir) => {
    const v = Math.max(min, Math.min(max, (s[field] || 0) + dir * step));
    save({ ...s, [field]: v });
  };
  const setVoice = (v) => save({ ...s, voice_enabled: v });
  const setBriefing = (v) => save({ ...s, briefing_after_routine: v });

  useEffect(() => {
    if (loading || !s) return;
    onFooter?.({
      context: [
        { label: "WAKE", text: `${s.wake_time || "—"} on ${daySummary(s.days)}.` },
        { label: "STYLE", text: `${(STYLES.find((x) => x.k === s.wake_style) || STYLES[0]).l.toLowerCase()} wake.` },
        { label: "BRIEFING", text: s.briefing_after_routine ? "Opens Morning Briefing after ready." : "Stays on dashboard after ready." },
      ],
      actions: [
        { label: "Save", primary: true, onClick: () => { save(s); toast({ title: "Opgeslagen", description: "Wake-instellingen bewaard." }); } },
        { label: "Open Wake", to: "/wake" },
      ],
    });
  }, [loading, s, onFooter]);

  if (loading || !s) return <p className="text-storm/40 text-sm py-4">Instellingen laden…</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 h-full overflow-auto pr-1">
      {/* Wake Time */}
      <Card className="!p-5 lg:col-span-2">
        <SectionLabel>WAKE TIME</SectionLabel>
        <div className="flex items-center gap-5">
          <input
            type="time"
            value={s.wake_time || ""}
            onChange={(e) => save({ ...s, wake_time: e.target.value })}
            className="bg-transparent text-storm text-[40px] font-display font-semibold leading-none tabular-nums outline-none"
          />
          <div className="flex items-center gap-1.5">
            {DAYS.map((d) => {
              const on = (s.days || []).includes(d.k);
              return (
                <button key={d.k} onClick={() => toggleDay(d.k)}
                  className="h-8 w-8 rounded-full text-[11px] font-semibold transition-all"
                  style={{
                    background: on ? DEEP : "transparent",
                    color: on ? "#fff" : "rgba(60,63,38,0.4)",
                    border: `1px solid ${on ? DEEP : "rgba(60,63,38,0.18)"}`,
                  }}>
                  {d.l}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Wake Style */}
      <Card>
        <SectionLabel>WAKE STYLE</SectionLabel>
        <div className="flex gap-2">
          {STYLES.map((st) => {
            const on = (s.wake_style || "gentle") === st.k;
            return (
              <button key={st.k} onClick={() => setStyle(st.k)}
                className="flex-1 rounded-xl px-2 py-3 text-[10px] tracking-[0.12em] font-semibold transition-all"
                style={{
                  background: on ? DEEP : "transparent",
                  color: on ? "#fff" : "rgba(60,63,38,0.55)",
                  border: `1px solid ${on ? DEEP : "rgba(60,63,38,0.15)"}`,
                }}>
                <span className="block h-2 w-2 rounded-full mx-auto mb-1.5"
                  style={{ background: on ? "#fff" : "rgba(60,63,38,0.35)" }} />
                {st.l}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Snooze Control */}
      <Card>
        <SectionLabel>SNOOZE</SectionLabel>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-storm text-[26px] font-display font-semibold leading-none">{s.snooze_minutes || 0}<span className="text-[14px] text-storm/45 ml-1">MIN</span></p>
            <p className="text-[9px] tracking-[0.18em] text-storm/55 mt-1.5">MAX {s.max_snoozes || 0} TIMES</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Stepper onPlus={adj("snooze_minutes", 1, 30)} onMinus={adj("snooze_minutes", 1, 30, -1)} />
            <p className="text-[8px] tracking-[0.14em] text-storm/45">DURATION</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-storm/10">
          <p className="text-[10px] tracking-[0.14em] text-storm/55 font-semibold">MAX SNOOZES</p>
          <Stepper onPlus={adj("max_snoozes", 0, 5)} onMinus={adj("max_snoozes", 0, 5, -1)} small />
        </div>
      </Card>

      {/* Voice Control */}
      <Card>
        <SectionLabel>VOICE GUIDANCE</SectionLabel>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-storm text-[15px] font-medium">Voice recognition</p>
            <p className="text-[10px] text-storm/55 mt-0.5">Voice guidance during wake</p>
          </div>
          <Toggle on={s.voice_enabled} onChange={setVoice} />
        </div>
      </Card>

      {/* Briefing Transition */}
      <Card>
        <SectionLabel>AFTER READY</SectionLabel>
        <div className="flex flex-col gap-2">
          <RadioRow active={!s.briefing_after_routine} onClick={() => setBriefing(false)} label="Stay on dashboard" />
          <RadioRow active={s.briefing_after_routine} onClick={() => setBriefing(true)} label="Open Morning Briefing" />
        </div>
      </Card>

      {/* Routine Assignment */}
      <Card onClick={() => {}} className="!p-4 cursor-default">
        <SectionLabel>MORNING ROUTINE</SectionLabel>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-storm text-[15px] font-medium">Morning Routine</p>
            <p className="text-[10px] text-storm/55 mt-0.5">5 steps · ~32 min</p>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent("gm-go-routine"))}
            className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: DEEP }}>
            Edit <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </Card>

      {/* Adaptive Routine */}
      <Card className="lg:col-span-2">
        <SectionLabel right={<Chip color={DEEP}>ON</Chip>}>ADAPTIVE ROUTINE</SectionLabel>
        <p className="text-storm/70 text-[11px] leading-relaxed">
          Automatically skip optional routine steps when time is limited.
        </p>
      </Card>
    </div>
  );
}

function Stepper({ onPlus, onMinus, small }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onMinus} className={`rounded-full flex items-center justify-center transition-colors ${small ? "h-7 w-7" : "h-9 w-9"}`}
        style={{ border: "1px solid rgba(60,63,38,0.18)", color: DEEP }}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button onClick={onPlus} className={`rounded-full flex items-center justify-center transition-colors ${small ? "h-7 w-7" : "h-9 w-9"}`}
        style={{ background: DEEP, color: "#fff" }}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} className="relative h-7 w-12 rounded-full transition-colors"
      style={{ background: on ? DEEP : "rgba(60,63,38,0.2)" }}>
      <span className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all"
        style={{ left: on ? "calc(100% - 26px)" : "2px" }} />
    </button>
  );
}

function RadioRow({ active, onClick, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 text-left">
      <span className="h-4 w-4 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: active ? DEEP : "rgba(60,63,38,0.3)" }}>
        {active && <span className="h-2 w-2 rounded-full" style={{ background: DEEP }} />}
      </span>
      <span className="text-storm text-[12px]">{label}</span>
    </button>
  );
}

function daySummary(days = []) {
  if (!days.length) return "no days";
  if (days.length === 5 && ["mon", "tue", "wed", "thu", "fri"].every((d) => days.includes(d))) return "weekdays";
  return days.map((d) => d.toUpperCase()).join(", ");
}