import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { hobbyGroups, hobbyHeadline, hobbyState, stateColor, fieldSize, fmtDaysAgo } from "@/lib/hobbyUtils";
import HobbyEditPanel from "./HobbyEditPanel";

const PHOTO = IMAGES.lifeW4Love;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";

/* 4 thema's in 4 kleuren — Ridge Sky / Olive / Whipped Pistachio / Morning dew */
const THEMES = { Muziek: "#b1bec6", Kunst: "#94925d", Sport: "#d8dab3", Social: "#cfd9dd" };
const LEVEL_FOR = { active: 8, new: 7, reactivating: 6, emerging: 5, quiet: 3, archived: 1 };

function hobbyTheme(h) {
  const cat = String(h.category || "").toLowerCase();
  if (cat === "muziek" || h.type === "music") return { name: "Muziek", color: THEMES.Muziek };
  if (cat === "kunst" || ["creative", "cultural"].includes(h.type)) return { name: "Kunst", color: THEMES.Kunst };
  if (cat === "sport" || h.type === "sport") return { name: "Sport", color: THEMES.Sport };
  return { name: "Social", color: THEMES.Social };
}
function levelFor(h) {
  const lvl = LEVEL_FOR[h.activity_level];
  if (lvl != null) return lvl;
  return Math.max(1, Math.round(fieldSize(h) * 8));
}

const _now = Date.now();
const _d = (days) => new Date(_now - days * 86400000).toISOString();
const _dd = (days) => new Date(_now - days * 86400000).toISOString().slice(0, 10);
/* Mock-hobby's — vullen aan tot 6 als er minder echte in de DB staan.
 * Elke op een ander niveau (8,7,6,5,3,1) en verdeeld over de 4 thema's. */
const MOCK_HOBBIES = [
  { id: "mock-gitaar", title: "Gitaar Spelen", type: "music", category: "Muziek", status: "active", activity_level: "active", last_activity_date: _d(1), discovered_date: _dd(400), __mock: true },
  { id: "mock-hardlopen", title: "Hardlopen", type: "sport", category: "Sport", status: "active", activity_level: "new", last_activity_date: _d(2), discovered_date: _dd(3), __mock: true },
  { id: "mock-schilderen", title: "Schilderen", type: "creative", category: "Kunst", status: "active", activity_level: "reactivating", last_activity_date: _d(9), discovered_date: _dd(300), __mock: true },
  { id: "mock-fotografie", title: "Fotografie", type: "creative", category: "Kunst", status: "active", activity_level: "emerging", last_activity_date: _d(40), discovered_date: _dd(120), __mock: true },
  { id: "mock-kookclub", title: "Kookclub", type: "cultural", category: "Social", status: "active", activity_level: "quiet", last_activity_date: _d(25), discovered_date: _dd(200), __mock: true },
  { id: "mock-piano", title: "Piano", type: "music", category: "Muziek", status: "inactive", activity_level: "archived", last_activity_date: _d(90), discovered_date: _dd(500), __mock: true },
];

/** ThingsLoveWidget — G·3:2·R·SIDE met gelabelde staven + slide-naar-detail.
 *  Links: 6 gelabelde staven (top 6 op bezigheid), gekleurd per thema.
 *  Rechts: fotokaart (overzicht). Tik op een staaf → fotokaart schuift naar
 *  links, rechts verschijnt een edit-paneel voor die hobby. */
