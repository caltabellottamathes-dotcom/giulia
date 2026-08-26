import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { adminWeather, comingUp, overdueList } from "@/lib/adminUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const RIDGE = "#b1bec6";
const NEON = "#d8dab3";

/** pressure → 3 LIFE-tiers (géén Urgent):
 *  Olive · >14d YOU'RE FINE! · 7–14d YOU'VE GOT TIME.
 *  Ridge · 3–7d KEEP AN EYE. · 1–3d DEAL WITH IT!
 *  Pistachio · <24h NOW, PLEASE! · voorbij MISSED. */
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

/** ThingsHandleFullWidget — full-height variant of ThingsHandleWidget.
 *  Fills its parent's height (parent supplies the 9:16 aspect via
 *  style={{ aspectRatio: '9 / 16' }}). No internal scrolling. */
export default function ThingsHandleFullWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);

  const [idx, setIdx] = useState(0);
  const current = coming.length ? coming[idx % coming.length] : null;
  const atStart = idx === 0;
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
  const units = [
    { v: pad(dDay), l: "Dagen" },
    { v: pad(dHr), l: "Uren" },
    { v: pad(dMin), l: "Min" },
    { v: pad(dSec), l: "Sec" },
  ];

  return (
    <div className="relative h-full w-full rounded-[28px] overflow-hidden cursor-pointer" onClick={() => openModule("personaladmin")}>
      <motion.img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 8%, rgba(20,22,26,0.42) 50%, rgba(20,22,26,0.20) 100%)" }} />

      {/* ACHTER: Next/Terug + neon klok (vult breedte) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-0 flex flex-col justify-end px-3 pb-4 gap-3" style={{ color: IVORY }}>
        <div className="flex items-center justify-between">
          {atStart ? (
            <p className="text-[8px] uppercase tracking-[0.22em] opacity-55">Next in the list</p>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setIdx(0); }} className="p-0.5" aria-label="terug naar start">
              <ArrowLeft size={13} style={{ color: IVORY, opacity: 0.85 }} />
            </button>
          )}
          {coming.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % coming.length); }} className="p-0.5" aria-label="volgende">
              <ArrowRight size={13} style={{ color: IVORY, opacity: 0.85 }} />
            </button>
          )}
        </div>
        <div className="flex items-end justify-between">
          {units.map((u, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <span className="text-[6.5px] uppercase tracking-[0.14em] mb-1" style={{ color: NEON, opacity: 0.6 }}>{u.l}</span>
                <span className="text-[36px] font-display font-black tabular-nums leading-none tracking-[-0.05em]" style={{ color: NEON, textShadow: `0 0 8px ${NEON}, 0 0 18px ${NEON}99` }}>{hasCurrent ? u.v : "—"}</span>
              </div>
              {i < units.length - 1 && (
                <span className="text-[36px] font-display font-black leading-none" style={{ color: NEON, opacity: 0.7, textShadow: `0 0 8px ${NEON}` }}>:</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* HEADER — WidgetHeader (briefing-klok) */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 z-10" style={{ color: IVORY, "--tile-accent": PISTACHIO, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
        <WidgetHeader type="briefing" label="Things to Handle!" count={overdue.length ? `${overdue.length} te laat` : ""} />
      </div>

      {/* GLASKAART (flush, minder blur) — schuift omhoog bij tik */}
      <motion.button
        type="button"
        onClick={(e) => { e.stopPropagation(); setUp((v) => !v); }}
        className="absolute left-0 right-0 top-0 h-1/2 rounded-[24px] overflow-hidden text-left block z-20"
        initial={false}
        animate={{ y: up ? "0%" : "100%", boxShadow: up ? "0 14px 34px -10px rgba(0,0,0,0.50)" : "0 -14px 34px -10px rgba(0,0,0,0.50)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "rgba(120,128,133,0.18)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)" }}
      >
        {/* WIT ghost-cijfer links-onder, half afgesneden */}
        <span className="absolute pointer-events-none select-none" style={{ left: "-12px", bottom: "-48px", fontSize: "190px", lineHeight: "0.78", fontWeight: 800, color: IVORY, opacity: 0.16, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{coming.length}</span>

        <div className="absolute inset-0 p-4 flex flex-col justify-between" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
          <div>
            <p className="text-[26px] font-black leading-[0.9] opacity-85 tracking-[-0.02em]">WHEN</p>
            <p className="text-[26px] font-black leading-[0.9] opacity-85 tracking-[-0.02em]">TO HANDLE?</p>
            <motion.p key={status.label} className="text-[26px] font-display font-black leading-[0.9] mt-2 tracking-[-0.03em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ color: status.color }}>{status.label}</motion.p>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 shrink-0">op komst</p>
              <p className="text-[10px] uppercase tracking-[0.2em] truncate" style={{ color: PISTACHIO }}>{hasCurrent ? `${current.title} · €${current.amount || 0}` : "—"}</p>
            </div>
            <p className="text-[9px] uppercase tracking-[0.16em] opacity-50 mt-1">{weather.sub}</p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}