import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const BLUE = "hsl(var(--life-blue))";
const BLUE_SOFT = "hsl(var(--life-blue-soft))";
const SAND = "hsl(var(--life-sand))";
const iso = (d) => d.toISOString().slice(0, 10);

/** Household widget — openstaande huishoudtaken + aankomend + alert. */
export default function HouseholdWidget() {
  const { openModule } = usePanel();
  const { data: tasks, loading } = useEntityList("Task");

  const household = useMemo(
    () => (tasks || []).filter((t) => t.domain === "life" && t.category === "household" && t.status !== "completed" && t.status !== "archived"),
    [tasks]
  );
  const today = iso(new Date());
  const tomorrow = iso(new Date(Date.now() + 86400000));
  const upcoming = household.filter((t) => t.deadline === today || t.deadline === tomorrow);

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("household")} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.notebookChair} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/80 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Huishouden</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] tabular-nums" style={{ color: BLUE_SOFT }}>{household.length} open</span>
          </div>
        </div>
        <div className="flex-1 -mt-8 rounded-t-[24px] glass-3 p-5 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : household.length ? (
            <div className="flex-1 flex flex-col gap-2.5">
              {upcoming.length > 0 && (
                <p className="text-[11px] font-semibold" style={{ color: SAND }}>{upcoming.length} vandaag/morgen</p>
              )}
              {household.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: t.deadline === today ? SAND : BLUE }} />
                  <p className="text-sm font-medium truncate flex-1">{t.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="flex-1 flex items-center justify-center text-xs text-ivory/55">Huis is op orde</p>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}