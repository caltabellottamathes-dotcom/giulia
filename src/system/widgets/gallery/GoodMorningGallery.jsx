import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT, FILL } from "./palette";

const A = ACCENT.self;
const SAGE = FILL.self;

/** GoodMorning — "Hoe wakker?" Wake-tijd + routine voortgang. */
export default function GoodMorningGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const [settings, setSettings] = useState(null);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    base44.entities.MorningSettings.list().then(r => setSettings((r || [])[0] || null)).catch(() => {});
    base44.entities.MorningRoutineStep.filter({ enabled: true }, "order", 10).then(r => setSteps(r || [])).catch(() => {});
  }, [t]);

  const wake = settings?.wake_time || "07:30";
  const [h, m] = wake.split(":").map(Number);
  const now = new Date();
  const wakeDate = new Date(); wakeDate.setHours(h, m, 0, 0);
  const isPast = now > wakeDate;
  const minsTo = Math.round((wakeDate - now) / 60000);
  const headline = isPast ? "GOEDE MORGEN" : "WAKKER WORDEN";
  const sub = isPast ? "Je dag is begonnen" : minsTo > 0 ? `nog ${minsTo} min` : "bijna tijd";
  const routineSteps = steps.filter(s => s.phase === "routine");
  const getupSteps = steps.filter(s => s.phase === "getup");
  const totalSteps = routineSteps.length + getupSteps.length;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("goodmorning")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 min-h-0" style={{ color: A }}>
          <WidgetHeader label="Good Morning" count={settings?.enabled ? "aan" : "uit"} />
          <h3 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{sub}</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-[44px] leading-[0.82] font-display font-semibold tabular-nums text-current">{wake}</span>
            {!isPast && <motion.span className="mb-2 h-2.5 w-2.5 rounded-full" style={{ background: A }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }} />}
          </div>
          <div className="mt-4 flex gap-1.5 flex-1 items-center">
            {Array.from({ length: Math.max(totalSteps, 6) }).map((_, i) => {
              const step = [...getupSteps, ...routineSteps][i];
              return (
                <motion.div key={i} className="flex-1 h-2 rounded-full" style={{ background: step ? SAGE : "rgba(255,255,255,0.06)" }}
                  initial={{ scaleX: 0.3, opacity: 0 }} animate={{ scaleX: 1, opacity: step ? 0.8 : 0.15 }} transition={{ duration: 0.4, delay: i * 0.06 }} />
              );
            })}
          </div>
          <p className="mt-2 text-[8px] uppercase tracking-[0.2em] opacity-50">{totalSteps} routine stappen</p>
        </div>
        <BrandPhoto src={IMAGES.walkChairsBeach} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{settings?.enabled ? `wake ${wake}` : "niet ingesteld"}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}