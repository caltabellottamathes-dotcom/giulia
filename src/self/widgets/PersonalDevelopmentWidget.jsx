import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const SAGE = "hsl(var(--self-accent))";

/** Personal Development widget — actieve gebieden met voortgangsbars. */
export default function PersonalDevelopmentWidget() {
  const { openModule } = usePanel();
  const { data: goals, loading } = useEntityList("SelfGoal", { realtime: true });

  const active = useMemo(() => (goals || []).filter((g) => g.status === "active"), [goals]);

  // Group by area
  const areas = useMemo(() => {
    const map = new Map();
    for (const g of active) {
      const area = g.area || g.title;
      if (!map.has(area)) map.set(area, []);
      map.get(area).push(g);
    }
    return Array.from(map.entries()).slice(0, 3).map(([name, items]) => ({
      name,
      progress: Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length),
    }));
  }, [active]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfdevelopment")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfDevelopment} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Personal Development</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAGE }}>{active.length} actief</span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2.5 py-3">
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin self-center" />
            ) : areas.length ? (
              areas.map((a) => (
                <div key={a.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-ivory/80 truncate">{a.name}</span>
                    <span className="text-[10px] tabular-nums text-ivory/55">{a.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ivory/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${a.progress}%`, background: SAGE }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm italic text-ivory/45">Geen actieve doelen.</p>
            )}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}