import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

const PHASES = ["wake", "orient", "getup", "routine", "briefing", "complete"];

const DEFAULT_GETUP = [
  { title: "Sit up", key: "sit-up" },
  { title: "Feet on the floor", key: "feet-floor" },
  { title: "I'm up", key: "im-up", isUp: true },
];

const DEFAULT_ROUTINE = [
  { title: "Water", key: "water", optional: false },
  { title: "Bathroom", key: "bathroom", optional: false },
  { title: "Coffee", key: "coffee", optional: true },
  { title: "Get dressed", key: "dressed", optional: false },
];

function computeContext(events, wakeTime) {
  const today = new Date().toLocaleDateString("sv-SE");
  const todayEvents = (events || [])
    .filter((e) => (e.start || "").slice(0, 10) === today)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  if (!todayEvents.length) return { type: "quiet", line: "You have a relatively quiet morning." };
  const [wh, wm] = (wakeTime || "07:30").split(":").map(Number);
  const wake = new Date();
  wake.setHours(wh, wm, 0, 0);
  const first = todayEvents[0];
  const firstStart = new Date(first.start);
  const minsAfter = (firstStart - wake) / 60000;
  const t = firstStart.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const morningCount = todayEvents.filter((e) => new Date(e.start) < wake.getTime() + 3 * 3600000).length;
  if (minsAfter < 60 && minsAfter > -60) return { type: "tight", line: "You're running a little tight this morning." };
  if (morningCount >= 2) return { type: "busy", line: "You've got a busy morning today." };
  if (morningCount === 1) return { type: "appointment", line: `Your first appointment is at ${t}.` };
  return { type: "quiet", line: "You have a relatively quiet morning." };
}

export function useWakeEngine() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [getupSteps, setGetupSteps] = useState(DEFAULT_GETUP);
  const [routineSteps, setRoutineSteps] = useState(DEFAULT_ROUTINE);
  const [phase, setPhase] = useState("wake");
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [morningContext, setMorningContext] = useState({ type: "quiet", line: "You have a relatively quiet morning." });
  const [sessionId, setSessionId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [settingsRecs, steps, events] = await Promise.all([
        base44.entities.MorningSettings.list().catch(() => []),
        base44.entities.MorningRoutineStep.list("order").catch(() => []),
        base44.entities.CalendarEvent.list().catch(() => []),
      ]);
      if (!active) return;
      const s = settingsRecs[0] || {
        wake_time: "07:30", wake_style: "gentle", max_snoozes: 3, snooze_minutes: 5,
        voice_enabled: true, gradual_wake: true, briefing_after_routine: true, enabled: true,
      };
      setSettings(s);
      const gu = steps.filter((x) => x.phase === "getup" && x.enabled !== false);
      const rt = steps.filter((x) => x.phase === "routine" && x.enabled !== false);
      if (gu.length) setGetupSteps(gu.map((x) => ({ title: x.title, key: x.id })));
      const base = rt.length
        ? rt.map((x) => ({ title: x.title, key: x.id, optional: x.optional }))
        : DEFAULT_ROUTINE;
      const ctx = computeContext(events, s.wake_time || "07:30");
      setMorningContext(ctx);
      const activeRoutine = ctx.type === "tight" ? base.filter((x) => !x.optional).slice(0, 2) : base;
      setRoutineSteps(activeRoutine);
      try {
        const sess = await base44.entities.WakeSession.create({
          wake_time: s.wake_time || "07:30",
          phase: "wake",
          status: "active",
          actual_wake_time: new Date().toISOString(),
          morning_context: ctx.type,
        });
        if (active) setSessionId(sess.id);
      } catch {}
      setReady(true);
    })();
    return () => { active = false; };
  }, []);

  const patchSession = useCallback((patch) => {
    if (sessionId) base44.entities.WakeSession.update(sessionId, patch).catch(() => {});
  }, [sessionId]);

  const advance = useCallback(() => {
    setPhase((p) => {
      if (p === "briefing" || p === "complete") return p;
      const i = PHASES.indexOf(p);
      const next = PHASES[Math.min(i + 1, PHASES.indexOf("briefing"))];
      patchSession({ phase: next, current_step: 0 });
      return next;
    });
    setStepIndex(0);
  }, [patchSession]);

  const snooze = useCallback(() => {
    setSnoozeCount((c) => {
      const n = c + 1;
      patchSession({ snooze_count: n, phase: "snoozed" });
      return n;
    });
  }, [patchSession]);

  const completeStep = useCallback(() => {
    const steps = phase === "getup" ? getupSteps : phase === "routine" ? routineSteps : [];
    if (stepIndex + 1 >= steps.length) {
      if (phase === "getup") { setPhase("routine"); setStepIndex(0); patchSession({ phase: "routine", current_step: 0 }); }
      else if (phase === "routine") { setPhase("briefing"); setStepIndex(0); patchSession({ phase: "briefing", current_step: 0 }); }
    } else {
      setStepIndex(stepIndex + 1);
      patchSession({ current_step: stepIndex + 1 });
    }
  }, [phase, stepIndex, getupSteps, routineSteps, patchSession]);

  const startBriefing = useCallback(() => {
    patchSession({ phase: "complete", status: "completed", briefing_started: true });
    navigate("/briefing");
  }, [patchSession, navigate]);

  const exit = useCallback(() => {
    patchSession({ status: "dismissed" });
    navigate("/");
  }, [patchSession, navigate]);

  return {
    settings, getupSteps, routineSteps, phase, snoozeCount, stepIndex,
    morningContext, advance, snooze, completeStep, startBriefing, exit,
    ready, maxSnoozes: settings?.max_snoozes ?? 3,
  };
}