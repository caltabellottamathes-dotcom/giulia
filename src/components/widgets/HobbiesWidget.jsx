import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { hobbyGroups, hobbyHeadline, fieldSize, hobbyState, stateColor } from "@/lib/hobbyUtils";

const BLUE = "hsl(var(--life-blue-deep))";
const SAND = "hsl(var(--life-sand-deep))";

/** Hobbies widget — editorial veldkaart. Hobby's verschijnen als levende
 *  objecten; grootte = recente activiteit. Actief = life-blue, nieuw = sand,
 *  stil = gedempt. Dynamische headline + 3 grote cijfers onderaan. */
export default function HobbiesWidget() {
  const { openModule } = usePanel();
  const { data: hobbies, loading } = useEntityList("Hobby");

  const g = useMemo(() => hobbyGroups(hobbies || []), [hobbies]);
  const headline = useMemo(() => hobbyHeadline(g), [g]);
  const field = useMemo(() => {
    return (hobbies || [])
      .filter((h) => hobbyState(h) !== "archived")
      .sort((a, b) => fieldSize(b) - fieldSize(a));
  }, [hobbies]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("hobbies")} className="min-h-[200px]" style={{ "--tile-accent": BLUE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.lifeHobbies} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/55 via-charcoal/30 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Hobby's</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAND }}>{g.active.length} levend</span>
          </div>

          <h2 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.02em] mt-2">{headline}</h2>

          {/* HOBBY FIELD */}
          <div className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 content-center py-3 min-h-[40px]">
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            ) : field.length ? (
              field.map((h) => {
                const s = hobbyState(h);
                const sz = fieldSize(h);
                const fs = 10 + Math.round(sz * 13);
                const c = stateColor(s);
                return (
                  <span
                    key={h.id}
                    className="font-display font-semibold tracking-tight rounded-full px-2.5 leading-none transition-all"
                    style={{ fontSize: `${fs}px`, color: s === "quiet" ? "rgba(255,255,255,0.4)" : c, border: s === "quiet" ? "1px solid rgba(255,255,255,0.18)" : "none", paddingTop: `${Math.round(sz * 4)}px`, paddingBottom: `${Math.round(sz * 4)}px` }}
                  >
                    {h.title.toUpperCase()}
                  </span>
                );
              })
            ) : (
              <p className="text-sm italic text-ivory/45">Nog niets levend — voeg een interesse toe.</p>
            )}
          </div>

          {/* BOTTOM 3 */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-ivory/10">
            <Stat n={g.active.length} l="actief" c={BLUE} />
            <Stat n={g.quiet.length} l="stil" c="rgba(255,255,255,0.45)" />
            <Stat n={g.news.length + g.emerging.length} l="nieuw" c={SAND} />
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

function Stat({ n, l, c }) {
  return (
    <div>
      <p className="text-2xl font-display font-semibold tabular-nums leading-none" style={{ color: c }}>{n}</p>
      <p className="text-[9px] uppercase tracking-wide text-ivory/55 mt-1">{l}</p>
    </div>
  );
}