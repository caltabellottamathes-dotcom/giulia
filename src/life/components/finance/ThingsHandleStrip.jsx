import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const RIDGE = "#b1bec6";
const NEON = "#d8dab3";

const DAY = 86400000;
const isActive = (o) => !!o && o.status !== "done";
const effDate = (o) => o?.next_payment_date || o?.due_date;
const daysUntil = (o) => { const d = effDate(o); return d ? Math.round((new Date(d).getTime() - Date.now()) / DAY) : null; };
const amt = (o) => Number(o?.expected_amount ?? o?.amount) || 0;

function pressure(diff) {
  if (diff == null) return { label: "YOU'RE FINE!", color: OLIVE };
  if (diff < 0) return { label: "MISSED.", color: PISTACHIO };
  const d = Math.floor(diff / DAY);
  if (d >= 15) return { label: "YOU'RE FINE!", color: OLIVE };
  if (d >= 7) return { label: "YOU'VE GOT TIME.", color: OLIVE };
  if (d >= 3) return { label: "KEEP AN EYE.", color: RIDGE };
  if (d >= 1) return { label: "DEAL WITH IT!", color: RIDGE };
  return { label: "NOW, PLEASE!", color: PISTACHIO };
}

/** ThingsHandleStrip — brede horizontale strook-versie van ThingsHandleWidget
 *  (volledige breedte op de Lasten-tab). Zelfde functies: live neon klok,
 *  next/terug navigatie, pinnen via agendaklik, schuivende glaskaart met status. */
export default function ThingsHandleStrip() {
  const navigate = useNavigate();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const coming = useMemo(
    () => (obs || []).filter(isActive).filter(effDate).filter((o) => o.title).sort((a, b) => daysUntil(a) - daysUntil(b)),
    [obs]
  );
  const overdue = useMemo(() => coming.filter((o) => daysUntil(o) < 0), [coming]);
  const sub = overdue.length ? `${overdue.length} te laat — pak het op.` : coming.length === 0 ? "Alles is bij." : coming.length <= 2 ? `${coming.length} op komst.` : `${coming.length} zaken komen eraan.`;

  const [idx, setIdx] = useState(0);
  const [pinned, setPinned] = useState(null);
  const current = pinned || (coming.length ? coming[idx % coming.length] : null);
  const atStart = idx === 0;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const diff = current ? new Date(effDate(current)).getTime() - now : null;
  const hasCurrent = !!current;
  const safe = Math.max(0, diff || 0);
  const dDay = Math.floor(safe / 86400000);
  const dHr = Math.floor((safe % 86400000) / 3600000);
  const dMin = Math.floor((safe % 3600000) / 60000);
  const dSec = Math.floor((safe % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const status = pressure(diff);

  const [up, setUp] = useState(false);
  useEffect(() => {
    const h = (ev) => { setPinned(ev.detail); setUp(true); };
    window.addEventListener("giulia:things-handle-select", h);
    return () => window.removeEventListener("giulia:things-handle-select", h);
  }, []);

  const units = [
    { v: pad(dDay), l: "Dagen" },
    { v: pad(dHr), l: "Uren" },
    { v: pad(dMin), l: "Min" },
    { v: pad(dSec), l: "Sec" },
  ];

  return (
    <div className="relative w-full h-[150px] shrink-0 rounded-[24px] overflow-hidden cursor-pointer" onClick={() => navigate("/life/admin")} style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.45)" }}>
      <motion.img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 10%, rgba(20,22,26,0.42) 55%, rgba(20,22,26,0.30) 100%)" }} />

      {/* HEADER — links label, rechts navigatie */}
      <div className="absolute top-0 inset-x-0 px-5 pt-4 z-10 flex items-center justify-between" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}>
        <div className="flex items-center gap-3">
          <p className="text-[10px] uppercase tracking-[0.24em] font-bold">Things to Handle!</p>
          {overdue.length > 0 && <span className="text-[9px] uppercase tracking-[0.16em] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(216,218,179,0.22)", color: PISTACHIO }}>{overdue.length} te laat</span>}
        </div>
        <div className="flex items-center gap-3">
          {pinned ? (
            <button onClick={(e) => { e.stopPropagation(); setPinned(null); setUp(false); }} className="p-0.5" aria-label="terug naar lijst"><ArrowLeft size={15} style={{ color: IVORY, opacity: 0.85 }} /></button>
          ) : atStart ? (
            <p className="text-[8px] uppercase tracking-[0.22em] opacity-55">Next in the list</p>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setIdx(0); }} className="p-0.5" aria-label="terug naar start"><ArrowLeft size={15} style={{ color: IVORY, opacity: 0.85 }} /></button>
          )}
          {coming.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setPinned(null); setIdx((i) => (i + 1) % coming.length); }} className="p-0.5" aria-label="volgende"><ArrowRight size={15} style={{ color: IVORY, opacity: 0.85 }} /></button>
          )}
        </div>
      </div>

      {/* NEON KLOK — horizontaal over de strook */}
      <div className="absolute bottom-0 inset-x-0 px-5 pb-4 z-0 flex items-end justify-between" style={{ color: IVORY }}>
        <div className="flex items-end gap-3">
          {units.map((u, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <span className="text-[6.5px] uppercase tracking-[0.14em] mb-1" style={{ color: NEON, opacity: 0.6 }}>{u.l}</span>
                <span className="text-[30px] font-display font-black tabular-nums leading-none tracking-[-0.05em]" style={{ color: NEON, textShadow: `0 0 8px ${NEON}, 0 0 18px ${NEON}99` }}>{hasCurrent ? u.v : "—"}</span>
              </div>
              {i < units.length - 1 && (
                <span className="text-[30px] font-display font-black leading-none" style={{ color: NEON, opacity: 0.7, textShadow: `0 0 8px ${NEON}` }}>:</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[9px] uppercase tracking-[0.16em] opacity-55 hidden sm:block">{sub}</p>
      </div>

      {/* SCHUIVENDE GLASKAART — volledige breedte, schuift omhoog bij tik */}
      <motion.button
        type="button"
        onClick={(e) => { e.stopPropagation(); setUp((v) => !v); }}
        className="absolute left-0 right-0 bottom-0 h-full rounded-[24px] overflow-hidden text-left block z-20"
        initial={false}
        animate={{ y: up ? "0%" : "100%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "rgba(120,128,133,0.18)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: up ? "0 14px 34px -10px rgba(0,0,0,0.50)" : "none" }}
      >
        <span className="absolute pointer-events-none select-none" style={{ left: "-12px", bottom: "-64px", fontSize: "190px", lineHeight: "0.78", fontWeight: 800, color: IVORY, opacity: 0.16, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{coming.length}</span>
        <div className="absolute inset-0 px-5 flex items-center justify-between gap-4" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
          <div className="min-w-0">
            <p className="text-[22px] font-black leading-[0.9] opacity-85 tracking-[-0.02em]">WHEN</p>
            <p className="text-[22px] font-black leading-[0.9] opacity-85 tracking-[-0.02em]">TO HANDLE?</p>
            <motion.p key={status.label} className="text-[22px] font-display font-black leading-[0.9] mt-1.5 tracking-[-0.03em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ color: status.color }}>{status.label}</motion.p>
          </div>
          <div className="text-right shrink-0 max-w-[55%]">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">op komst</p>
            <p className="text-[12px] uppercase tracking-[0.12em] truncate font-semibold" style={{ color: PISTACHIO }}>{hasCurrent ? `${current.title} · €${amt(current)}` : "—"}</p>
            <p className="text-[9px] uppercase tracking-[0.16em] opacity-50 mt-1">{sub}</p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}