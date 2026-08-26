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

/** pressure → LIFE-tier label + kleur. */
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

/** ThingsHandleHorizontal — G·16:9 · "Things to Handle!"
 *  Horizontale variant (zoals DinnerWidget): glazen shell met links de foto-
 *  kaart (WHEN / TO HANDLE? + status) en rechts de neon countdown + op komst. */
export default function ThingsHandleHorizontal() {
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
  const units = [
    { v: pad(dDay), l: "Dagen" },
    { v: pad(dHr), l: "Uren" },
    { v: pad(dMin), l: "Min" },
    { v: pad(dSec), l: "Sec" },
  ];

  return (
    <div className="relative w-full aspect-[16/9] rounded-[28px] overflow-hidden cursor-pointer" onClick={() => openModule("personaladmin")} style={{ "--tile-accent": PISTACHIO, color: IVORY }}>
      {/* glass shell */}
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-20" style={{ background: `linear-gradient(90deg, transparent, ${PISTACHIO} 18%, ${PISTACHIO} 82%, transparent)` }} />

      {/* LINKS — foto-kaart met WHEN / TO HANDLE? + status */}
      <div className="absolute left-0 top-0 h-full w-[46%] z-10 overflow-hidden">
        <motion.img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 8%, rgba(20,22,26,0.42) 50%, rgba(20,22,26,0.25) 100%)" }} />
        <span className="absolute pointer-events-none select-none" style={{ right: "-14px", bottom: "-26px", fontSize: "120px", lineHeight: "0.78", fontWeight: 800, color: IVORY, opacity: 0.14, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{coming.length}</span>
        <div className="absolute inset-0 p-3.5 flex flex-col" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <WidgetHeader type="briefing" label="Things to Handle!" count={overdue.length ? `${overdue.length} te laat` : ""} />
          <div className="mt-auto">
            <p className="text-[18px] font-black leading-[0.9] opacity-85 tracking-[-0.02em]">WHEN</p>
            <p className="text-[18px] font-black leading-[0.9] opacity-85 tracking-[-0.02em]">TO HANDLE?</p>
            <motion.p key={status.label} className="text-[18px] font-display font-black leading-[0.9] mt-1.5 tracking-[-0.03em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ color: status.color }}>{status.label}</motion.p>
          </div>
        </div>
      </div>

      {/* RECHTS — shell met countdown + op komst */}
      <div className="absolute right-0 top-0 h-full w-[54%] z-0 flex flex-col justify-between p-3.5 pl-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
        <div className="flex items-center justify-end gap-1.5">
          {coming.length > 1 && (
            <>
              {!atStart && (
                <button onClick={(e) => { e.stopPropagation(); setIdx(0); }} className="p-0.5" aria-label="terug naar start"><ArrowLeft size={13} style={{ color: IVORY, opacity: 0.85 }} /></button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % coming.length); }} className="p-0.5" aria-label="volgende"><ArrowRight size={13} style={{ color: IVORY, opacity: 0.85 }} /></button>
            </>
          )}
        </div>

        <div className="flex items-end justify-between">
          {units.map((u, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <span className="text-[6.5px] uppercase tracking-[0.14em] mb-1" style={{ color: NEON, opacity: 0.6 }}>{u.l}</span>
                <span className="text-[22px] sm:text-[26px] font-display font-black tabular-nums leading-none tracking-[-0.05em]" style={{ color: NEON, textShadow: `0 0 8px ${NEON}, 0 0 18px ${NEON}99` }}>{hasCurrent ? u.v : "—"}</span>
              </div>
              {i < units.length - 1 && (
                <span className="text-[22px] sm:text-[26px] font-display font-black leading-none" style={{ color: NEON, opacity: 0.7, textShadow: `0 0 8px ${NEON}` }}>:</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 shrink-0">op komst</p>
            <p className="text-[10px] uppercase tracking-[0.16em] truncate" style={{ color: PISTACHIO }}>{hasCurrent ? `${current.title} · €${current.amount || 0}` : "—"}</p>
          </div>
          <p className="text-[8px] uppercase tracking-[0.16em] opacity-50 mt-1">{weather.sub}</p>
        </div>
      </div>
    </div>
  );
}