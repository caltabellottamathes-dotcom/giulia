import React, { useMemo } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { hobbyGroups, hobbyHeadline, attentionFlow, stateColor, fmtDaysAgo } from "@/lib/hobbyUtils";

const PHOTO = IMAGES.lifeW4Love;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";

const STATE_LABEL = { active: "ACTIEF", quiet: "STIL", new: "NIEUW", emerging: "OPKOMEND", reactivating: "HERLEVEND", archived: "ARCHIEF" };

/** ThingsLoveWidget — G·3:2·R·SIDE · "Things I Love."
 *  GlassCard (links): hobby-veld met aandachtsflow (staafjes per hobby). PhotoCard
 *  (rechts): nieuwste interesse + dagen-geleden. Data: Hobby. */
export default function ThingsLoveWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: hobbies } = useEntityList("Hobby", { realtime: true, externalTick: learnTick });

  const groups = useMemo(() => hobbyGroups(hobbies || []), [hobbies]);
  const headline = hobbyHeadline(groups);
  const flow = useMemo(() => attentionFlow(hobbies || []).slice(0, 5), [hobbies]);
  const active = groups.active.length;
  const newest = [...groups.news, ...groups.emerging][0];

  return (
    <div className="relative w-full h-[340px] rounded-[28px] overflow-hidden" onClick={() => openModule("hobbies")} style={{ "--tile-accent": DEEP, color: IVORY, cursor: "pointer" }}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />

      <div className="absolute inset-y-0 left-0 w-[60%] flex flex-col p-4 z-10">
        <WidgetHeader type="energy" label="Things I Love." count={active ? `${active} levend` : ""} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{(hobbies || []).length} dingen in je veld</p>
        <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5">
          {flow.length === 0 ? (
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>Nog geen hobby's ontdekt.</p>
          ) : flow.map((h) => (
            <div key={h.title}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] truncate flex-1" style={{ color: IVORY }}>{h.title}</span>
                <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color: stateColor(h.state) }}>{STATE_LABEL[h.state] || h.state}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(h.level / 8) * 100}%`, background: stateColor(h.state) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-y-0 right-0 w-[40%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        <img src={PHOTO} alt="Things I Love" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-black/25" />
        <span className="pointer-events-none absolute -bottom-5 -right-6 text-[110px] font-display font-bold leading-none tabular-nums" style={{ color: IVORY, opacity: 0.5 }}>{active}</span>
        <div className="absolute bottom-0 inset-x-0 p-3.5" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ opacity: 0.8 }}>nieuwste</p>
          <p className="text-[13px] font-display font-semibold mt-0.5 truncate">{newest ? newest.title : "—"}</p>
          {newest?.last_activity_date && <p className="text-[8px] uppercase tracking-[0.14em] mt-1" style={{ color: LIGHT }}>{fmtDaysAgo(newest.last_activity_date)}</p>}
        </div>
      </div>
    </div>
  );
}