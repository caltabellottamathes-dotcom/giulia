import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PHOTOS4, PLUM, SAGE } from "@/self/widgets/editorial3/editorial3Data";

/** GalleryPolaroid — IN VIEW · 2:3. Foto (gallery walk) als polaroid-kaart
 *  met witte rand + lichte rotatie, als fysiek object op glas. */
export default function GalleryPolaroid() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "2 / 3", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <WidgetHeader label="In View" count="vandaag" />
        <div className="flex-1 flex items-center justify-center min-h-0">
          <motion.div className="bg-warm-white p-2 pb-6 rounded-md shadow-[0_16px_32px_-14px_rgba(0,0,0,0.45)]" style={{ width: "72%" }} initial={{ opacity: 0, y: 16, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="rounded-sm overflow-hidden aspect-[3/4]">
              <img src={PHOTOS4.galleryWalk} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>
            <p className="text-[8px] uppercase tracking-[0.22em] font-semibold mt-2 text-center" style={{ color: PLUM }}>NOW · 03:21</p>
          </motion.div>
        </div>
        <div className="flex items-end justify-between">
          <motion.h3 className="text-[26px] leading-none font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>IN VIEW</motion.h3>
          <div className="text-right">
            <span className="text-[22px] font-display font-semibold tabular-nums leading-none block">3</span>
            <span className="text-[7px] uppercase tracking-[0.2em] opacity-55">thema's</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}