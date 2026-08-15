import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import WakeSettingsForm from "@/self/components/WakeSettingsForm";
import RoutineEditor from "@/self/components/RoutineEditor";
import DailyIntention from "@/self/components/DailyIntention";
import { Sunrise, Moon, ArrowRight } from "lucide-react";

export default function GoodMorningPanel() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [steps, setSteps] = useState([]);

  const load = useCallback(async () => {
    const [s, st] = await Promise.all([
      base44.entities.MorningSettings.list().catch(() => []),
      base44.entities.MorningRoutineStep.list("order").catch(() => []),
    ]);
    setSettings(s[0] || {
      wake_time: "07:30", days: ["mon", "tue", "wed", "thu", "fri"], wake_style: "gentle",
      alarm_sound: "silent", voice_enabled: true, gradual_wake: true, snooze_minutes: 5,
      max_snoozes: 3, briefing_after_routine: true, enabled: true,
    });
    setSteps(st || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (next) => {
    setSettings(next);
    try {
      if (next.id) await base44.entities.MorningSettings.update(next.id, next);
      else { const rec = await base44.entities.MorningSettings.create(next); setSettings(rec); }
    } catch {}
  };

  if (!settings) return <div className="py-10 text-center text-ivory/50 text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <DailyIntention />
      <div className="flex items-center gap-2 text-ivory/70">
        <Sunrise className="h-4 w-4 text-olive shrink-0" />
        <p className="text-xs leading-snug">Giulia wakes you gradually — a calm presence, not an alarm.</p>
      </div>
      <WakeSettingsForm settings={settings} onChange={save} />
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 mb-3 font-medium">Morning routine</p>
        <RoutineEditor steps={steps} onReload={load} />
      </div>
      <button
        onClick={() => navigate("/wake")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-olive text-ivory py-3.5 text-sm font-semibold hover:bg-olive/90 transition"
      >
        <Moon className="h-4 w-4" /> Enter Wake Mode <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}