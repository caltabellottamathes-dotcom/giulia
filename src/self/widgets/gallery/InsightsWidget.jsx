import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { insightTypeColor, insightTypeLabel } from "@/lib/selfUtils";
import { PhotoCard, BehindCard } from "@/self/widgets/gallery/GlassPhoto";

const PLUM = "hsl(var(--self-primary))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const URGENT = "hsl(var(--self-urgent))";
const INK = "hsl(var(--foreground))";

/** InsightsWidget — glas + fotokaarten. Data narrative met zelf-tekenende
 *  capacity-lijn op het glas; SELF-foto onder, crisp kaart boven. */
export default function InsightsWidget() {
  const { openModule } = usePanel();
  const { data: insights } = useEntityList("SelfInsight", { realtime: true, sort: "-created_date", limit: 30 });
  const { data: checkIns } = useEntityList("SelfCheckIn", { realtime: true, sort: "timestamp", limit: 30 });

  const cap = (checkIns || []).slice(-10).map((c) => c.capacity ?? 50);
  const pts = cap.map((v, i) => `${(i / Math.max(1, cap.length - 1)) * 180 + 10},${100 - (v / 100) * 70 - 15}`).join(" ");
  const latest = (insights || [])[0];
  const patterns = (insights || []).filter((i) => i.type === "pattern").length;
  const changes = (insights || []).filter((i) => i.status === "active").length;
  const fresh = (insights || []).filter((i) => i.status === "active").length;
  const avg = cap.length ? cap.reduce((a, b) => a + b, 0) / cap.length : 0;
  const low = avg < 45;
  const statement = low ? "YOUR CAPACITY HAS BEEN LOWER" : avg > 70 ? "YOUR CAPACITY HAS BEEN STRONGER" : "YOUR CAPACITY IS STEADY";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfinsights")}
      className="lg:col-span-2 min-h-[320px] text-foreground"
      style={{ "--tile-accent": SAGE_DEEP }}>
      <div className="relative h-full p-6 overflow-hidden">
        <BehindCard src={IMAGES.selfInsights} className="absolute left-4 top-4 w-[42%] h-[34%] z-0" dim={0.16} />

        <div className="relative z-10 flex flex-col h-full">
          <WidgetHeader label="Insights" />
          <h3 className="text-[28px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-3" style={{ color: INK }}>{statement}</h3>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5" style={{ color: INK }}>than usual · last 10 days</p>

          <div className="relative flex-1 min-h-[110px] mt-4">
            <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
              <motion.polyline points={pts} fill="none" stroke={low ? URGENT : SAGE_DEEP} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut" }} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          {latest && (
            <div className="mt-1">
              <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: insightTypeColor(latest.type) === "hsl(var(--self-accent))" ? SAGE_DEEP : insightTypeColor(latest.type) }}>{insightTypeLabel(latest.type)}</span>
              <p className="text-sm leading-snug opacity-85 line-clamp-2" style={{ color: INK }}>{latest.title}</p>
            </div>
          )}

          <div className="flex gap-6 pt-3 mt-3 border-t border-foreground/10">
            <div><p className="text-[24px] font-display font-semibold tabular-nums" style={{ color: INK }}>{patterns}</p><p className="text-[9px] uppercase tracking-wider opacity-50" style={{ color: INK }}>patterns</p></div>
            <div><p className="text-[24px] font-display font-semibold tabular-nums" style={{ color: INK }}>{changes}</p><p className="text-[9px] uppercase tracking-wider opacity-50" style={{ color: INK }}>changes</p></div>
            <div><p className="text-[24px] font-display font-semibold tabular-nums" style={{ color: PLUM }}>{fresh}</p><p className="text-[9px] uppercase tracking-wider opacity-50" style={{ color: INK }}>new insight</p></div>
          </div>
        </div>

        <PhotoCard src={IMAGES.selfHandsMetal} className="absolute right-5 bottom-5 w-[28%] h-[22%] z-20" />
      </div>
    </WidgetShell>
  );
}