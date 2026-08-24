import React, { useState } from "react";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * ModulePanelTemplate — het ultieme, kopieerbare ModulePanel-sjabloon.
 * Universele placeholder-copy. Kopieer dit bestand, hernoem het, en vul per
 * module de titels, tabs, body-elementen, contextrij en quick actions in.
 *
 * Structuur:
 *   1. HeroPhoto
 *   2. GlassShellPanel
 *        - HEADER : Widget Title (kicker) + Panel Title + Tabs (platte tekst)
 *                   + Open Space + Help
 *        - BODY   : kader met vrij in te delen 12×6 raster
 *        - FOOTER : universele contextrij + quick actions (subtiel)
 *
 * Props: accent (css-kleur), heroImage (url), openRoute (route voor Open Space)
 */
export default function ModulePanelTemplate({ accent = "hsl(var(--sand))", heroImage, openRoute }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tab1");
  const [helpOpen, setHelpOpen] = useState(false);

  const tabs = [
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" },
    { key: "tab3", label: "Tab 3" },
  ];
  const context = [
    { label: "Context 01", text: "Korte contextregel over de huidige staat." },
    { label: "Context 02", text: "Korte contextregel over wat aandacht vraagt." },
    { label: "Context 03", text: "Korte contextregel over de voorgestelde actie." },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 1. HeroPhoto */}
      <div className="h-[3px] w-full shrink-0" style={{ background: accent }} />
      <div className="relative shrink-0 h-44 overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal/70 via-charcoal/40 to-charcoal/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
      </div>

      {/* 2. GlassShellPanel */}
      <div className="flex-1 -mt-10 rounded-t-[28px] glass-3 flex flex-col min-h-0 overflow-hidden">
        {/* HEADER */}
        <div className="px-7 lg:px-9 pt-7 pb-6 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">Widget Title</p>
              <h2 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory">Panel Title</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {openRoute && (
                <button onClick={() => navigate(openRoute)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-2 text-[11px] font-bold hover:bg-charcoal/90 transition shadow-sm">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open space</span>
                </button>
              )}
              <button onClick={() => setHelpOpen(v => !v)} aria-label="Help"
                className={`inline-flex items-center justify-center rounded-full glass-button h-9 w-9 text-ivory transition ${helpOpen ? "ring-2 ring-ivory/30" : ""}`}>
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs — platte tekst + onderlijning actief */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`text-[12px] font-medium tracking-[0.04em] transition-colors ${activeTab === t.key ? "text-ivory underline underline-offset-[6px] decoration-ivory/60" : "text-ivory/45 hover:text-ivory/80"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-7 lg:mx-9 h-px bg-storm/10 shrink-0" />

        {/* Help-strip */}
        {helpOpen && (
          <div className="mx-7 lg:mx-9 mt-4 mb-1 shrink-0 rounded-2xl border border-storm/10 bg-marble/5 px-4 py-3">
            <p className="text-storm/70 text-xs leading-relaxed">Helptekst: leg kort uit wat de Body-inhoud laat zien en hoe je 'm gebruikt.</p>
          </div>
        )}

        {/* BODY — kader met vrij in te delen 12×6 raster */}
        <div className="flex-1 min-h-0 px-7 lg:px-9 pt-5">
          <div className="h-full rounded-2xl border border-storm/12 bg-marble/[0.03] overflow-hidden p-4">
            <div className="h-full grid grid-cols-12 grid-rows-6 gap-3">
              {/* Voorbeeld-indeling — pas per element col-span / row-span aan */}
              <div className="col-span-4 row-span-6 rounded-xl border border-dashed border-storm/15 flex items-center justify-center text-storm/40 text-[10px] uppercase tracking-[0.22em]">Element A</div>
              <div className="col-span-8 row-span-3 rounded-xl border border-dashed border-storm/15 flex items-center justify-center text-storm/40 text-[10px] uppercase tracking-[0.22em]">Element B</div>
              <div className="col-span-8 row-span-3 rounded-xl border border-dashed border-storm/15 flex items-center justify-center text-storm/40 text-[10px] uppercase tracking-[0.22em]">Element C</div>
            </div>
          </div>
        </div>

        <div className="mx-7 lg:mx-9 h-px bg-storm/10 shrink-0" />

        {/* FOOTER — universele contextrij + quick actions (subtiel) */}
        <div className="shrink-0 px-7 lg:px-9 pt-5 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {context.map((c, i) => (
              <div key={i}>
                <p className="text-storm/45 text-[9px] uppercase tracking-[0.26em] font-semibold mb-1.5">{c.label}</p>
                <p className="text-storm/65 text-[12px] leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-metal hover:brightness-95 transition" style={{ background: accent }}>
              Quick Action 1 <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-medium text-storm/60 hover:text-storm border border-storm/12 hover:border-storm/25 transition">
              Quick Action 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}