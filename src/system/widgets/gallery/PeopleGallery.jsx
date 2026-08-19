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

const A = ACCENT.focus;

/** People — "Wie telt?" Contact-count + avatar cluster (overlapping circles). */
export default function PeopleGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: contacts } = useEntityList("Contact", { realtime: true, externalTick: t });
  const list = (contacts || []);
  const count = list.length;
  const top = list.slice(0, 5);
  const headline = count === 0 ? "NIEMAND" : count <= 10 ? "JE KRING" : "VEEL MENSEN";
  const sub = count === 0 ? "Geen contacten" : `${count} mensen in je netwerk`;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("people")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 min-h-0">
          <WidgetHeader label="People Around Me." count={count ? `${count}` : ""} />
          <h3 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{sub}</p>
          <div className="mt-4 flex items-end gap-3">
            <CountUp value={count} className="text-[48px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
          </div>
          <div className="mt-4 flex-1 flex items-center">
            <div className="flex -space-x-2.5">
              {top.map((c, i) => (
                <motion.div key={c.id || i} className="h-9 w-9 rounded-full border-2 overflow-hidden shrink-0 flex items-center justify-center text-[11px] font-semibold" style={{ borderColor: "hsl(var(--charcoal))", background: A, zIndex: top.length - i }}
                  initial={{ scale: 0, x: -10 }} animate={{ scale: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.08, type: "spring", stiffness: 200 }}>
                  {c.avatar ? <img src={c.avatar} alt="" className="h-full w-full object-cover" /> : (c.name || "?").charAt(0).toUpperCase()}
                </motion.div>
              ))}
              {count > 5 && (
                <div className="h-9 w-9 rounded-full border-2 flex items-center justify-center text-[9px] font-semibold text-ivory/70 shrink-0" style={{ borderColor: "hsl(var(--charcoal))", background: "rgba(255,255,255,0.1)" }}>
                  +{count - 5}
                </div>
              )}
            </div>
          </div>
        </div>
        <BrandPhoto src={IMAGES.portraitThinking} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} contacten` : "Geen mensen"}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}