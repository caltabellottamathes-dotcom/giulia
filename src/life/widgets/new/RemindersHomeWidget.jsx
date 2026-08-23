import React, { useMemo, useEffect, useState } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { mattersItems, householdHeadline, statusLabel, isAttention, isVeryUrgent } from "@/lib/householdUtils";

const PHOTO = IMAGES.lifeW2Home;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const IVORY = "hsl(var(--ivory))";

/** RemindersHomeWidget — skelet OVERGENOMEN van ThingsLove (G·3:2·R·SIDE):
 *  GlassCard (links): header + headline + datum + scroll-lijst van aandachts-items
 *  met urgentie-balk. PhotoCard (rechts): telling + meest dringende item.
 *  Data: HouseholdItem + Task(domain=life). */
export default function RemindersHomeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: items } = useEntityList("HouseholdItem", { realtime: true, externalTick: learnTick });
  const { data: tasks } = useEntityList("Task", { realtime: true, externalTick: learnTick });

  const matters = useMemo(() => mattersItems(items || [], tasks || []), [items, tasks]);
  const headline = householdHeadline(matters, items || []);
  const sub = matters.length === 0 ? "Niets vraagt om aandacht" : matters.length >= 4 ? "Een reset zou helpen" : "Een paar dingen deze week";

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  const weekday = now.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayNum = now.getDate();
  const month = now.toLocaleDateString("nl-NL", { month: "short" });

  const flow = matters.slice(0, 5);
  const top = matters[0];

  return (
    <div className="relative w-full h-[340px] rounded-[28px] overflow-hidden" onClick={() => openModule("household")} style={{ "--tile-accent": DEEP, color: IVORY, cursor: "pointer" }}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />

      <div className="absolute inset-y-0 left-0 w-[60%] flex flex-col p-4 z-10">
        <WidgetHeader type="tasks" label="Reminders For Home." count={matters.length ? `${matters.length} aandacht` : "oké"} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{weekday} {dayNum} {month}</p>
        <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5">
          {flow.length === 0 ? (
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>Alles rustig thuis.</p>
          ) : flow.map((m) => {
            const hot = isVeryUrgent(m.status);
            const level = hot ? 8 : isAttention(m.status) ? 5 : 3;
            const color = hot ? URGENT : LIGHT;
            return (
              <div key={m.id || m.title}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] truncate flex-1" style={{ color: IVORY }}>{m.title}</span>
                  <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color }}>{statusLabel(m.status)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(level / 8) * 100}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-y-0 right-0 w-[40%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        <img src={PHOTO} alt="Reminders For Home" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-black/25" />
        <span className="pointer-events-none absolute -bottom-5 -right-6 text-[110px] font-display font-bold leading-none tabular-nums" style={{ color: IVORY, opacity: 0.5 }}>{matters.length}</span>
        <div className="absolute bottom-0 inset-x-0 p-3.5" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ opacity: 0.8 }}>meest dringend</p>
          <p className="text-[13px] font-display font-semibold mt-0.5 truncate">{top ? top.title : "—"}</p>
          {top && <p className="text-[8px] uppercase tracking-[0.14em] mt-1" style={{ color: LIGHT }}>{statusLabel(top.status)}</p>}
        </div>
      </div>
    </div>
  );
}