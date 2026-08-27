import React from "react";
import { Film } from "lucide-react";

/**
 * MediaStage — media-view in het multi-functionele Pagina-Ontwerp paneel.
 * Lichtgewicht stub: één klik en je media verschijnt hier. Mattia staat klaar.
 */
export default function MediaStage() {
  return (
    <div className="refraction-panel h-full flex flex-col items-center justify-center text-center px-8">
      <div className="h-14 w-14 rounded-2xl bg-ivory/10 border border-ivory/15 flex items-center justify-center mb-5">
        <Film className="h-6 w-6 text-ivory/70" />
      </div>
      <p className="font-display font-semibold text-xl tracking-[-0.01em] text-ivory">Media</p>
      <p className="text-[13px] text-ivory/55 mt-2 max-w-[16rem] leading-relaxed">
        Eén klik en je media verschijnt hier. Mattia staat klaar.
      </p>
    </div>
  );
}