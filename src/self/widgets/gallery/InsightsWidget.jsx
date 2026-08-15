import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { insightTypeColor, insightTypeLabel } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** InsightsWidget — "data narrative". Grote editorial statement gekoppeld aan
 *  een zelf-tekenende capacity-lijn over de laatste 10 check-ins. Onderaan
 *  patterns / changes / new insight tellingen. */
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
  const statement = avg < 45 ? "YOUR CAPACITY HAS BEEN LOWER" : avg > 70 ? "YOUR CAPACITY HAS BEEN STRONGER" : "YOUR CAPACITY IS STEADY";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfinsights")}
      className="lg:col-span-2 min-h-[320px]"
      style={{ background: "linear-gradient(150deg, hsl(var(--self-primary)) 0%, hsl(var(--self-primary-light)) 100%)", "--tile-accent": SAGE }}>
      <div className="p-6 h-full flex flex-col text-ivory">
        <WidgetHeader label="Insights" />
        <h3 className="text-[28px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-3">{statement}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">than usual · last 10 days</p>

        <div className="relative flex-1 min-h-[110px] mt-4">
          <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
            <motion.polyline points={pts} fill="none" stroke={avg < 45 ? URGENT : SAGE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut" }} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {latest && (
          <div className="mt-1">
            <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: insightTypeColor(latest.type) }}>{insightTypeLabel(latest.type)}</span>
            <p className="text-sm leading-snug opacity-85 line-clamp-2">{latest.title}</p>
          </div>
        )}

        <div className="flex gap-6 pt-3 mt-3 border-t border-ivory/10">
          <div><p className="text-[24px] font-display font-semibold tabular-nums">{patterns}</p><p className="text-[9px] uppercase tracking-wider opacity-50">patterns</p></div>
          <div><p className="text-[24px] font-display font-semibold tabular-nums">{changes}</p><p className="text-[9px] uppercase tracking-wider opacity-50">changes</p></div>
          <div><p className="text-[24px] font-display font-semibold tabular-nums" style={{ color: SAGE }}>{fresh}</p><p className="text-[9px] uppercase tracking-wider opacity-50">new insight</p></div>
        </div>
      </div>
    </WidgetShell>
  );
}