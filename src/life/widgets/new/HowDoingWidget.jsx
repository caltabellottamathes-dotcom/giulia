import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { base44 } from "@/api/base44Client";
import { stateLabel } from "@/lib/selfUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a3ade5ba2_BecomingMe.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";

/** 06 · HOW I'M DOING. — check-in moment voor wellbeing & therapie.
 *  3× per dag (ochtend/middag/avond). 5 vragen, ÉÉN per keer. Per vraag een
 *  grafische selector of tekstinvoer. Na alle 5 → opgeslagen in SelfCheckIn
 *  en de widget krijgt een neutrale vorm tot het weer tijd is voor incheck. */

const MOODS = [
  { key: "energetic", label: "Energiek", color: "#d8dab3" },
  { key: "good", label: "Goed", color: "#c4cfb4" },
  { key: "neutral", label: "Neutraal", color: "#b1bec6" },
  { key: "tired", label: "Moe", color: "#94925d" },
  { key: "anxious", label: "Gespannen", color: "#8d8a80" },
  { key: "low", label: "Laag", color: "#5f5f5a" },
];
const LEVELS = [20, 40, 60, 80, 100];
const SLEEP_LABELS = ["Slecht", "Matig", "OK", "Goed", "Uitstekend"];

const QUESTIONS = [
  { key: "mood", q: "Hoe is je mood nu?", type: "mood" },
  { key: "energy", q: "Hoe is je energie?", type: "energy" },
  { key: "sleep", q: "Hoe heb je geslapen?", type: "sleep" },
  { key: "reflection", q: "Wat leeft er nu in je?", type: "text" },
  { key: "needs", q: "Wat heb je vandaag nodig?", type: "text" },
];

function moodToState(m) {
  if (m === "energetic" || m === "good") return "charged";
  if (m === "neutral") return "neutral";
  if (m === "anxious") return "overwhelmed";
  return "low";
}

