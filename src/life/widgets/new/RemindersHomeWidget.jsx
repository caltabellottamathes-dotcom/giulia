import React, { useMemo } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import HouseholdStateViz from "@/life/components/HouseholdStateViz";
import { householdZones, mattersItems, householdHeadline, tileAccent } from "@/lib/householdUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/bfc15b81f_ALOT_SOCIAL.jpeg";
const IVORY = "hsl(var(--ivory))";

/** RemindersHomeWidget — G·21x9 · PhotoShell. Volledige foto, met links een
 *  brede, flush glaskaart (4 hoeken rechts) met de huishoudinhoud, en rechts
 *  het grote "dingen waard"-cijfer op de foto. */
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
      {/* PhotoShell — volledige foto */}
      <img src={PHOTO} alt="Reminders For Home" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/22 to-black/42" />

      {/* GlassCard links — breed, flush met de shellranden, met huishoudinhoud */}
      <div className="absolute inset-y-0 left-0 w-[56%] rounded-r-[24px] flex flex-col p-4 overflow-hidden"
        style={{ background: "rgba(120,128,133,0.18)", backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "12px 0 36px -18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <WidgetHeader type="tasks" label="Reminders For Home." count={matters.length ? `${matters.length} aandacht` : "oké"} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-60">{sub}</p>
        <div className="mt-3 flex-1 min-h-0">
          <HouseholdStateViz zones={zones} variant="columns" compact tone="dark" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 mt-2">{householdTasks} taak · {shopping} boodschap · {maintenance} onderhoud{issues ? ` · ${issues} issue` : ""}</p>
      </div>

      {/* rechts — groot "dingen waard"-cijfer op de foto */}
      <div className="absolute bottom-0 right-0 p-4 flex items-end gap-2" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}>
        <span className="text-[52px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: accent }}>{matters.length}</span>
        <p className="text-[9px] uppercase tracking-[0.18em] opacity-75 mb-1.5 leading-tight">dingen<br />waard</p>
      </div>
    </div>
  );
}