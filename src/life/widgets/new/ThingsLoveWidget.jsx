import React, { useMemo } from "react";
import { WidgetHeader, CountUp, BarPulse } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { hobbyGroups, hobbyHeadline, attentionFlow, stateColor } from "@/lib/hobbyUtils";

const PHOTO = IMAGES.lifeW4Love;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";

const STATE_LABEL = { active: "ACTIEF", quiet: "STIL", new: "NIEUW", emerging: "OPKOMEND", reactivating: "HERLEVEND", archived: "ARCHIEF" };

/** ThingsLoveWidget — skelet OVERGENOMEN van SocialLife (G·16x9·R·SIDE):
 *  GlassCard (links): header + headline + telling + 8-blokken activiteitspuls.
 *  PhotoCard (rechts): grote telling + top-hobby's met status. Data: Hobby. */
export default function ThingsLoveWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: hobbies } = useEntityList("Hobby", { realtime: true, externalTick: learnTick });

  const groups = useMemo(() => hobbyGroups(hobbies || []), [hobbies]);
  const headline = hobbyHeadline(groups);
  const flow = useMemo(() => attentionFlow(hobbies || []).slice(0, 5), [hobbies]);
  const active = groups.active.length;
  const newest = [...groups.news, ...groups.emerging][0];
  const total = (hobbies || []).length;

  const pulse = useMemo(() => {
    const vals = flow.map((h) => h.level);
    while (vals.length < 8) vals.push(0);
    return vals.slice(0, 8);
  }, [flow]);

  return (
    <div className="relative w-full h-[320px] rounded-[28px] overflow-hidden" onClick={() => openModule("hobbies")} style={{ "--tile-accent": DEEP, color: IVORY, cursor: "pointer" }}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      <div className="absolute inset-y-0 left-0 w-[58%] flex flex-col p-4 z-10">
        <WidgetHeader type="energy" label="Things I Love." count={active ? `${active} levend` : ""} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{total} dingen in je veld</p>
        <div className="flex items-end gap-3 mt-3">
          <CountUp value={active} className="text-[52px] leading-[0.8] font-display font-semibold tabular-nums" />
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1.5 leading-tight">actieve<br />hobby's</p>
        </div>
        <div className="flex-1" />
        <BarPulse values={pulse} height={34} />
        <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-1.5">hobby activiteit</p>
      </div>

      <div className="absolute inset-y-0 right-0 w-[42%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        <img src={PHOTO} alt="Things I Love" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-black/30" />
        <span className="pointer-events-none absolute -bottom-5 -right-6 text-[110px] font-display font-bold leading-none tabular-nums" style={{ color: IVORY, opacity: 0.5 }}>{active}</span>
        <div className="absolute bottom-0 inset-x-0 p-3.5" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ opacity: 0.8 }}>in je veld</p>
          <div className="mt-1.5 space-y-1.5">
            {flow.length === 0 ? (
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>Nog niets ontdekt</p>
            ) : flow.slice(0, 3).map((h) => (
              <div key={h.title} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: stateColor(h.state) }} />
                <span className="text-[12px] truncate flex-1">{h.title}</span>
                <span className="text-[9px] uppercase tracking-[0.12em]" style={{ color: LIGHT }}>{STATE_LABEL[h.state] || h.state}</span>
              </div>
            ))}
          </div>
          <p className="text-[8px] uppercase tracking-[0.18em] mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>{newest ? `nieuwste · ${newest.title}` : "geen nieuwste"}</p>
        </div>
      </div>
    </div>
  );
}