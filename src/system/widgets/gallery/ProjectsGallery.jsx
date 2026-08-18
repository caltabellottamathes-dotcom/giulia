import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT } from "./palette";

const A = ACCENT.focus;
const ACTIVE = ["in_progress", "planning", "review", "afwerking"];

/** Projects — "Wat is actief?" Count + voortgangsbars per project. */
export default function ProjectsGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: projects } = useEntityList("Project", { realtime: true, externalTick: t });
  const active = (projects || []).filter(p => ACTIVE.includes(p.status));
  const count = active.length;
  const headline = count === 0 ? "NIETS ACTIEF" : count <= 2 ? "FOCUS" : "DRAAIT";
  const sub = count === 0 ? "Geen actieve projecten" : `${count} projecten in beweging`;
  const top = active.sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 4);

  return (
    <WidgetShell size="2x2" radius="xl" interactive onClick={() => openModule("projects")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Projecten" count={count ? `${count} actief` : "stil"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          {top.map((p, i) => (
            <div key={p.id || i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-ivory/70 truncate max-w-[70%]">{p.title}</span>
                <span className="text-[9px] tabular-nums opacity-50">{p.progress || 0}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div className="h-full rounded-full" style={{ background: A }} initial={{ width: 0 }} animate={{ width: `${p.progress || 0}%` }} transition={{ duration: 0.9, delay: i * 0.1 }} />
              </div>
            </div>
          ))}
          {!count && <p className="text-[10px] text-ivory/30 italic">Geen actieve projecten</p>}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.walkChairsHigh} className="h-14 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} actief · ${top.length} getoond` : "Wachtend op start"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}