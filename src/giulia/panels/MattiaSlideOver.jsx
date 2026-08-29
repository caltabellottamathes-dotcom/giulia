import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import MattiaPanel from "./MattiaPanel";
import { Image } from "@/components/ui/image";
import { LIFE_PHOTO_MATTIA } from "@/lib/lifePhotos";

const EASE = [0.16, 1, 0.3, 1];

/** MattiaSlideOver — zwevend glas-paneel (zoals de MediaStage, met een
 *  pistache-bloom) dat over de pagina schuift, links, boven alle schaduwen.
 *  Bevat Mattia Chat + Voice. Opent via de Mattia-knop in de stage-iconen. */
export default function MattiaSlideOver({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "-118%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-118%", opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="fixed left-[2%] top-1/2 -translate-y-1/2 w-[400px] max-w-[92vw] h-[88vh] z-[80] rounded-[26px] overflow-hidden"
          style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(56px) saturate(1.45)", WebkitBackdropFilter: "blur(56px) saturate(1.45)", border: "1px solid rgba(255,255,255,0.20)", boxShadow: "0 48px 100px -28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.24)" }}
        >
          {/* LIFE foto achtergrond */}
          <Image src={LIFE_PHOTO_MATTIA} fittingType="fill" alt="" className="absolute inset-0 w-full h-full opacity-30" draggable={false} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(248,248,248,0.45), rgba(120,128,133,0.35))" }} />
          {/* pistache bloom */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 18% 16%, rgba(216,218,179,0.34), transparent 62%)" }} />

          <button onClick={onClose} className="absolute top-3 left-3 z-50 h-9 w-9 rounded-full flex items-center justify-center transition hover:bg-white/10" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.26)", color: "#2a2c30" }} aria-label="Sluiten">
            <X className="w-4 h-4" />
          </button>

          <div className="relative h-full w-full">
            <MattiaPanel onClose={onClose} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}