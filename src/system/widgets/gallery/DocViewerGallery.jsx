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
const DOC_EXT = /\.(pdf|doc|docx|txt|rtf|xls|xlsx|ppt|pptx)$/i;

/** DocViewer — "Wat staat er?" Doc-thumbnail + count. */
export default function DocViewerGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: docs } = useEntityList("Document", { sort: "-created_date", realtime: true, externalTick: t });
  const docFiles = (docs || []).slice(0, 20);
  const count = docFiles.length;
  const latest = docFiles[0];

  return (
    <WidgetShell size="1x1" radius="medium" interactive onClick={() => openModule("docviewer")} className="min-h-[124px] overflow-hidden" style={{ "--tile-accent": A }}>
      <div className="relative h-full w-full">
        <img src={IMAGES.womanFolder} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <WidgetHeader label="Document" />
          {count > 0 && <span className="text-[10px] font-mono tabular-nums text-ivory/70 bg-charcoal/40 rounded-full px-2 py-0.5">{count}</span>}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-[16px] leading-[1.0] font-display font-semibold tracking-[-0.02em] text-ivory">{count === 0 ? "LEEG" : `${count} DOC${count > 1 ? "S" : ""}`}</h3>
          {latest && <p className="text-[8px] uppercase tracking-[0.18em] text-ivory/60 mt-0.5 truncate">{latest.name || latest.title}</p>}
        </div>
        {count > 0 && <motion.span className="absolute top-3 right-10 h-2 w-2 rounded-full" style={{ background: A }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} />}
      </div>
    </WidgetShell>
  );
}