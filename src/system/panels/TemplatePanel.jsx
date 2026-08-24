import React from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, ArrowUpRight, X } from "lucide-react";
import { AnimatedPicto } from "@/system/panels/previewParts";

/**
 * TemplatePanel — generiek OnderdeelPaneel-skelet met placeholder-tekst.
 * Zes standaard slots: accent-strook, header-foto, titelblok, actie-rij,
 * inhoud, context-footer. Kopieer dit als basis voor elk nieuw paneel en
 * vul de placeholders in met echte data + een module-key.
 *
 * Placeholder-copy wordt met "__" aangeduid — vervang per paneel.
 */

const T = (label) => label; // placeholder-helper

export default function TemplatePanel({
  accent = "hsl(var(--charcoal))",
  photo,                   // optioneel: header-foto URL
  title = "[ ONDERDEELPANEEL ]",
  topic = "Template copy — titel van dit paneel",
  functions = ["Snelkoppeling", "Snelkoppeling", "Snelkoppeling"],
  route = "/",
  icon,                    // optioneel: lucide-component voor AnimatedPicto
  onAdd,                   // optioneel: callback voor Widget-toevoegen
  adding = false,
  children,                // content-slot (Preview / PreviewShell)
}) {
  return (
    <div className="flex flex-col h-full">
      {/* slot 1 — accent-strook */}
      <div className="h-[3px] w-full shrink-0" style={{ background: accent }} />

      {/* slot 2 — header-foto */}
      <div className="relative shrink-0 h-44 overflow-hidden">
        {photo ? (
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 bg-marble/8 flex items-center justify-center">
            <span className="text-storm/20 text-[10px] uppercase tracking-[0.3em]">HEADER · FOTO</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
      </div>

      {/* slot 3 + 4 — titelblok + actie-rij (in glass-overlay) */}
      <div className="flex-1 -mt-10 rounded-t-[28px] glass-3 overflow-y-auto">
        <div className="px-7 lg:px-9 pt-7 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">Snelle context</p>
              <h2 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory">{title}</h2>
              <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-2.5">
                {functions.map((f, i) => (
                  <Link key={i} to={route} className="text-[11px] text-ivory/55 hover:text-ivory transition-colors underline underline-offset-4 decoration-ivory/20">{T(f)}</Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <button onClick={onAdd} disabled={adding} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-2 text-[11px] font-semibold text-ivory transition disabled:opacity-50">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Widget</span>
                <Plus className="h-3 w-3" />
              </button>
              <Link to={route} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-2 text-[11px] font-bold hover:bg-charcoal/90 transition shadow-sm">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open space</span>
              </Link>
              {icon && <AnimatedPicto icon={icon} accent={accent} />}
            </div>
          </div>
        </div>

        {/* slot 5 — inhoud */}
        <div className="px-7 lg:px-9 pb-8">
          {children ?? (
            <div className="rounded-2xl border border-dashed border-marble/25 bg-marble/5 p-6 text-center">
              <p className="text-storm/40 text-sm">Template copy — inhoud-slot (Preview / PreviewShell)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}