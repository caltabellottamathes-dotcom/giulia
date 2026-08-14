import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const BLUE = "hsl(var(--life-blue))";
const BLUE_SOFT = "hsl(var(--life-blue-soft))";

/** Hobbies widget — actieve hobby's + aankomende hobby-afspraken + inactief. */
export default function HobbiesWidget() {
  const { openModule } = usePanel();
  const { data: hobbies, loading } = useEntityList("Hobby");
  const { data: events } = useEntityList("CalendarEvent");

  const active = useMemo(() => (hobbies || []).filter((h) => h.status !== "inactive"), [hobbies]);
  const inactive = (hobbies || []).filter((h) => h.status === "inactive");
  const upcoming = useMemo(() => {
    const now = Date.now();
    return (events || []).filter((e) => e.domain === "life" && new Date(e.start).getTime() >= now).sort((a, b) => (a.start || "").localeCompare(b.start || "")).slice(0, 2);
  }, [events]);

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("hobbies")} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.chairWater} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/80 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Hobby's</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] tabular-nums" style={{ color: BLUE_SOFT }}>{active.length} actief</span>
          </div>
        </div>
        <div className="flex-1 -mt-8 rounded-t-[24px] glass-3 p-5 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : (
            <div className="flex-1 flex flex-col gap-2.5">
              {upcoming.length ? (
                upcoming.map((e) => (
                  <div key={e.id} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BLUE }} />
                    <p className="text-sm font-medium truncate flex-1">{e.title}</p>
                    <span className="text-[10px] text-ivory/45 shrink-0">{new Date(e.start).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                  </div>
                ))
              ) : (
                active.slice(0, 2).map((h) => (
                  <div key={h.id} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BLUE }} />
                    <p className="text-sm font-medium truncate flex-1">{h.title}</p>
                  </div>
                ))
              )}
              {inactive.length > 0 && <p className="mt-auto text-[11px] pt-2 border-t border-ivory/10" style={{ color: "hsl(var(--life-sand))" }}>{inactive.length} hobby{inactive.length !== 1 ? "s" : ""} al een tijdje stil</p>}
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}