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
import { ACCENT, FILL, URGENT } from "./palette";

const A = ACCENT.life;
const SAND = FILL.life;

/** PersonalAdmin — "Wat moet er deze week?" Count + urgentie-staafjes. */
export default function PersonalAdminGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: obligations } = useEntityList("AdminObligation", { realtime: true, externalTick: t });
  const open = (obligations || []).filter(o => o.status === "open" || o.status === "overdue");
  const count = open.length;
  const overdue = open.filter(o => o.status === "overdue").length;
  const headline = count === 0 ? "ALLES GEREGLD" : overdue > 0 ? "ACHTER" : "DEZE WEEK";
  const sub = count === 0 ? "Geen open administratie" : overdue ? `${overdue} te laat` : `${count} openstaand`;
  const nextDue = open.filter(o => o.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("personaladmin")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Things to Handle!" count={count ? `${count} open` : "oké"} />
          <h3 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{sub}</p>
          <div className="mt-4 flex items-end gap-3">
            <CountUp value={count} className="text-[48px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
            {overdue > 0 && <motion.span className="mb-2 h-3 w-3 rounded-full" style={{ background: URGENT }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
          </div>
          <div className="mt-4 flex gap-1.5">
            {open.slice(0, 8).map((o, i) => (
              <motion.span key={o.id || i} className="h-1.5 flex-1 rounded-full" style={{ background: o.status === "overdue" ? URGENT : SAND }}
                initial={{ scaleX: 0.3, opacity: 0 }} animate={{ scaleX: 1, opacity: 0.85 }} transition={{ duration: 0.4, delay: i * 0.06 }} />
            ))}
            {!count && Array.from({ length: 5 }).map((_, i) => <span key={i} className="h-1.5 flex-1 rounded-full opacity-10" style={{ background: "currentColor" }} />)}
          </div>
          {nextDue && <p className="mt-3 text-[9px] uppercase tracking-[0.18em] opacity-50">volgende · {new Date(nextDue.due_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>}
          <div className="flex-1" />
        </div>
        <BrandPhoto src={IMAGES.lifePersonalAdmin} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} verplichtingen` : "Alles geregeld"}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}