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
const AUD_EXT = /\.(mp3|wav|ogg|m4a|flac|aac)$/i;

/** MusicPlayer — "Wat luistert?" Album-art + live waveform. */
export default function MusicPlayerGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: uploads } = useEntityList("Upload", { sort: "-created_date", realtime: true, externalTick: t });
  const audio = (uploads || []).filter(u => u.file_url && AUD_EXT.test(u.filename || u.file_url));
  const count = audio.length;
  const latest = audio[0];

  return (
    <WidgetShell size="1x1" radius="medium" interactive onClick={() => openModule("musicplayer")} className="min-h-[124px] overflow-hidden" style={{ "--tile-accent": A }}>
      <div className="relative h-full w-full flex flex-col">
        <div className="p-3 flex-1 flex flex-col min-h-0">
          <WidgetHeader label="Muziek" count={count ? `${count}` : ""} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-end gap-[2px] h-10">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45, 0.7, 0.55, 0.85, 0.5, 0.65].map((h, i) => (
                <motion.span key={i} className="w-[2.5px] rounded-full" style={{ background: A }}
                  animate={{ height: [`${h * 30}%`, `${h * 100}%`, `${h * 30}%`] }}
                  transition={{ duration: 0.8 + i * 0.05, repeat: Infinity, ease: "easeInOut" }} />
              ))}
            </div>
          </div>
        </div>
        <div className="px-3 pb-3">
          <h3 className="text-[14px] leading-[1.0] font-display font-semibold tracking-[-0.02em] text-current">{count === 0 ? "GEEN MUZIEK" : `${count} TRACK${count > 1 ? "S" : ""}`}</h3>
          {latest && <p className="text-[8px] uppercase tracking-[0.18em] opacity-50 mt-0.5 truncate">{latest.filename}</p>}
        </div>
      </div>
    </WidgetShell>
  );
}