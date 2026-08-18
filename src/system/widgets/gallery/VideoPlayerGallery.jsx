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
const VID_EXT = /\.(mp4|mov|avi|webm|mkv|m4v)$/i;

/** VideoPlayer — "Wat speelt er?" Thumbnail + play indicator. */
export default function VideoPlayerGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: uploads } = useEntityList("Upload", { sort: "-created_date", realtime: true, externalTick: t });
  const videos = (uploads || []).filter(u => u.file_url && VID_EXT.test(u.filename || u.file_url));
  const count = videos.length;
  const latest = videos[0];

  return (
    <WidgetShell size="1x1" radius="medium" interactive onClick={() => openModule("videoplayer")} className="min-h-[124px] overflow-hidden" style={{ "--tile-accent": A }}>
      <div className="relative h-full w-full">
        <img src={IMAGES.bootPhone} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3">
          <WidgetHeader label="Video" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: A }}
          animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="ml-0.5 text-charcoal text-[14px]">▶</span>
          </motion.div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-[16px] leading-[1.0] font-display font-semibold tracking-[-0.02em] text-ivory">{count === 0 ? "GEEN VIDEO" : `${count} VIDEO${count > 1 ? "'S" : ""}`}</h3>
          {latest && <p className="text-[8px] uppercase tracking-[0.18em] text-ivory/60 mt-0.5 truncate">{latest.filename}</p>}
        </div>
      </div>
    </WidgetShell>
  );
}