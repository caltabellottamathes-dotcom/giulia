import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { insightTypeColor, insightTypeLabel } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Self Insights widget — gedetecteerde patronen, geen ruwe data. */
export default function SelfInsightsWidget() {
  const { openModule } = usePanel();
  const { data: insights, loading } = useEntityList("SelfInsight", { realtime: true, sort: "-created_date" });

  const active = useMemo(() => (insights || []).filter((i) => i.status === "active" || i.status === "confirmed"), [insights]);

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("selfinsights")} className="min-h-[200px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.selfInsights} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/65 via-charcoal/35 to-transparent" />
        <div className="relative z-10 h-full p-5 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Self Insights</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: SAGE }}>{active.length} patterns</span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2 py-3">
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin self-center" />
            ) : active.length ? (
              active.slice(0, 3).map((ins) => (
                <div key={ins.id} className="flex items-start gap-2">
                  <span className="text-sm font-semibold mt-0.5" style={{ color: insightTypeColor(ins.type) }}>{ins.title.split(" ")[0]}</span>
                  <span className="text-xs text-ivory/60 flex-1">{ins.title.split(" ").slice(1).join(" ") || ins.description?.slice(0, 50)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm italic text-ivory/45">Nog geen patronen ontdekt.</p>
            )}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}