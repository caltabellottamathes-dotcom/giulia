import React from "react";
import { Link } from "react-router-dom";
import OnderdeelPaneel from "@/system/panels/OnderdeelPaneel";
import { IMAGES } from "@/lib/images";

/** PanelDesign — referentiepagina voor de vaste Onderdeelpaneel-structuur.
 *  Toont één vast paneel als template; later volgen meer panelen in dezelfde anatomie. */
export default function PanelDesign() {
  return (
    <div className="min-h-screen bg-metal relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 18% 16%, rgba(224,222,211,0.18) 0%, rgba(242,242,240,0.08) 28%, rgba(45,45,35,0) 60%)" }} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8 py-8 h-full">
        <Link to="/" className="text-storm/60 hover:text-storm text-sm">← Terug naar OS</Link>
        <h1 className="text-storm text-2xl font-display font-semibold tracking-tight mt-2">Onderdeelpanelen · vaste structuur</h1>
        <p className="text-storm/55 text-sm mt-1 mb-6">Eén vast paneel als template — zes slots, altijd dezelfde anatomie.</p>

        <div className="h-[calc(100dvh-9rem)]">
          <OnderdeelPaneel
            accent="hsl(var(--olive))"
            photo={IMAGES.focusToDoNew}
            eyebrow="SNELLE CONTEXT"
            title="Wat nu op je ligt"
            topic="Deze structuur is het vaste skelet voor elk onderdeelpaneel — accent, foto, titel, acties, content en context staan altijd op dezelfde plek."
            actions={[
              { label: "Open space", primary: true, icon: "open" },
              { label: "Widget", primary: false, icon: "plus" },
              { label: "Filter", primary: false },
            ]}
            context={[
              { label: "OPEN", text: "6 taken wachten op actie." },
              { label: "DONE", text: "2 taken voltooid vandaag." },
              { label: "NEXT", text: "Hoogste prioriteit: Marktanalyse rapport." },
            ]}
          >
            {/* 05 — content-slot: placeholder voor de preview */}
            <div className="rounded-2xl border border-dashed border-ivory/15 bg-ivory/5 p-8 text-center">
              <p className="text-ivory/55 text-xs uppercase tracking-[0.2em] mb-2">CONTENT · SLOT 05</p>
              <p className="text-ivory/70 text-sm">Hier komt de quick-context preview van het onderdeel.</p>
            </div>
          </OnderdeelPaneel>
        </div>
      </div>
    </div>
  );
}