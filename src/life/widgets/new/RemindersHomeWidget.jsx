import React, { useMemo } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import HouseholdStateViz from "@/life/components/HouseholdStateViz";
import { householdZones, mattersItems, householdHeadline, tileAccent } from "@/lib/householdUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/4d4f0a03c_HOUSEHOLD.jpeg";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";

/** RemindersHomeWidget — skelet: links glas + rechts fotokaart.
 *  Inhoud overgenomen van de dashboard HouseholdWidget: headline + sub, de
 *  HouseholdStateViz (4 zones), de taak/boodschap/onderhoud/issue-breakdown en
 *  het grote "dingen waard"-cijfer op de fotokaart. */
export default function RemindersHomeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: items } = useEntityList("HouseholdItem", { realtime: true, externalTick: learnTick });
  const { data: tasks } = useEntityList("Task", { realtime: true, externalTick: learnTick });

  const zones = useMemo(() => householdZones(items || []), [items]);
  const matters = useMemo(() => mattersItems(items || [], tasks || []), [items, tasks]);
  const headline = householdHeadline(matters, items || []);
  const accent = tileAccent(zones);

  const householdTasks = matters.filter((m) => m.kind === "task").length;
  const shopping = matters.filter((m) => m.kind === "shopping").length;
  const maintenance = matters.filter((m) => m.kind === "maintenance").length;
  const issues = matters.filter((m) => m.kind === "issue").length;
  const sub = matters.length === 0 ? "Niets vraagt om aandacht" : matters.length >= 4 ? "Een reset zou helpen" : "Een paar dingen deze week";

  return (
    <div className="relative w-full aspect-[21/9] rounded-[28px] overflow-hidden" onClick={() => openModule("household")} style={{ "--tile-accent": accent, color: IVORY, cursor: "pointer" }}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />

      {/* LINKS: glas — zelfde inhoud als HouseholdWidget */}
      <div className="absolute inset-y-0 left-0 w-[54%] flex flex-col p-4 z-10">
        <WidgetHeader type="tasks" label="Reminders For Home." count={matters.length ? `${matters.length} aandacht` : "oké"} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-50">{sub}</p>
        <div className="mt-3 flex-1 min-h-0">
          <HouseholdStateViz zones={zones} variant="columns" compact tone="dark" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 mt-2">{householdTasks} taak · {shopping} boodschap · {maintenance} onderhoud{issues ? ` · ${issues} issue` : ""}</p>
      </div>

      {/* RECHTS: fotokaart — groot cijfer + "dingen waard" */}
      <div className="absolute inset-y-0 right-0 w-[46%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        <img src={PHOTO} alt="Reminders For Home" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-black/25" />
        <div className="absolute bottom-0 inset-x-0 p-3.5" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <div className="flex items-end gap-2">
            <span className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: accent }}>{matters.length}</span>
            <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mb-1 leading-tight">dingen<br />waard</p>
          </div>
        </div>
      </div>
    </div>
  );
}