export default function HowDoingWidget() {
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 10, realtime: true, externalTick: learnTick });

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [reflection, setReflection] = useState("");
  const [needs, setNeeds] = useState("");
  const [saving, setSaving] = useState(false);
  const [justDone, setJustDone] = useState(false);

  const latest = (checkIns || [])[0];
  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "CHECK IN";

  const h = new Date().getHours();
  const tod = h >= 5 && h < 12 ? "morning" : h >= 12 && h < 18 ? "afternoon" : "evening";
  const title = tod === "morning" ? "OCHTEND" : tod === "afternoon" ? "MIDDAG" : "AVOND";
  const nextLabel = tod === "morning" ? "vanmiddag" : tod === "afternoon" ? "vanavond" : "morgenochtend";

  // al ingecheckt in dit tijd-van-dag venster?
  const completedThisWindow = useMemo(() => {
    if (justDone) return true;
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const s = new Date(d), e = new Date(d);
    if (tod === "morning") { s.setHours(5, 0, 0, 0); e.setHours(12, 0, 0, 0); }
    else if (tod === "afternoon") { s.setHours(12, 0, 0, 0); e.setHours(18, 0, 0, 0); }
    else { s.setHours(18, 0, 0, 0); e.setDate(e.getDate() + 1); e.setHours(5, 0, 0, 0); }
    const ws = s.getTime(), we = e.getTime();
    return (checkIns || []).some((c) => { const t = new Date(c.timestamp || 0).getTime(); return t >= ws && t < we; });
  }, [checkIns, justDone, tod]);

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await base44.entities.SelfCheckIn.create({
        state: mood ? moodToState(mood) : "neutral",
        mood: mood || undefined,
        energy: energy ?? undefined,
        capacity: sleep ?? undefined,
        reflection: reflection.trim() || undefined,
        needs: needs.trim() ? [needs.trim()] : undefined,
        context: `${title}: check-in`,
        check_in_type: "manual",
        source: "manual",
        timestamp: new Date().toISOString(),
      });
      setJustDone(true);
    } catch {
      /* realtime ververst */
    } finally {
      setSaving(false);
    }
  };

  const next = (e) => {
    if (e) e.preventDefault();
    if (isLast) { finish(); return; }
    setStep((s) => s + 1);
  };

  const glass = {
    "--tile-accent": PISTACHIO,
    background: "rgba(120,128,133,0.18)",
    backdropFilter: "blur(16px) saturate(1.3)",
    WebkitBackdropFilter: "blur(16px) saturate(1.3)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 -14px 32px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
    color: IVORY,
  };

  return (
    <div className="relative w-full aspect-[2/3] rounded-[28px] overflow-hidden">
      <motion.img src={PHOTO} alt="How I'm Doing" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.9) 14%, rgba(20,22,26,0.32) 58%, rgba(20,22,26,0.12))" }} />

      {/* foto boven: How I'm Doing. + state (géén herhaling van ochtend) */}
      <div className="absolute top-0 inset-x-0 p-4 z-10 flex items-start justify-between" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}>
        <p className="text-[9px] uppercase tracking-[0.24em] opacity-75 font-bold">How I'm Doing.</p>
        <span className="text-[20px] font-display font-black leading-none tracking-[-0.03em]">{stateText}</span>
      </div>

      {/* glaskaart */}
      <div className="absolute left-0 right-0 bottom-0 h-[62%] rounded-t-[28px] flex flex-col p-4 overflow-hidden" style={glass}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${PISTACHIO} 18%, ${PISTACHIO} 82%, transparent)` }} />

        <AnimatePresence mode="wait">
          {completedThisWindow ? (
            /* NEUTRALE vorm na voltooide check-in */
            <motion.div key="idle" className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WidgetHeader type="pulse" label="How I'm Doing." count={stateLabel(latest?.state || "neutral")} />
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="h-12 w-12 rounded-full flex items-center justify-center mb-3" style={{ background: PISTACHIO }}><Check size={24} style={{ color: "#3a3d2a" }} /></span>
                <h3 className="text-[24px] font-display font-black tracking-[-0.03em]" style={{ color: PISTACHIO }}>Ingecheckt.</h3>
                <p className="text-[11px] uppercase tracking-[0.16em] opacity-60 mt-2">Volgende check-in {nextLabel}</p>
                {latest?.reflection && <p className="text-[10px] italic mt-3 line-clamp-2 px-2" style={{ opacity: 0.45 }}>"{latest.reflection}"</p>}
              </div>
            </motion.div>
          ) : (
            /* CHECK-IN flow: 1 vraag per keer */
            <motion.div key="flow" className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[22px] font-display font-black tracking-[-0.03em] leading-none" style={{ color: PISTACHIO }}>{title}</h3>
                <span className="text-[9px] font-mono tabular-nums opacity-50">{step + 1}/{QUESTIONS.length}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p key={step} className="text-[14px] font-semibold leading-snug" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ opacity: 0.92 }}>{q.q}</motion.p>
              </AnimatePresence>

              <div className="flex-1 flex flex-col justify-center min-h-0 mt-2">
                {q.type === "mood" && (
                  <div className="flex items-end justify-between">
                    {MOODS.map((m) => {
                      const on = mood === m.key;
                      return (
                        <button key={m.key} type="button" onClick={() => setMood(on ? null : m.key)} className="flex flex-col items-center gap-1">
                          <span className="rounded-full transition-all" style={{ width: on ? 20 : 13, height: on ? 20 : 13, background: m.color, boxShadow: on ? `0 0 10px ${m.color}` : "none", opacity: on ? 1 : 0.5 }} />
                          <span className="text-[6px] uppercase tracking-[0.06em] leading-none" style={{ opacity: on ? 0.95 : 0.4 }}>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {q.type === "energy" && (
                  <div className="flex items-end gap-2 h-16">
                    {LEVELS.map((lvl, i) => {
                      const on = energy === lvl, reached = energy != null && lvl <= energy;
                      return <button key={lvl} type="button" onClick={() => setEnergy(on ? null : lvl)} className="flex-1 rounded-md transition-all" style={{ height: `${30 + i * 17.5}%`, background: reached ? PISTACHIO : "rgba(255,255,255,0.16)", boxShadow: on ? `0 0 10px ${PISTACHIO}` : "none", opacity: reached || on ? 1 : 0.6 }} />;
                    })}
                  </div>
                )}
                {q.type === "sleep" && (
                  <div className="flex items-end justify-between">
                    {LEVELS.map((lvl, i) => {
                      const on = sleep === lvl;
                      return (
                        <button key={lvl} type="button" onClick={() => setSleep(on ? null : lvl)} className="flex flex-col items-center gap-1">
                          <span className="rounded-full transition-all" style={{ width: on ? 20 : 13, height: on ? 20 : 13, background: PISTACHIO, boxShadow: on ? `0 0 10px ${PISTACHIO}` : "none", opacity: on ? 1 : 0.4 }} />
                          <span className="text-[6px] uppercase tracking-[0.06em] leading-none" style={{ opacity: on ? 0.95 : 0.4 }}>{SLEEP_LABELS[i]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {q.type === "text" && (
                  <textarea
                    value={q.key === "reflection" ? reflection : needs}
                    onChange={(e) => q.key === "reflection" ? setReflection(e.target.value) : setNeeds(e.target.value)}
                    placeholder="Schrijf je antwoord…"
                    rows={3}
                    className="w-full rounded-2xl bg-white/10 border border-white/15 px-3 py-2.5 text-[12px] outline-none placeholder:opacity-40 resize-none"
                    style={{ color: IVORY }}
                  />
                )}
              </div>

              <button type="button" onClick={next} disabled={saving} className="mt-2 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-50" style={{ background: PISTACHIO, color: "#3a3d2a" }}>
                {isLast ? <>Inchecken <Check size={15} /></> : <>Volgende <ArrowRight size={15} /></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}