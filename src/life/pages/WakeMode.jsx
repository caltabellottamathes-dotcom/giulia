import React, { useEffect, useCallback, useState } from "react";
import { useWakeEngine } from "@/self/components/useWakeEngine";
import WakeAtmosphere from "@/self/components/WakeAtmosphere";
import WakePhaseWake from "@/self/components/WakePhaseWake";
import WakePhaseOrient from "@/self/components/WakePhaseOrient";
import WakePhaseGetUp from "@/self/components/WakePhaseGetUp";
import WakePhaseRoutine from "@/self/components/WakePhaseRoutine";
import WakePhaseBriefing from "@/self/components/WakePhaseBriefing";
import { speak, createRecognizer } from "@/self/components/wakeVoice";
import { X } from "lucide-react";

export default function WakeMode() {
  const engine = useWakeEngine();
  const [listening, setListening] = useState(false);
  const { phase, settings, getupSteps, routineSteps, stepIndex, morningContext } = engine;

  const onSnooze = useCallback(() => {
    const n = engine.snoozeCount + 1;
    engine.snooze();
    if (n >= engine.maxSnoozes) {
      speak("We should get moving.");
      setTimeout(() => engine.advance(), 2800);
    } else {
      speak(n === 1 ? "A few more minutes." : `You've snoozed ${n} times.`);
    }
  }, [engine]);

  const handleVoice = useCallback((t) => {
    setListening(false);
    if (/snooze|more minutes|five more|sleep/.test(t)) return onSnooze();
    if (phase === "briefing" && /start|begin|briefing|yes|up/.test(t)) return engine.startBriefing();
    if (/awake|up now|continue|start|begin|next|done/.test(t)) engine.advance();
    else if (/today|have|important|what/.test(t)) speak(morningContext.line);
  }, [engine, onSnooze, morningContext, phase]);

  // Auto-listen in the earliest phases — Giulia is listening, hands stay free.
  useEffect(() => {
    if (!settings?.voice_enabled || (phase !== "wake" && phase !== "orient")) return;
    let active = true;
    let r = null;
    const start = () => {
      if (!active) return;
      r = createRecognizer(
        (t) => { if (active) handleVoice(t); },
        () => { if (active) setTimeout(start, 900); }
      );
      if (r) { setListening(true); try { r.start(); } catch {} }
      else setListening(false);
    };
    const to = setTimeout(start, 4500);
    return () => { active = false; clearTimeout(to); try { r && r.abort(); } catch {} setListening(false); };
  }, [phase, settings?.voice_enabled, handleVoice]);

  if (!engine.ready) {
    return (
      <div className="fixed inset-0 bg-[#15140f] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-ivory/30 animate-pulse-soft" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#15140f] overflow-hidden">
      <WakeAtmosphere phase={phase} />

      <button
        onClick={engine.exit}
        className="absolute top-6 left-6 z-30 text-ivory/25 hover:text-ivory/60 transition"
        aria-label="Exit"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {phase === "wake" && <WakePhaseWake onAdvance={engine.advance} onSnooze={onSnooze} />}
      {phase === "orient" && <WakePhaseOrient wakeTime={settings?.wake_time} context={morningContext} onAdvance={engine.advance} onSnooze={onSnooze} />}
      {phase === "getup" && <WakePhaseGetUp steps={getupSteps} stepIndex={stepIndex} onComplete={engine.completeStep} />}
      {phase === "routine" && <WakePhaseRoutine steps={routineSteps} stepIndex={stepIndex} onComplete={engine.completeStep} onSkip={engine.completeStep} />}
      {phase === "briefing" && <WakePhaseBriefing onStart={engine.startBriefing} />}

      {listening && (
        <div className="fixed bottom-8 right-8 z-20 flex items-center gap-2 text-ivory/45 text-xs font-light">
          <span className="h-2 w-2 rounded-full bg-olive animate-pulse-soft" />
          listening
        </div>
      )}
    </div>
  );
}