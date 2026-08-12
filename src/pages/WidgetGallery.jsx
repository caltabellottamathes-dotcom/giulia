import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WIDGETS } from "@/lib/widgetGalleryData";
import VariantEditorial from "@/components/widgetgallery/VariantEditorial";
import VariantBento from "@/components/widgetgallery/VariantBento";
import VariantGlassDepth from "@/components/widgetgallery/VariantGlassDepth";

/**
 * WidgetGallery — private comparison page, not part of the OS navigation.
 * Shows all 17 widget types in 3 design directions so Salvo can pick a winner
 * per widget (or per whole design language).
 */
const DESIGNS = [
  { key: "editorial", title: "Design 1 — Ivory Editorial", desc: "Licht, rustig, redactioneel. Charcoal typografie op warm ivoor.", Variant: VariantEditorial, wrapBg: "" },
  { key: "bento", title: "Design 2 — Solid Bento", desc: "Vol paletkleur per widget, ivoren type, posterachtig en zelfverzekerd.", Variant: VariantBento, wrapBg: "" },
  { key: "glass", title: "Design 3 — Glass Depth", desc: "Donker refractieglas met een gloed achter elke graphic.", Variant: VariantGlassDepth, wrapBg: "bg-charcoal rounded-[28px]" },
];

export default function WidgetGallery() {
  return (
    <div className="min-h-screen bg-background px-6 lg:px-12 py-10 space-y-16">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Terug naar Home
        </Link>
        <h1 className="text-3xl font-display font-bold tracking-tight">Widget Gallery</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          17 widgets, elk in 3 designrichtingen — alleen voor jou, geen deel van de OS. Kies per widget of per stijl welke je het beste vindt.
        </p>
      </div>

      {DESIGNS.map(({ key, title, desc, Variant, wrapBg }) => (
        <section key={key} className={wrapBg ? `${wrapBg} p-6 lg:p-10` : ""}>
          <div className="mb-6">
            <h2 className={`text-xl font-display font-semibold ${wrapBg ? "text-ivory" : ""}`}>{title}</h2>
            <p className={`text-sm mt-1 ${wrapBg ? "text-ivory/60" : "text-muted-foreground"}`}>{desc}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {WIDGETS.map((widget) => (
              <div key={widget.key} className="space-y-2">
                <Variant widget={widget} />
                <p className={`text-[11px] uppercase tracking-[0.14em] text-center ${wrapBg ? "text-ivory/50" : "text-muted-foreground"}`}>
                  {widget.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}