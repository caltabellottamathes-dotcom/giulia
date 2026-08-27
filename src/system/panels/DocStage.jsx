import React from "react";
import { FileText } from "lucide-react";

/**
 * DocStage — document-view in het multi-functionele Pagina-Ontwerp paneel.
 * Lichtgewicht stub: gelinkte documenten verschijnen hier zodra ze geselecteerd
 * worden. Mattia houdt de map in de gaten.
 */
export default function DocStage() {
  return (
    <div className="refraction-panel h-full flex flex-col items-center justify-center text-center px-8">
      <div className="h-14 w-14 rounded-2xl bg-ivory/10 border border-ivory/15 flex items-center justify-center mb-5">
        <FileText className="h-6 w-6 text-ivory/70" />
      </div>
      <p className="font-display font-semibold text-xl tracking-[-0.01em] text-ivory">Documenten</p>
      <p className="text-[13px] text-ivory/55 mt-2 max-w-[16rem] leading-relaxed">
        Gelinkte documenten verschijnen hier. Mattia houdt de map in de gaten.
      </p>
    </div>
  );
}