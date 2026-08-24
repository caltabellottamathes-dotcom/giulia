import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { adminWeather, comingUp, overdueList } from "@/lib/adminUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const URGENT = "#d5e24a";
const R = 42, C = 2 * Math.PI * R, ARC = 0.75 * C;

/** pressure → {label, color} van Whipped Pistachio naar Urgent */
function pressure(diff) {
  if (diff == null) return { label: "YOU'RE FINE", color: PISTACHIO };
  if (diff < 0) return { label: "MISSED", color: URGENT };
  const d = Math.floor(diff / 86400000);
  if (d >= 15) return { label: "YOU'RE FINE", color: "#d8dab3" };
  if (d >= 7) return { label: "YOU'VE GOT TIME", color: "#d3d99a" };
  if (d >= 3) return { label: "KEEP AN EYE", color: "#cfd880" };
  if (d >= 1) return { label: "DEAL WITH IT", color: "#d2dd5c" };
  return { label: "NOW, PLEASE", color: URGENT };
}

/** ThingsHandleWidget — P·9x16·SLIDE · "Things to Handle!"
 *  Foto + gradient. Boven: geanimeerde header. Achter (onderste helft): een
 *  grote, lage aftelklok in Whipped Pistachio met de eerstvolgende zaak +
 *  kost erboven en een pijl om door items te bladeren. Onderste helft =
 *  lichte glaskaart (flush, zelfde glas als andere widgets) met "To handle:"
 *  + status-tekst (pistachio→urgent), links "X op komst" + weather.sub, rechts
 *  een grote asymmetrische ring (270°) met het on-track-%. Tik kaart → omhoog. */
export default function ThingsHandleWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);

  const total = (obs || []).filter((o) => o.status !== "done").length;
  const clearPct = total === 0 ? 100 : Math.max(0, Math.round((1 - overdue.length / total) * 100));
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(clearPct), 300); return () => clearTimeout(t); }, [clearPct]);
  const off = ARC * (1 - val / 100);
  const ringColor = overdue.length ? URGENT : PISTACHIO;

  // cycling door komende zaken, elk met eigen aftelklok
  const [idx, setIdx] = useState(0);
  const current = coming.length ? coming[idx % coming.length] : null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  const diff = current?.due_date ? new Date(current.due_date).getTime() - now : null;
  const hasCurrent = !!current;
  const safe = Math.max(0, diff || 0);
  const dDay = Math.floor(safe / 86400000);
  const dHr = Math.floor((safe % 86400000) / 3600000);
  const dMin = Math.floor((safe % 3600000) / 60000);
  const pad = (n) => String(n).padStart(2, "0");
  const status = pressure(diff);

  const [up, setUp] = useState(false);

  return (
    <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden">
      <motion.img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 8%, rgba(20,22,26,0.42) 50%, rgba(20,22,26,0.20) 100%)" }} />

      {/* ACHTER: aftelklok (onderste helft) — groot, dicht, laag */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-0 flex flex-col px-5 pb-5" style={{ color: IVORY }} onClick={() => openModule("personaladmin")}>
        <div className="flex items-center justify-between">
          <p className="text-[8px] uppercase tracking-[0.22em] opacity-55">Eerst volgende</p>
          {coming.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % coming.length); }} className="flex items-center justify-center h-6 w-6 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 transition-colors" aria-label="volgende">
              <ArrowRight size={11} style={{ color: IVORY }} />
            </button>
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <p className="text-[13px] font-display font-semibold leading-tight truncate" style={{ color: PISTACHIO }}>{hasCurrent ? current.title : "Niets op komst"}</p>
          {hasCurrent && Number(current.amount) > 0 && <span className="text-[11px] tabular-nums font-semibold shrink-0" style={{ color: PISTACHIO }}>€{current.amount}</span>}
        </div>
        <div className="mt-auto flex items-end justify-center gap-2">
          {[{ v: pad(dDay), l: "Dagen" }, { v: pad(dHr), l: "Uren" }, { v: pad(dMin), l: "Min" }].map((b, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[54px] font-display font-bold tabular-nums leading-none" style={{ color: PISTACHIO }}>{hasCurrent ? b.v : "—"}</span>
              <span className="text-[8px] uppercase tracking-[0.28em] mt-1.5" style={{ color: PISTACHIO, opacity: 0.6 }}>{b.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER (boven) — geanimeerd */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 z-10 flex items-center justify-between" style={{ color: IVORY }}>
        <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-90" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Things to Handle!</motion.p>
        {overdue.length > 0 && <span className="text-[8px] uppercase tracking-[0.14em] font-bold px-2 py-0.5 rounded-full" style={{ background: URGENT + "22", color: URGENT, border: `1px solid ${URGENT}55` }}>{overdue.length} te laat</span>}
      </div>

      {/* GLASKAART (onderste helft, flush, licht glas) — schuift omhoog bij tik */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 top-0 h-1/2 rounded-[24px] overflow-hidden text-left block z-20"
        initial={false}
        animate={{ y: up ? "0%" : "100%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "rgba(120,128,133,0.18)", backdropFilter: "blur(30px) saturate(1.4)", WebkitBackdropFilter: "blur(30px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 -14px 32px -14px rgba(0,0,0,0.42), 0 14px 32px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.2)" }}
      >
        <div className="absolute inset-0 p-4 flex flex-col justify-between" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
          {/* boven: To handle: + status */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] opacity-60">To handle:</p>
            <motion.p key={status.label} className="text-[17px] font-display font-bold tracking-[-0.01em] mt-1" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ color: status.color }}>{status.label}</motion.p>
          </div>
          {/* beneden: links op komst + sub, rechts asymmetrische ring */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[22px] font-display font-bold tabular-nums leading-none">{coming.length}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] opacity-65 mt-1">op komst</p>
              <p className="text-[8px] uppercase tracking-[0.14em] opacity-50 mt-0.5">{weather.sub}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative h-[94px] w-[94px]">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="4" strokeDasharray={`${ARC} ${C}`} transform="rotate(-45 50 50)" />
                  <motion.circle cx="50" cy="50" r={R} fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${ARC} ${C}`} strokeDashoffset={off} transform="rotate(-45 50 50)" animate={{ strokeDashoffset: off }} transition={{ duration: 1.2, ease: "easeOut" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CountUp value={val} className="text-[26px] font-display font-bold tabular-nums leading-none" />
                </div>
              </div>
              <span className="text-[8px] uppercase tracking-[0.2em] opacity-65 mt-1">on track</span>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
}