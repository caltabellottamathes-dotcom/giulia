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

/** 06 · HOW I'M DOING. — check-in moment.
 *  3× per dag een andere prompt (ochtend/middag/avond) met een paar vragen.
 *  Glaskaart met chat-stijl tekstinvoer; antwoord wordt opgeslagen in
 *  SelfCheckIn (reflection + context). Nieuwe foto: BecomingMe. */
const PROMPTS = {
  morning: { title: "Goedemorgen.", qs: ["Wat is je intentie voor vandaag?", "Waar heb je energie voor?"] },
  afternoon: { title: "Middag-check.", qs: ["Wat kost nu veel energie?", "Wat ging er goed vanmorgen?"] },
  evening: { title: "Goedenavond.", qs: ["Waar ben je dankbaar voor vandaag?", "Wat wil je morgen anders doen?"] },
};

export default function HowDoingWidget() {
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { sort: "-timestamp", limit: 5, realtime: true, externalTick: learnTick });
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
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await base44.entities.SelfCheckIn.create({
        state: "neutral",
        reflection: text.trim(),
        context: `${prompt.title} — ${prompt.qs.join(" / ")}`,
        check_in_type: "manual",
        source: "manual",
        timestamp: new Date().toISOString(),
      });
      setText("");
    } catch {
      /* realtime ververst de lijst */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full aspect-[2/3] rounded-[28px] overflow-hidden">
      <motion.img src={PHOTO} alt="How I'm Doing" className="absolute inset-0 w-full h-full object-cover" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.88) 18%, rgba(20,22,26,0.32) 60%, rgba(20,22,26,0.18))" }} />

      {/* foto boven: tijd-van-dag + state */}
      <div className="absolute top-0 inset-x-0 p-4 z-10 flex items-start justify-between" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
        <p className="text-[8px] uppercase tracking-[0.2em] opacity-65">{timeLabel} check-in</p>
        <span className="text-[28px] font-display font-bold leading-none">{stateText}</span>
      </div>

      {/* glaskaart: check-in met vragen + chat-invoer */}
      <div
        className="absolute left-0 right-0 bottom-0 h-[60%] rounded-t-[28px] flex flex-col p-4 overflow-hidden"
        style={{ "--tile-accent": PISTACHIO, background: "rgba(120,128,133,0.18)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 -14px 32px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)", color: IVORY }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${PISTACHIO} 18%, ${PISTACHIO} 82%, transparent)` }} />
        <WidgetHeader type="pulse" label="How I'm Doing." count={timeLabel} />
        <h3 className="text-[19px] font-display font-semibold leading-tight">{prompt.title}</h3>
        <div className="mt-1.5 space-y-1">
          {prompt.qs.map((q, i) => (
            <p key={i} className="text-[11px] leading-snug" style={{ opacity: 0.78 }}>{q}</p>
          ))}
        </div>
        {lastReflection && (
          <p className="text-[10px] italic mt-2 line-clamp-2" style={{ opacity: 0.5 }}>"{lastReflection}"</p>
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
          <button type="submit" disabled={saving || !text.trim()} className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40" style={{ background: PISTACHIO }} aria-label="verzend">
            <ArrowUp size={16} style={{ color: "#3a3d2a" }} />
          </button>
        </form>
      </div>
    </div>
  );
}