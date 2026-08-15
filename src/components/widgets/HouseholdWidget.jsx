import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import HouseholdStateViz from "@/components/life/HouseholdStateViz";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { householdZones, mattersItems, householdHeadline, tileAccent } from "@/lib/householdUtils";

/** Household widget — breed horizontaal banner (span 2). Links grote status +
 *  reusachtig cijfer; rechts vier verticale staafjes (animated state graphic).
 *  Hoofdkleur life-blue; aandacht → life-sand; heel dringend → urgent #d5e24a. */
export default function HouseholdWidget() {
  const { openModule } = usePanel();
  const { data: items } = useEntityList("HouseholdItem");
  const { data: tasks } = useEntityList("Task");

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
    <WidgetShell size="2x2" radius="xl" interactive onClick={() => openModule("household")} className="min-h-[200px]" style={{ "--tile-accent": accent }}>
      <div className="grid grid-cols-[0.82fr_1.18fr] h-full min-h-[200px]">
        {/* Links — status + reusachtig cijfer */}
        <div className="p-5 flex flex-col">
          <WidgetHeader label="Household" count={matters.length ? `${matters.length} aandacht` : "oké"} />
          <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
          <div className="flex-1" />
          <div className="flex items-end gap-3">
            <span className="text-[48px] leading-[0.8] font-display font-semibold tabular-nums transition-colors" style={{ color: accent }}>{matters.length}</span>
            <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mb-1.5 leading-tight">dingen<br />waard</p>
          </div>
          <p className="text-[9px] uppercase tracking-wide opacity-45 mt-2">{householdTasks} taak · {shopping} boodschap · {maintenance} onderhoud{issues ? ` · ${issues} issue` : ""}</p>
        </div>
        {/* Rechts — verticale state pijlers */}
        <div className="p-5 border-l border-white/10 flex flex-col justify-center">
          <HouseholdStateViz zones={zones} variant="columns" compact tone="dark" />
        </div>
      </div>
    </WidgetShell>
  );
}