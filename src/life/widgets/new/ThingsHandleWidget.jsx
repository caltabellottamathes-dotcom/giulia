import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { adminWeather, comingUp, overdueList } from "@/lib/adminUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const RIDGE = "#b1bec6";
const TITLE = "Things to Handle!";

/** pressure → 3 LIFE-tiers (géén Urgent):
 *  Olive #94925d  · >14d YOU'RE FINE! · 7–14d YOU'VE GOT TIME.
 *  Ridge #b1bec6 · 3–7d KEEP AN EYE. · 1–3d DEAL WITH IT!
 *  Pistachio #d8dab3 · <24h NOW, PLEASE! · voorbij MISSED. */
function pressure(diff) {
  if (diff == null) return { label: "YOU'RE FINE!", color: OLIVE };
  if (diff < 0) return { label: "MISSED.", color: PISTACHIO };
  const d = Math.floor(diff / 86400000);
  if (d >= 15) return { label: "YOU'RE FINE!", color: OLIVE };
  if (d >= 7) return { label: "YOU'VE GOT TIME.", color: OLIVE };
  if (d >= 3) return { label: "KEEP AN EYE.", color: RIDGE };
  if (d >= 1) return { label: "DEAL WITH IT!", color: RIDGE };
  return { label: "NOW, PLEASE!", color: PISTACHIO };
}

/** ThingsHandleWidget — P·9x16·SLIDE · "Things to Handle!"
 *  Foto + gradient. Achter (onderste helft): item-naam + wit bedrag → "Eerst
 *  volgende" → grote strakke aftelklok (Dagen/Uren/Min/Sec, bold, dicht bij
 *  elkaar). Onderste helft = lichte glaskaart (minder blur, flush) met een
 *  extra-extra-large ghost-cijfer links-onder (half afgesneden), "TO HANDLE:"
 *  + wisselende status even groot (3 LIFE-tiers). Tik kaart → omhoog. */
export default function ThingsHandleWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);

  const [idx, setIdx] = useState(0);
  const current = coming.length ? coming[idx % coming.length] : null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = current?.due_date ? new Date(current.due_date).getTime() - now : null;
  const hasCurrent = !!current;
  const safe = Math.max(0, diff || 0);
  const dDay = Math.floor(safe / 86400000);
  const dHr = Math.floor((safe % 86400000) / 3600000);
  const dMin = Math.floor((safe % 3600000) / 60000);
  const dSec = Math.floor((safe % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const status = pressure(diff);

  const [up, setUp] = useState(false);

  return (
    <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden">
      <motion.img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 8%, rgba(20,22,26,0.42) 50%, rgba(20,22,26,0.20) 100%)" }} />

      {/* ACHTER: item+prijs → Eerst volgende → aftelklok (Dagen/Uren/Min/Sec) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-0 flex flex-col justify-end px-4 pb-4 gap-2" style={{ color: IVORY }} onClick={() => openModule("personaladmin")}>
        <div className="flex items-baseline gap-2">
          <p className="text-[13px] font-display font-semibold leading-tight truncate" style={{ color: PISTACHIO }}>{hasCurrent ? current.title : "Niets op komst"}</p>
          {hasCurrent && Number(current.amount) > 0 && <span className="text-[11px] tabular-nums font-semibold shrink-0" style={{ color: IVORY }}>€{current.amount}</span>}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[8px] uppercase tracking-[0.22em] opacity-55">Eerst volgende</p>
          {coming.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % coming.length); }} className="flex items-center justify-center h-6 w-6 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 transition-colors" aria-label="volgende">
              <ArrowRight size={11} style={{ color: IVORY }} />
            </button>
          )}
        </div>
        <div className="flex items-end justify-center gap-0.5">
          {[{ v: pad(dDay), l: "Dagen" }, { v: pad(dHr), l: "Uren" }, { v: pad(dMin), l: "Min" }, { v: pad(dSec), l: "Sec" }].map((b, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[42px] font-display font-black tabular-nums leading-none tracking-[-0.05em]" style={{ color: PISTACHIO }}>{hasCurrent ? b.v : "—"}</span>
              <span className="text-[7px] uppercase tracking-[0.2em] mt-0.5" style={{ color: PISTACHIO, opacity: 0.55 }}>{b.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER — titel met continu bewegende golf-animatie */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 z-10 flex items-center justify-between" style={{ color: IVORY }}>
        <p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-90 flex">
          {TITLE.split("").map((ch, i) => (
            <motion.span key={i} className="inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, -3, 0] }} transition={{ opacity: { duration: 0.3, delay: i * 0.04 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 } }}>{ch === " " ? "\u00A0" : ch}</motion.span>
          ))}
        </p>
        {overdue.length > 0 && <span className="text-[8px] uppercase tracking-[0.14em] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: PISTACHIO + "22", color: PISTACHIO, border: `1px solid ${PISTACHIO}55` }}>{overdue.length} te laat</span>}
      </div>

      {/* GLASKAART (onderste helft, flush, minder blur) — schuift omhoog bij tik */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 top-0 h-1/2 rounded-[24px] overflow-hidden text-left block z-20"
        initial={false}
        animate={{ y: up ? "0%" : "100%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "rgba(120,128,133,0.18)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 -14px 32px -14px rgba(0,0,0,0.42), 0 14px 32px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.2)" }}
      >
        {/* extra-extra-large ghost-cijfer links-onder, half afgesneden */}
        <span className="absolute pointer-events-none select-none" style={{ left: "-12px", bottom: "-48px", fontSize: "190px", lineHeight: "0.78", fontWeight: 800, color: status.color, opacity: 0.13, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{coming.length}</span>

        <div className="absolute inset-0 p-4 flex flex-col justify-between" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
          <div>
            <p className="text-[28px] uppercase tracking-[-0.01em] font-black opacity-80 leading-[0.95]">TO HANDLE:</p>
            <motion.p key={status.label} className="text-[28px] font-display font-black tracking-[-0.03em] leading-[0.92] mt-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ color: status.color }}>{status.label}</motion.p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">op komst</p>
            <p className="text-[9px] uppercase tracking-[0.16em] opacity-50 mt-1">{weather.sub}</p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}