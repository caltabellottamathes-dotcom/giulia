import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { base44 } from "@/api/base44Client";
import { stateLabel } from "@/lib/selfUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a3ade5ba2_BecomingMe.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";

/** 06 · HOW I'M DOING. — check-in moment voor wellbeing & therapie.
 *  3× per dag (ochtend/middag/avond): een sterke, gerichte check-in over
 *  slaap, energie, mood & gevoel. Grafische mood- en energy-selectors +
 *  chat-stijl tekstinvoer; opgeslagen in SelfCheckIn. */

const PROMPTS = {
  morning: { title: "OCHTEND", q: "Hoe heb je geslapen — en hoe voel je je nu?" },
  afternoon: { title: "MIDDAG", q: "Hoe is je energie, en wat vraagt nu het meest van je?" },
  evening: { title: "AVOND", q: "Hoe was je dag — en hoe is je mood nu?" },
};

const MOODS = [
  { key: "energetic", label: "Energiek", color: "#d8dab3" },
  { key: "good", label: "Goed", color: "#c4cfb4" },
  { key: "neutral", label: "Neutraal", color: "#b1bec6" },
  { key: "tired", label: "Moe", color: "#94925d" },
  { key: "anxious", label: "Gespannen", color: "#8d8a80" },
  { key: "low", label: "Laag", color: "#5f5f5a" },
];
const ENERGY_LEVELS = [20, 40, 60, 80, 100];

function moodToState(m) {
  if (m === "energetic" || m === "good") return "charged";
  if (m === "neutral") return "neutral";
  if (m === "anxious") return "overwhelmed";
  return "low";
}

export default function HowDoingWidget() {
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 5, realtime: true, externalTick: learnTick });
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const latest = (checkIns || [])[0];
  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "CHECK IN";
  const lastReflection = (checkIns || []).find((c) => c.reflection)?.reflection;

  const h = new Date().getHours();
  const tod = h >= 5 && h < 12 ? "morning" : h >= 12 && h < 18 ? "afternoon" : "evening";
  const timeLabel = tod === "morning" ? "ochtend" : tod === "afternoon" ? "middag" : "avond";
  const prompt = PROMPTS[tod];

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!mood && !energy && !text.trim()) return;
    setSaving(true);
    try {
      await base44.entities.SelfCheckIn.create({
        state: mood ? moodToState(mood) : "neutral",
        mood: mood || undefined,
        energy: energy ?? undefined,
        reflection: text.trim() || undefined,
        context: `${prompt.title}: ${prompt.q}`,
        check_in_type: "manual",
        source: "manual",
        timestamp: new Date().toISOString(),
      });
      setMood(null);
      setEnergy(null);
      setText("");
    } catch {
      /* realtime ververst */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full aspect-[2/3] rounded-[28px] overflow-hidden">
      <motion.img src={PHOTO} alt="How I'm Doing" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.9) 14%, rgba(20,22,26,0.32) 58%, rgba(20,22,26,0.12))" }} />

      {/* foto boven: tijd-van-dag + state */}
      <div className="absolute top-0 inset-x-0 p-4 z-10 flex items-start justify-between" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}>
        <div>
          <p className="text-[8px] uppercase tracking-[0.24em] opacity-70 font-bold">{timeLabel} check-in</p>
          <p className="text-[9px] uppercase tracking-[0.16em] opacity-55 mt-1">laatste · {latest ? stateLabel(latest.state) : "—"}</p>
        </div>
        <span className="text-[28px] font-display font-black leading-none tracking-[-0.03em]">{stateText}</span>
      </div>

      {/* glaskaart: grafische check-in */}
      <div
        className="absolute left-0 right-0 bottom-0 h-[66%] rounded-t-[28px] flex flex-col p-4 overflow-hidden"
        style={{ "--tile-accent": PISTACHIO, background: "rgba(120,128,133,0.18)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 -14px 32px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)", color: IVORY }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${PISTACHIO} 18%, ${PISTACHIO} 82%, transparent)` }} />
        <WidgetHeader type="pulse" label="How I'm Doing." count={timeLabel} />

        {/* tijd-van-dag + sterke vraag */}
        <motion.h3 key={prompt.title} className="text-[26px] font-display font-black tracking-[-0.03em] leading-none" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ color: PISTACHIO }}>{prompt.title}</motion.h3>
        <p className="text-[13px] font-semibold leading-snug mt-1.5" style={{ opacity: 0.92 }}>{prompt.q}</p>

        {/* mood selector — grafische rij */}
        <p className="text-[8px] uppercase tracking-[0.22em] opacity-55 mt-3 mb-1.5">MOOD</p>
        <div className="flex items-end justify-between">
          {MOODS.map((m) => {
            const on = mood === m.key;
            return (
              <button key={m.key} type="button" onClick={() => setMood(on ? null : m.key)} className="flex flex-col items-center gap-1 group">
                <span className="rounded-full transition-all" style={{ width: on ? 22 : 14, height: on ? 22 : 14, background: m.color, boxShadow: on ? `0 0 12px ${m.color}` : "none", opacity: on ? 1 : 0.5 }} />
                <span className="text-[6.5px] uppercase tracking-[0.08em] leading-none" style={{ opacity: on ? 0.95 : 0.4 }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* energy selector — grafische bars */}
        <p className="text-[8px] uppercase tracking-[0.22em] opacity-55 mt-3 mb-1.5">ENERGIE{energy != null ? ` · ${energy}` : ""}</p>
        <div className="flex items-end gap-1.5 h-12">
          {ENERGY_LEVELS.map((lvl, i) => {
            const on = energy === lvl;
            const reached = energy != null && lvl <= energy;
            return (
              <button key={lvl} type="button" onClick={() => setEnergy(on ? null : lvl)} className="flex-1 rounded-md transition-all" style={{ height: `${30 + i * 17.5}%`, background: reached ? PISTACHIO : "rgba(255,255,255,0.16)", boxShadow: on ? `0 0 10px ${PISTACHIO}` : "none", opacity: reached || on ? 1 : 0.6 }} />
            );
          })}
        </div>

        {lastReflection && (
          <p className="text-[9.5px] italic mt-2 line-clamp-2" style={{ opacity: 0.45 }}>"{lastReflection}"</p>
        )}

        <div className="flex-1" />
        <form onSubmit={handleSave} className="flex items-center gap-2 mt-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Schrijf je antwoord…"
            className="flex-1 min-w-0 rounded-full bg-white/10 border border-white/15 px-3.5 py-2.5 text-[12px] outline-none placeholder:opacity-40"
            style={{ color: IVORY }}
          />
          <button type="submit" disabled={saving || (!mood && !energy && !text.trim())} className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40" style={{ background: PISTACHIO }} aria-label="verzend">
            <ArrowUp size={16} style={{ color: "#3a3d2a" }} />
          </button>
        </form>
      </div>
    </div>
  );
}