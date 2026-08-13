import React from "react";

const DAYS = [["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"], ["thu", "Thu"], ["fri", "Fri"], ["sat", "Sat"], ["sun", "Sun"]];
const STYLES = [["gentle", "Gentle"], ["normal", "Normal"], ["direct", "Direct"]];
const SOUNDS = ["silent", "soft-chime", "birds", "waves", "rain", "ambient"];

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 mb-2 font-medium">{label}</p>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${on ? "bg-olive/20 text-ivory" : "glass-1 text-ivory/55"}`}
    >
      <span>{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition ${on ? "bg-olive" : "bg-ivory/15"}`}>
        <span className={`block h-4 w-4 rounded-full bg-ivory transition-transform ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

export default function WakeSettingsForm({ settings, onChange }) {
  const s = settings || {};
  const set = (patch) => onChange({ ...s, ...patch });
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Wake-up time">
          <input
            type="time"
            value={s.wake_time || "07:30"}
            onChange={(e) => set({ wake_time: e.target.value })}
            className="w-full bg-ivory/5 border border-ivory/15 rounded-xl px-3 py-2.5 text-ivory text-lg font-display focus:outline-none focus:border-olive/50"
          />
        </Field>
        <Field label="Wake-up style">
          <div className="flex gap-1.5">
            {STYLES.map(([k, l]) => (
              <button
                key={k}
                onClick={() => set({ wake_style: k })}
                className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-medium transition ${s.wake_style === k ? "bg-olive text-ivory" : "glass-1 text-ivory/55"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Days">
        <div className="flex gap-1.5">
          {DAYS.map(([k, l]) => {
            const on = (s.days || []).includes(k);
            return (
              <button
                key={k}
                onClick={() => set({ days: on ? (s.days || []).filter((d) => d !== k) : [...(s.days || []), k] })}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${on ? "bg-olive text-ivory" : "glass-1 text-ivory/45"}`}
              >
                {l}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Snooze (min)">
          <input type="number" min={1} max={20} value={s.snooze_minutes ?? 5} onChange={(e) => set({ snooze_minutes: +e.target.value })} className="w-full bg-ivory/5 border border-ivory/15 rounded-xl px-3 py-2.5 text-ivory focus:outline-none focus:border-olive/50" />
        </Field>
        <Field label="Max snoozes">
          <input type="number" min={0} max={10} value={s.max_snoozes ?? 3} onChange={(e) => set({ max_snoozes: +e.target.value })} className="w-full bg-ivory/5 border border-ivory/15 rounded-xl px-3 py-2.5 text-ivory focus:outline-none focus:border-olive/50" />
        </Field>
      </div>

      <Field label="Alarm sound">
        <div className="flex flex-wrap gap-1.5">
          {SOUNDS.map((k) => (
            <button key={k} onClick={() => set({ alarm_sound: k })} className={`rounded-lg px-3 py-2 text-xs capitalize transition ${s.alarm_sound === k ? "bg-olive text-ivory" : "glass-1 text-ivory/45"}`}>
              {k.replace("-", " ")}
            </button>
          ))}
        </div>
      </Field>

      <div className="space-y-2">
        <Toggle on={s.voice_enabled !== false} onChange={(v) => set({ voice_enabled: v })} label="Giulia's voice" />
        <Toggle on={s.gradual_wake !== false} onChange={(v) => set({ gradual_wake: v })} label="Gradual wake-up light" />
        <Toggle on={s.briefing_after_routine !== false} onChange={(v) => set({ briefing_after_routine: v })} label="Briefing after routine" />
        <Toggle on={!!s.enabled} onChange={(v) => set({ enabled: v })} label="Alarm active" />
      </div>
    </div>
  );
}