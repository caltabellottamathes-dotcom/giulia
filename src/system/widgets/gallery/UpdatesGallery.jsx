import React, { useMemo } from "react";
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

const A = ACCENT.giulia;

/** Updates — "Wat is nieuw?" Recente activiteit als verticale timeline. */
export default function UpdatesGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: activity } = useEntityList("Activity", { sort: "-timestamp", limit: 8, realtime: true, externalTick: t });
  const recent = (activity || []).slice(0, 6);
  const count = recent.length;
  const headline = count === 0 ? "STIL" : count <= 2 ? "WEINIG" : "ACTIEF";
  const sub = count === 0 ? "Niets bewogen" : `${count} recent`;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("updates")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Meanwhile..." count={count ? `${count}` : ""} />
          <h3 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{sub}</p>
          <div className="mt-4 flex items-end gap-3">
            <CountUp value={count} className="text-[48px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
          </div>
          <div className="mt-4 flex-1 flex flex-col gap-1.5 justify-end">
            {recent.slice(0, 4).map((a, i) => (
              <motion.div key={a.id || i} className="flex items-center gap-2"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <motion.span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: A }}
                  animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
                <span className="text-[10px] text-ivory/60 truncate flex-1">{a.description || a.action}</span>
              </motion.div>
            ))}
            {!count && <p className="text-[10px] text-ivory/30 italic">Geen recente activiteit</p>}
          </div>
        </div>
        <BrandPhoto src={IMAGES.topDownWalk} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} updates vandaag` : "Rustige dag"}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}