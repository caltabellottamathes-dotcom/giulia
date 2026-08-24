import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import TemplatePanel from "@/system/panels/TemplatePanel";

/** PanelDesign — toont het generieke OnderdeelPaneel-skelet (template copy)
 *  op ware grootte, als herbruikbare basis voor nieuwe panelen. */
const ACCENT = "hsl(var(--charcoal))";

export default function PanelDesign() {
  return (
    <div className="min-h-screen bg-metal relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 18% 16%, rgba(224,222,211,0.18) 0%, rgba(242,242,240,0.08) 28%, rgba(45,45,35,0) 60%)" }} />

      <div className="relative z-10 mx-auto max-w-[1100px] px-4 sm:px-8 py-6 flex flex-col items-center h-screen">
        <div className="w-full flex items-center justify-between mb-4">
          <Link to="/" className="text-storm/60 hover:text-storm text-sm">← Terug naar OS</Link>
          <p className="text-storm/45 text-[11px] uppercase tracking-[0.24em]">Onderdeelpaneel · 720px · Template</p>
        </div>

        <div
          className="glass-3 float-shadow rounded-[28px] overflow-y-auto overflow-x-hidden relative flex flex-col w-full max-w-[720px]"
          style={{ height: "calc(100dvh - 7rem)" }}
        >
          <Link to="/" className="absolute top-4 left-4 z-10 h-8 w-8 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Sluiten">
            <X className="h-4 w-4" />
          </Link>

          <TemplatePanel accent={ACCENT} route="/" />
        </div>
      </div>
    </div>
  );
}