export default function ThingsLoveWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: hobbies } = useEntityList("Hobby", { realtime: true, externalTick: learnTick });
  const [mockHobbies, setMockHobbies] = useState(MOCK_HOBBIES);
  const [selectedId, setSelectedId] = useState(null);

  const bars = useMemo(() => {
    const real = hobbies || [];
    let list = real.slice();
    if (list.length < 6) list = [...list, ...mockHobbies.slice(0, 6 - list.length)];
    return list
      .map((h) => ({
        id: h.id,
        title: h.title,
        theme: hobbyTheme(h),
        level: levelFor(h),
        state: hobbyState(h),
        status: h.status || "active",
        isMock: !!h.__mock,
        raw: h,
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, 6);
  }, [hobbies, mockHobbies]);

  const groups = useMemo(() => hobbyGroups([...(hobbies || []), ...mockHobbies]), [hobbies, mockHobbies]);
  const headline = hobbyHeadline(groups);
  const active = bars.filter((b) => b.status !== "inactive").length;
  const selected = bars.find((b) => b.id === selectedId) || null;

  const handleUpdate = async (patch) => {
    if (!selected) return;
    if (selected.isMock) {
      setMockHobbies((prev) => prev.map((m) => (m.id === selected.id ? { ...m, ...patch } : m)));
      return;
    }
    try {
      await base44.entities.Hobby.update(selected.id, patch);
    } catch {
      /* realtime refresht de lijst; fout bubbelt visueel niet op */
    }
  };

  const glassShell = {
    background: "rgba(120,128,133,0.16)",
    backdropFilter: "blur(22px) saturate(1.35)",
    WebkitBackdropFilter: "blur(22px) saturate(1.35)",
    border: "1px solid rgba(255,255,255,0.14)",
  };

  return (
    <div className="relative w-full h-[340px] rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: IVORY }}>
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={glassShell} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* LINKS: gelabelde staven (alleen in overzicht) */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            key="bars"
            className="absolute inset-y-0 left-0 w-[58%] flex flex-col p-4 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="cursor-pointer" onClick={() => openModule("hobbies")}>
              <WidgetHeader type="energy" label="Things I Love." count={active ? `${active} levend` : ""} />
              <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
              <p className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-60">{bars.length} dingen in je veld</p>
            </div>

            {/* thema-legenda */}
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2.5">
              {Object.entries(THEMES).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-[7.5px] uppercase tracking-[0.12em] opacity-55">{name}</span>
                </div>
              ))}
            </div>

            {/* staven — één per hobby, gelabeld, gekleurd per thema */}
            <div className="flex-1 flex items-end gap-1.5 mt-3 min-h-0">
              {bars.map((b) => {
                const isSel = selectedId === b.id;
                const inactive = b.status === "inactive";
                const fill = inactive ? "hsl(var(--muted-foreground))" : b.theme.color;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className="flex-1 h-full flex flex-col items-center justify-end"
                  >
                    <div
                      className="w-full rounded-t-md transition-all duration-300"
                      style={{
                        height: `${(b.level / 8) * 100}%`,
                        background: fill,
                        opacity: inactive ? 0.35 : isSel ? 1 : 0.78,
                        boxShadow: isSel ? `0 0 0 2px ${IVORY}, 0 0 12px ${b.theme.color}` : "none",
                      }}
                    />
                    <span className="text-[7px] truncate w-full text-center mt-1 leading-none" style={{ opacity: inactive ? 0.4 : 0.72 }}>
                      {b.title.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-1.5">tik een bar → detail</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOTOKAART — schuift van rechts (overzicht) naar links (geselecteerde hobby) */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden"
        initial={false}
        animate={{ left: selected ? "0%" : "58%", width: selected ? "58%" : "42%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          boxShadow: selected
            ? "16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)"
            : "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      >
        <img src={selected ? selected.raw.image || PHOTO : PHOTO} alt="Things I Love" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div
          className="absolute inset-0"
          style={{
            background: selected
              ? `linear-gradient(to top, ${selected.theme.color}cc, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.2))`
              : "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.3))",
          }}
        />
        {selected ? (
          <div className="absolute inset-0 p-4 flex flex-col" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: selected.theme.color }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{selected.theme.name}</span>
            </div>
            <h3 className="text-[24px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{selected.title}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">niveau {selected.level}/8 · {fmtDaysAgo(selected.raw.last_activity_date)}</p>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums">{selected.level}</span>
              <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mb-1">/ 8 bezigheid</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 p-3.5 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <span className="text-[9px] uppercase tracking-[0.18em] font-bold opacity-80">overzicht</span>
            <div className="flex items-end gap-2 mt-1">
              <CountUp value={active} className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums" />
              <p className="text-[9px] uppercase tracking-[0.18em] opacity-55 mb-1.5 leading-tight">actieve<br />hobby's</p>
            </div>
            <div className="mt-auto space-y-1.5">
              <p className="text-[8px] uppercase tracking-[0.18em] opacity-60">top {Math.min(3, bars.length)}</p>
              {bars.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: b.theme.color }} />
                  <span className="text-[12px] truncate flex-1">{b.title}</span>
                  <span className="text-[9px] tabular-nums opacity-70">{b.level}/8</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* RECHTS: edit-paneel (alleen bij selectie) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="edit"
            className="absolute inset-y-0 right-0 w-[42%] z-30 rounded-r-[28px] overflow-hidden"
            style={glassShell}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <HobbyEditPanel hobby={selected.raw} theme={selected.theme} level={selected.level} onUpdate={handleUpdate} onClose={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}