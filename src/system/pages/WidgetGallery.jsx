import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WIDGETS } from "@/lib/widgetGalleryData";
import VariantEditorial from "@/system/components/gallery/widgetgallery/VariantEditorial";
import VariantBento from "@/system/components/gallery/widgetgallery/VariantBento";
import VariantGlassDepth from "@/system/components/gallery/widgetgallery/VariantGlassDepth";

/**
 * WidgetGallery — private comparison page, not part of the OS navigation.
 * All 17 widget types in 3 design directions, each rooted in the OS's real
 * widget aesthetic (glass + editorial photo, layered both ways — see
 * WIDGET_DESIGN_BRIEF.md at the project root for the full brief).
 */
const DESIGNS = [
  { key: "editorial", title: "Design 1 — Glass Over Photo", desc: "Glas overlapt naar beneden op een fotostrip — zoals Taken nu al doet.", Variant: VariantEditorial },
  { key: "bento", title: "Design 2 — Photo Over Glass", desc: "Een fotoband zweeft bovenop de glasrand — zoals Email nu al doet, met bold cijfers.", Variant: VariantBento },
  { key: "glass", title: "Design 3 — Side-by-Side Editorial", desc: "Foto en glas naast elkaar — zoals Giulia's widget, met tabs voor meer diepte.", Variant: VariantGlassDepth },
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
          17 widgets, elk in 3 designrichtingen, allemaal gebouwd op de echte OS-esthetiek — alleen voor jou. Klik op de pagina-stippen/tabs en probeer de actieknoppen.
        </p>
      </div>

      {DESIGNS.map(({ key, title, desc, Variant }) => (
        <section key={key}>
          <div className="mb-6">
            <h2 className="text-xl font-display font-semibold">{title}</h2>
            <p className="text-sm mt-1 text-muted-foreground">{desc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {WIDGETS.map((widget, i) => (
              <div key={widget.key} className="space-y-2">
                <Variant widget={widget} index={i} />
                <p className="text-[11px] uppercase tracking-[0.14em] text-center text-muted-foreground">{widget.label}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}