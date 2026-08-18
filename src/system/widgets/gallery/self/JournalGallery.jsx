import React from "react";
import { motion } from "framer-motion";
import GalleryShell, { GalleryLabel } from "@/system/widgets/gallery/GalleryShell";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const ENTRIES = [
  { title: "Stilte voor de dag begon", highlight: true },
  { title: "Wandeling langs het water", highlight: false },
  { title: "Een oude gedachte teruggekomen", highlight: false },
  { title: "Gesprek met M. over grenzen", highlight: true },
  { title: "Vroeg naar bed, opgelucht", highlight: false },
];

/** Journal — "What did I write?" · vertical thread + photo. Tall narrow. */
export default function JournalGallery({ delay = 0 }) {
  return (
    <GalleryShell domain="self" delay={delay} className="min-h-[300px]">
      <div className="flex flex-col h-full p-4 pb-0">
        <div className="flex flex-col flex-1 min-h-0">
          <GalleryLabel label="Journal" count="2 vandaag" />
          <h2 className="text-[16px] leading-[1.1] font-display font-semibold tracking-[-0.03em] line-clamp-2">Stilte voor de dag begon</h2>
          <div className="mt-3 flex-1 relative min-h-0">
            <div className="absolute left-[4px] top-1 bottom-1 w-px" style={{ background: "var(--gallery-accent)", opacity: 0.25 }} />
            <div className="space-y-2.5">
              {ENTRIES.map((e, i) => (
                <motion.div key={i} className="relative flex items-center gap-2.5 pl-4"
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: delay + 0.15 + i * 0.07 }}>
                  <span className="absolute left-0 h-2 w-2 rounded-full"
                    style={{ background: e.highlight ? "var(--gallery-accent)" : "var(--gallery-accent)", opacity: e.highlight ? 1 : 0.5, border: e.highlight ? "none" : "none" }} />
                  <p className="text-[10px] truncate flex-1 opacity-85">{e.title}</p>
                  {e.highlight && <span className="text-[10px]" style={{ color: "var(--gallery-accent)" }}>★</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 mb-3 rounded-xl overflow-hidden h-16 shrink-0">
          <img src={SELF_PHOTO.journal} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    </GalleryShell>
  );
}