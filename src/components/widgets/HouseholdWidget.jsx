import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import BrandPhoto from "./BrandPhoto";
import HouseholdStateViz from "@/components/life/HouseholdStateViz";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { householdZones, mattersItems, householdHeadline } from "@/lib/householdUtils";

const SAND = "hsl(var(--life-sand))";

/** Household widget — visuele momentopname van het huishouden. Dynamische
 *  status, abstracte animated state graphic, groot getal "dingen waard". */
export default function HouseholdWidget() {
  const { openModule } = usePanel();
  const { data: items } = useEntityList("HouseholdItem");
  const { data: tasks } = useEntityList("Task");

  const zones = useMemo(() => householdZones(items || []), [items]);
  const matters = useMemo(() => mattersItems(items || [], tasks || []), [items, tasks]);
  const headline = householdHeadline(matters, items || []);

  const householdTasks = matters.filter((m) => m.kind === "task").length;
  const shopping = matters.filter((m) => m.kind === "shopping").length;
  const maintenance = matters.filter((m) => m.kind === "maintenance").length;
  const issues = matters.filter((m) => m.kind === "issue").length;

  const sub = matters.length === 0 ? "Niets vraagt om aandacht" : matters.length >= 4 ? "Een reset zou helpen" : "Een paar dingen deze week";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("household")} className="min-h-[260px]" style={{ "--tile-accent": SAND }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Household" count={matters.length ? `${matters.length} aandacht` : "oké"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>

        {/* Centrale animated state graphic */}
        <div className="mt-5">
          <HouseholdStateViz zones={zones} compact tone="dark" />
        </div>

        <div className="flex items-end gap-4 mt-4">
          <span className="text-[52px] leading-[0.8] font-display font-semibold tracking-[-0.04em] text-current tabular-nums">{matters.length}</span>
          <div className="text-[10px] uppercase tracking-[0.18em] opacity-50 leading-tight mb-2">
            <p>dingen</p>
            <p>waard</p>
          </div>
        </div>

        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.lifeHousehold} className="h-20 w-full -mt-6 rounded-t-[24px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.28)]" overlay="bg-gradient-to-t from-charcoal/50 via-transparent to-transparent">
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/60 font-semibold">{householdTasks} taak · {shopping} boodschap · {maintenance} onderhoud{issues ? ` · ${issues} issue` : ""}</p>
            <p className="text-sm font-semibold text-ivory truncate" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{matters.length === 0 ? "Alles onder controle" : matters[0]?.title || "Een paar dingen"}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); openModule("household"); }} className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold border border-ivory/30 text-ivory transition hover:bg-ivory/10 shrink-0">Open</button>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}