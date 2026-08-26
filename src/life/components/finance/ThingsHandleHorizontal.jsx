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
 *  De foto is de shell (volle achtergrond); de glazen kaart schuift links ↔
 *  rechts bij een tik. Schaduw zwevend naar links. */
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

  const [right, setRight] = useState(false);

  return (
    <div
      className="relative w-full aspect-[16/9] rounded-[28px] overflow-hidden cursor-pointer"
      onClick={() => openModule("personaladmin")}
      style={{ boxShadow: "-26px 30px 64px -22px rgba(0,0,0,0.45)" }}
    >
      {/* foto — de shell (volle achtergrond) */}
      <img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.82) 6%, rgba(20,22,26,0.35) 55%, rgba(20,22,26,0.25) 100%)" }} />
      <span className="absolute pointer-events-none select-none right-6" style={{ bottom: "-32px", fontSize: "150px", lineHeight: "0.78", fontWeight: 800, color: IVORY, opacity: 0.12, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{coming.length}</span>

      {/* glazen kaart — schuift links ↔ rechts bij tik */}
      <motion.div
        onClick={(e) => { e.stopPropagation(); setRight((v) => !v); }}
        className="absolute left-0 top-0 h-full w-1/2 z-10 rounded-[28px] overflow-hidden"
        initial={false}
        animate={{ x: right ? "100%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "rgba(120,128,133,0.32)", backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 18px 40px -18px rgba(0,0,0,0.45)" }}
      >
        <div className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <div className="flex items-center justify-between gap-2">
            <WidgetHeader type="briefing" label="Things to Handle!" count={overdue.length ? `${overdue.length} te laat` : ""} />
            <div className="flex items-center gap-1.5 shrink-0">
              {coming.length > 1 && (
                <>
                  {!atStart && (
                    <button onClick={(e) => { e.stopPropagation(); setIdx(0); }} className="p-0.5" aria-label="terug naar start"><ArrowLeft size={13} style={{ color: IVORY, opacity: 0.85 }} /></button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % coming.length); }} className="p-0.5" aria-label="volgende"><ArrowRight size={13} style={{ color: IVORY, opacity: 0.85 }} /></button>
                </>
              )}
            </div>
          </div>

          <motion.p key={status.label} className="text-[20px] sm:text-[24px] font-display font-black leading-[1] mt-3 tracking-[-0.03em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ color: status.color }}>{status.label}</motion.p>

          <div className="flex items-end justify-between mt-4">
            {units.map((u, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <span className="text-[6.5px] uppercase tracking-[0.14em] mb-1" style={{ color: NEON, opacity: 0.6 }}>{u.l}</span>
                  <span className="text-[20px] sm:text-[24px] font-display font-black tabular-nums leading-none tracking-[-0.05em]" style={{ color: NEON, textShadow: `0 0 8px ${NEON}, 0 0 18px ${NEON}99` }}>{hasCurrent ? u.v : "—"}</span>
                </div>
                {i < units.length - 1 && (
                  <span className="text-[20px] sm:text-[24px] font-display font-black leading-none" style={{ color: NEON, opacity: 0.7, textShadow: `0 0 8px ${NEON}` }}>:</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 shrink-0">op komst</p>
              <p className="text-[10px] uppercase tracking-[0.14em] truncate" style={{ color: PISTACHIO }}>{hasCurrent ? `${current.title} · €${current.amount || 0}` : "—"}</p>
            </div>
            <p className="text-[8px] uppercase tracking-[0.16em] opacity-50 mt-1">{weather.sub}</p>
            <p className="text-[8px] uppercase tracking-[0.2em] mt-2" style={{ color: "rgba(255,255,255,0.7)" }}>{right ? "tik → links" : "tik → rechts"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}