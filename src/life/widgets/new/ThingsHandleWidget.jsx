import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { adminWeather, comingUp, overdueList, nextThing } from "@/lib/adminUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3";
const URGENT = "#d5e24a";
const R = 30, C = 2 * Math.PI * R;

/** ThingsHandleWidget — P·9x16·SLIDE · "Things to Handle!"
 *  Full-bleed admin-foto + donkere gradient. Boven: geanimeerde header. Achter
 *  (onderste helft): een grafische aftelklok in Whipped Pistachio met daarboven
 *  de eerstvolgende zaak. Onderste helft = glaskaart (flush, 4 hoeken) met de
 *  "TO HANDLE"-titel + capacity-ring. Tik op de kaart → schuift omhoog (zoals
 *  05 Dinner) en onthult de klok; kaart beneden = klok blurred achter glas. */
export default function ThingsHandleWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);
  const next = useMemo(() => nextThing(obs || []), [obs]);

  const total = (obs || []).filter((o) => o.status !== "done").length;
  const clearPct = total === 0 ? 100 : Math.max(0, Math.round((1 - overdue.length / total) * 100));
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(clearPct), 300); return () => clearTimeout(t); }, [clearPct]);
  const off = C - (val / 100) * C;
  const ringColor = overdue.length ? URGENT : "#b1bec6";

  // aftelklok naar eerstvolgende zaak
  const target = next?.due_date ? new Date(next.due_date).getTime() : null;
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  const diff = target ? Math.max(0, target - now) : 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const pad = (n) => String(n).padStart(2, "0");
  const hasNext = !!next;
  const clockBlocks = [
    { v: pad(d), l: "Dagen" },
    { v: pad(h), l: "Uren" },
    { v: pad(m), l: "Min" },
  ];

  const [up, setUp] = useState(false);

  return (
    <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden">
      {/* foto + gradient */}
      <motion.img src={PHOTO} alt="Things to Handle" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 8%, rgba(20,22,26,0.40) 50%, rgba(20,22,26,0.20) 100%)" }} />

      {/* ACHTER: aftelklok (onderste helft) — onthuld als de kaart omhoog schuift */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-0 flex flex-col justify-center px-5 cursor-pointer" style={{ color: IVORY }} onClick={() => openModule("personaladmin")}>
        <p className="text-[8px] uppercase tracking-[0.22em] opacity-55 mb-1.5">Eerst volgende</p>
        <p className="text-[13px] font-display font-semibold leading-tight mb-5 truncate" style={{ color: PISTACHIO }}>{hasNext ? next.title : "Niets op komst"}</p>
        <div className="flex items-end justify-between">
          {clockBlocks.map((b, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[42px] font-display font-bold tabular-nums leading-none" style={{ color: PISTACHIO }}>{hasNext ? b.v : "—"}</span>
              <span className="text-[8px] uppercase tracking-[0.28em] mt-2.5" style={{ color: PISTACHIO, opacity: 0.6 }}>{b.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER (boven) — geanimeerde titel */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 z-10 flex items-center justify-between" style={{ color: IVORY }}>
        <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-90" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Things to Handle!</motion.p>
        {overdue.length > 0 && <span className="text-[8px] uppercase tracking-[0.14em] font-bold px-2 py-0.5 rounded-full" style={{ background: URGENT + "22", color: URGENT, border: `1px solid ${URGENT}55` }}>{overdue.length} te laat</span>}
      </div>

      {/* GLASKAART (onderste helft, flush, 4 hoeken) — schuift omhoog bij tik */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 top-0 h-1/2 rounded-[24px] overflow-hidden text-left block z-20"
        initial={false}
        animate={{ y: up ? "0%" : "100%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "rgba(30,32,36,0.42)", backdropFilter: "blur(30px) saturate(1.45)", WebkitBackdropFilter: "blur(30px) saturate(1.45)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 -14px 32px -14px rgba(0,0,0,0.5), 0 14px 32px -14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)" }}
      >
        <div className="absolute inset-0 p-4 flex flex-col justify-between" style={{ color: IVORY }}>
          <div className="flex flex-col gap-3">
            <motion.h2 className="text-[30px] leading-[0.9] font-display font-bold tracking-[-0.04em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>TO<br />HANDLE</motion.h2>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 80 80" className="h-12 w-12 shrink-0">
                <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" />
                <motion.circle cx="40" cy="40" r={R} fill="none" stroke={ringColor} strokeWidth="5" strokeLinecap="round" transform="rotate(-90 40 40)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }} />
              </svg>
              <div>
                <CountUp value={val} className="text-[24px] font-display font-semibold tabular-nums leading-none block text-ivory" />
                <span className="text-[8px] uppercase tracking-[0.2em] opacity-65">on track</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] opacity-60">{coming.length} op komst · {weather.sub}</p>
            <p className="text-[8px] uppercase tracking-[0.2em] mt-2 opacity-50">{up ? "tik → terug" : "tik → countdown"}</p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}