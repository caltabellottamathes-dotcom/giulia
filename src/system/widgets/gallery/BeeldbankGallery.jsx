import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT } from "./palette";

const A = ACCENT.system;

/** Beeldbank — "Welke beelden?" Mini-grid van ImageAssets. */
export default function BeeldbankGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: assets } = useEntityList("ImageAsset", { sort: "-created_date", realtime: true, externalTick: t });
  const list = (assets || []).slice(0, 6);
  const count = (assets || []).length;
  const headline = count === 0 ? "LEEG" : count <= 5 ? "OPGEBOUWD" : "RIJK GEVULD";
  const sub = count === 0 ? "Nog geen beelden" : `${count} beelden beschikbaar`;

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("beeldbank")} className="min-h-[160px]" style={{ "--tile-accent": A }}>
      <div className="flex h-full gap-2.5 p-3">
        <div className="flex-1 flex flex-col min-w-0">
          <WidgetHeader label="Beeldbank" count={count ? `${count}` : ""} />
          <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[9px] uppercase tracking-[0.18em] opacity-50 mt-1">{sub}</p>
        </div>
        <div className="w-[45%] grid grid-cols-3 gap-1 shrink-0">
          {list.slice(0, 6).map((a, i) => (
            <motion.div key={a.id || i} className="rounded-md overflow-hidden" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
              <img src={a.url} alt="" className="h-full w-full object-cover" draggable={false} />
            </motion.div>
          ))}
          {!count && Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-md bg-ivory/5" />)}
        </div>
      </div>
    </WidgetShell>
  );
}