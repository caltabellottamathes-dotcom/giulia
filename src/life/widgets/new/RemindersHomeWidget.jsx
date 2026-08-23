import React, { useMemo, useEffect, useState } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { householdZones, mattersItems, householdHeadline, statusLabel, isAttention, isVeryUrgent } from "@/lib/householdUtils";

const PHOTO = IMAGES.lifeW2Home;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const IVORY = "hsl(var(--ivory))";

/** RemindersHomeWidget — P·9x16·B·SIDE · "Reminders For Home."
 *  PhotoShell (boven): header + headline + dat + aandacht-telling. GlassShell
 *  (onder): vier huishoudzones (schoonmaak/boodschappen/onderhoud/routines) met
 *  status-dots. Data: HouseholdItem + Task(domain=life). */
export default function RemindersHomeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: items } = useEntityList("HouseholdItem", { realtime: true, externalTick: learnTick });
  const { data: tasks } = useEntityList("Task", { realtime: true, externalTick: learnTick });

  const zones = useMemo(() => householdZones(items || []), [items]);
  const matters = useMemo(() => mattersItems(items || [], tasks || []), [items, tasks]);
  const headline = householdHeadline(matters, items || []);
  const sub = matters.length === 0 ? "Niets vraagt om aandacht" : matters.length >= 4 ? "Een reset zou helpen" : "Een paar dingen deze week";

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  const weekday = now.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayNum = now.getDate();
  const month = now.toLocaleDateString("nl-NL", { month: "short" });

  return (
    <div className="relative w-full h-[480px] rounded-[28px] overflow-hidden" onClick={() => openModule("household")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="Reminders For Home" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-3 flex flex-col" style={{ color: IVORY, height: "56%", background: "linear-gradient(to bottom, rgba(0,0,0,0.36), rgba(0,0,0,0))" }}>
        <WidgetHeader type="tasks" label="Reminders For Home." count={matters.length ? `${matters.length} aandacht` : "oké"} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{weekday} {dayNum} {month}</p>
        <div className="flex items-end gap-3 mt-auto">
          <span className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: matters.length ? URGENT : LIGHT }}>{matters.length}</span>
          <p className="text-[9px] uppercase tracking-[0.18em] opacity-55 mb-1 leading-tight">dingen<br />waard</p>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[44%] bg-gradient-to-t from-black/45 via-black/18 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[44%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: LIGHT }}>Zones</span>
          <span className="text-[8px] uppercase tracking-[0.14em] text-right max-w-[55%] leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>{sub}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {zones.map((z) => {
            const hot = isVeryUrgent(z.status);
            const attn = isAttention(z.status);
            const color = hot ? URGENT : attn ? LIGHT : DEEP;
            return (
              <div key={z.key} className="rounded-xl px-3 py-2.5 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${hot ? URGENT + "55" : "rgba(255,255,255,0.12)"}` }}>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[10px] uppercase tracking-[0.14em] font-bold" style={{ color: IVORY }}>{z.label}</span>
                </div>
                <span className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>{statusLabel(z.status)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}