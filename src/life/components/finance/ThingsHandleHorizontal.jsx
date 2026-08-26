import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetHeader, BarPulse } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { base44 } from "@/api/base44Client";
import { logLifeActivity } from "@/lib/lifeActivity";
import { adminWeather, comingUp, overdueList } from "@/lib/adminUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const DEEP = "hsl(var(--life-olive))";
const IVORY = "hsl(var(--ivory))";
const SMOKE = "hsl(var(--smoke))";

/** ThingsHandleHorizontal — G·3:2·SPLIT, exact als ThingsILove (hobbies):
 *  links een BarPulse (komende lasten, gekleurd per portefeuille-kleur), rechts
 *  een fotokaart die links ↔ rechts schuift. Tik een bar → fotokaart schuift
 *  naar links + rechts verschijnt het actie-paneel (markeer betaald). */
export default function ThingsHandleHorizontal() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true, externalTick: learnTick });
  const [selectedId, setSelectedId] = useState(null);

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);
  const potColor = (id) => (portfolios || []).find((p) => p.id === id)?.color || SMOKE;

  const bars = useMemo(
    () => coming.slice(0, 6).map((e) => ({ id: e.id, title: e.title, value: Number(e.amount) || 1, color: potColor(e.portfolio_id), raw: e })),
    [coming, portfolios] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const selected = bars.find((b) => b.id === selectedId) || null;
  const active = coming.length;

  const markDone = async (e) => {
    try {
      await base44.entities.AdminObligation.update(e.id, { status: "done", last_payment_date: new Date().toISOString().slice(0, 10) });
      await logLifeActivity("Finance", "completed", `${e.title} afgerekend`);
      setSelectedId(null);
    } catch { /* ignore */ }
  };

  const glassShell = { background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" };

  return (
    <div className="relative w-full aspect-[3/2] rounded-[28px] overflow-hidden cursor-pointer" style={{ "--tile-accent": DEEP, color: IVORY, boxShadow: "-26px 30px 64px -22px rgba(0,0,0,0.45)" }} onClick={() => openModule("personaladmin")}>
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={glassShell} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* LINKS: BarPulse (komende lasten) */}
      <AnimatePresence>
        {!selected && (
          <motion.div key="bars" className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mt-2.5">
              <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Things to Handle!</h3>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: "hsl(var(--life-pistachio))" }}>{active} op komst</span>
            </div>
            <div className="flex-1 flex items-end mt-3 min-h-0">
              {bars.length ? (
                <BarPulse
                  items={bars.map((b) => ({ key: b.id, value: b.value, label: b.title.split(" ")[0], color: b.color, selected: selectedId === b.id, onClick: () => setSelectedId(b.id) }))}
                  height="100%"
                  gap={6}
                  className="w-full"
                />
              ) : (
                <p className="text-sm italic text-ivory/45">Rustig — niets op komst.</p>
              )}
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-1.5">{weather.sub}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOTOKAART — schuift links ↔ rechts (4 hoeken, flush) */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden rounded-[24px]"
        initial={false}
        animate={{ left: selected ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "50%", boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.42), 12px 0 30px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
        onClick={selected ? (e) => { e.stopPropagation(); setSelectedId(null); } : undefined}
      >
        <img src={PHOTO} alt="Things to Handle" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.20))" }} />
        {selected ? (
          <div className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: selected.color }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">last</span>
            </div>
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{selected.title}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">€{Math.round(selected.value)} · {selected.raw.daysUntil < 0 ? "te laat" : `${selected.raw.daysUntil}d`}</p>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-[40px] leading-[0.8] font-display font-semibold tabular-nums">{Math.abs(selected.raw.daysUntil)}</span>
              <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mb-1">{selected.raw.daysUntil < 0 ? "dagen te laat" : "dagen"}</p>
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] mt-2 opacity-50">tik → terug</p>
          </div>
        ) : (
          <div className="absolute inset-0 p-3.5 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <WidgetHeader type="briefing" label="Things to Handle!" count={overdue.length ? `${overdue.length} te laat` : ""} />
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{overdue.length > 0 ? `${overdue.length} TE LAAT` : active > 0 ? `${active} OP KOMST` : "YOU'RE FINE!"}</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-60">{active} lasten in de lijst</p>
            <div className="mt-auto space-y-1.5">
              {coming.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center gap-2">
                  <span className="h-7 w-2 rounded-full shrink-0" style={{ background: potColor(e.portfolio_id) }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-display font-semibold leading-none truncate">{e.title}</p>
                    <p className="text-[8px] uppercase tracking-[0.14em] opacity-60 mt-1">€{Math.round(e.amount)} · {e.daysUntil < 0 ? "te laat" : `${e.daysUntil}d`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* RECHTS: actie-paneel bij selectie */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="act"
            className="absolute inset-y-0 right-0 w-1/2 z-30 overflow-hidden rounded-r-[24px]"
            style={glassShell}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY }}>
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-ivory/70">{selected.title}</p>
              <h3 className="text-[18px] font-display font-semibold mt-1">€{Math.round(selected.value)}</h3>
              <p className="text-[10px] uppercase tracking-[0.14em] opacity-70 mt-1">{selected.raw.daysUntil < 0 ? "Te laat" : `Over ${selected.raw.daysUntil} dagen`}</p>
              <div className="mt-auto space-y-2">
                <button onClick={() => markDone(selected.raw)} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ivory text-charcoal px-3 py-2 text-xs font-semibold">Markeer betaald</button>
                <button onClick={() => openModule("personaladmin")} className="w-full inline-flex items-center justify-center rounded-full bg-white/10 text-ivory px-3 py-2 text-xs font-semibold">Open in admin</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}