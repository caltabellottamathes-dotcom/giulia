import React, { useMemo } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import WidgetHeader from "../../system/widgets/WidgetHeader";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import HouseholdStateViz from "@/life/components/HouseholdStateViz";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { householdZones, mattersItems, householdHeadline, tileAccent } from "@/lib/householdUtils";

/** Household widget — breed horizontaal banner (span 2). Links status + groot
 *  cijfer, rechts vier verticale staafjes, en een smalle huishouden-foto als
 *  voet met de uitsplitsing. life-blue → life-sand → urgent #d5e24a. */
export default function HouseholdWidget() {
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
    <WidgetShell size="2x2" radius="xl" interactive onClick={() => openModule("household")} className="min-h-[200px]" style={{ "--tile-accent": accent }}>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-[0.82fr_1.18fr] flex-1 min-h-[150px]">
          <div className="p-5 flex flex-col">
            <WidgetHeader label="Household" count={matters.length ? `${matters.length} aandacht` : "oké"} />
            <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
            <div className="flex-1" />
            <div className="flex items-end gap-3">
              <span className="text-[48px] leading-[0.8] font-display font-semibold tabular-nums transition-colors" style={{ color: accent }}>{matters.length}</span>
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mb-1.5 leading-tight">dingen<br />waard</p>
            </div>
          </div>
          <div className="p-5 border-l border-white/10 flex flex-col justify-center">
            <HouseholdStateViz zones={zones} variant="columns" compact tone="dark" />
          </div>
        </div>
        <BrandPhoto src={IMAGES.lifeHousehold} className="h-12 w-full" overlay="bg-gradient-to-r from-charcoal/75 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/85 font-semibold">{householdTasks} taak · {shopping} boodschap · {maintenance} onderhoud{issues ? ` · ${issues} issue` : ""}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}