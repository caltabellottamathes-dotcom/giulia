import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetHeader, CountUp, BarPulse } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { fmtDaysAgo } from "@/lib/hobbyUtils";
import HobbyEditPanel from "./HobbyEditPanel";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/f414f8166_HOBBIES.jpeg";
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";
const BLUE = "hsl(205 45% 32%)";

/* 3 categorieën in 3 kleuren — Muziek / Kunst / Sport */
const THEMES = { Muziek: "#d0d9dd", Kunst: "#d8dab3", Sport: "#dbdbd6" };

function hobbyTheme(h) {
  const cat = String(h.category || "").toLowerCase();
  if (cat === "muziek" || h.type === "music") return { name: "Muziek", color: THEMES.Muziek };
  if (cat === "kunst" || h.type === "creative") return { name: "Kunst", color: THEMES.Kunst };
  if (cat === "sport" || h.type === "sport") return { name: "Sport", color: THEMES.Sport };
  return { name: h.category || "Sport", color: h.color || THEMES.Sport };
}

/** ThingsLoveWidget — G·1:1·SPLIT met BarPulse + fotokaart, horizontale slide.
 *  Links: BarPulse (6 hobby's, gelabeld, gekleurd per categorie). Rechts:
 *  fotokaart met de 3 categorieën + kleuren (balans-zicht). Tik op een bar →
 *  fotokaart schuift naar links (4 afgeronde hoeken, flush), rechts verschijnt
 *  het edit-paneel voor die hobby. Schuifrichting: links ↔ rechts (zoals
 *  Dinner boven ↔ beneden). */
export default function ThingsLoveWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: hobbies } = useEntityList("Hobby", { realtime: true, externalTick: learnTick });
  const [selectedId, setSelectedId] = useState(null);

  const bars = useMemo(() => {
    return (hobbies || [])
      .map((h) => ({
        id: h.id,
        title: h.title,
        theme: hobbyTheme(h),
        level: typeof h.level === "number" ? h.level : 0,
        status: h.status || "active",
        raw: h,
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, 6);
  }, [hobbies]);

  const active = bars.filter((b) => b.status !== "inactive").length;
  const selected = bars.find((b) => b.id === selectedId) || null;

  const catStats = useMemo(() => {
    const out = {};
    bars.forEach((b) => {
      if (!out[b.theme.name]) out[b.theme.name] = { count: 0, total: 0 };
      out[b.theme.name].count += 1;
      out[b.theme.name].total += b.level;
    });
    return out;
  }, [bars]);

  const handleUpdate = async (patch) => {
    if (!selected) return;
    try {
      await base44.entities.Hobby.update(selected.id, patch);
    } catch {
      /* realtime refresht de lijst */
    }
  };

  const glassShell = {
    background: "rgba(120,128,133,0.16)",
    backdropFilter: "blur(22px) saturate(1.35)",
    WebkitBackdropFilter: "blur(22px) saturate(1.35)",
    border: "1px solid rgba(255,255,255,0.14)",
  };

  return (
    <div className="relative w-full aspect-[3/2] rounded-[28px] overflow-hidden cursor-pointer" style={{ "--tile-accent": DEEP, color: BLUE }} onClick={() => openModule("hobbies")}>
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={glassShell} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* LINKS: BarPulse (overzicht) */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            key="bars"
            className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* legenda — 3 categorieën met kleur (klik → module) */}
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2.5 cursor-pointer" onClick={() => openModule("hobbies")}>
              {Object.entries(THEMES).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-[7.5px] uppercase tracking-[0.12em] opacity-55">{name}</span>
                </div>
              ))}
            </div>

            {/* BarPulse — één per hobby, gelabeld + gekleurd per categorie */}
            <div className="flex-1 flex items-end mt-3 min-h-0">
              <BarPulse
                items={bars.map((b) => ({
                  key: b.id,
                  value: b.level,
                  label: b.title.split(" ")[0],
                  color: b.status === "inactive" ? "hsl(var(--muted-foreground))" : b.theme.color,
                  inactive: b.status === "inactive",
                  selected: selectedId === b.id,
                  onClick: () => setSelectedId(b.id),
                }))}
                height="100%"
                gap={6}
                className="w-full"
              />
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-1.5">tik een bar → detail</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOTOKAART — schuift rechts ↔ links (4 hoeken, flush), zoals Dinner boven ↔ beneden */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden rounded-[24px]"
        initial={false}
        animate={{ left: selected ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "50%", boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.42), 12px 0 30px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
        onClick={selected ? (e) => { e.stopPropagation(); setSelectedId(null); } : undefined}
      >
        <img src={selected ? selected.raw.image || PHOTO : PHOTO} alt="Things I Love" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.40), rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.18))" }}
        />
        {selected ? (
          <div className="absolute inset-0 p-4 flex flex-col" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: selected.theme.color }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{selected.theme.name}</span>
            </div>
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{selected.title}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">niveau {selected.level}/8 · {fmtDaysAgo(selected.raw.last_activity_date)}</p>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums">{selected.level}</span>
              <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mb-1">/ 8 bezigheid</p>
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] mt-2 opacity-50">tik → terug</p>
          </div>
        ) : (
          <div className="absolute inset-0 p-3.5 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <WidgetHeader type="energy" label="Things I Love." count={active ? `${active} levend` : ""} />
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{active > 0 ? `${active} THINGS ALIVE` : "QUIETLY CREATIVE"}</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-60">{bars.length} hobby's in je veld</p>
            <div className="mt-auto space-y-2">
              {Object.entries(THEMES).map(([name, color]) => {
                const st = catStats[name] || { count: 0, total: 0 };
                return (
                  <div key={name} className="flex items-center gap-2">
                    <span className="h-9 w-2 rounded-full shrink-0" style={{ background: color }} />
                    <div className="flex-1">
                      <p className="text-[12px] font-display font-semibold leading-none">{name}</p>
                      <p className="text-[9px] uppercase tracking-[0.14em] opacity-60 mt-1">{st.count} hobby's · lvl {st.total}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* RECHTS: edit-paneel (alleen bij selectie) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="edit"
            className="absolute inset-y-0 right-0 w-1/2 z-30 overflow-hidden rounded-r-[24px]"
            style={glassShell}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <HobbyEditPanel hobby={selected.raw} theme={selected.theme} level={selected.level} onUpdate={handleUpdate} onClose={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}