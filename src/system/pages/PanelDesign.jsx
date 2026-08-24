import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, LayoutGrid, ArrowUpRight, X } from "lucide-react";
import { MODULES } from "@/lib/moduleRegistry";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";
import { WIDGETS } from "@/lib/widgetRegistry";
import { AnimatedPicto } from "@/system/panels/previewParts";
import TasksPreview from "@/focus/panels/TasksPreview";
import { FOCUS } from "@/lib/domainPalettes";

/** PanelDesign — toont één écht dashboard-paneel (Taken) op ware grootte,
 *  exact zoals het in het schuifglas op het dashboard verschijnt (720px breed,
 *  volle hoogte), volledig in beeld. Accent = focus-domein kleur. */
const MODULE_KEY = "tasks";
const ACCENT = FOCUS.deep;               // focus-domein accent (#301728 Plum)
const TOPIC = "Wat nu op je ligt";
const ROUTE = "/tasks";

export default function PanelDesign() {
  const mod = MODULES[MODULE_KEY];
  const widgetDef = WIDGETS[MODULE_KEY];
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);

  const addToDashboard = async () => {
    setAdding(true);
    try {
      const existing = await base44.entities.DashboardWidget.filter({ widget_type: MODULE_KEY });
      if (existing && existing.length) { toast({ title: "Staat al op je dashboard" }); return; }
      await base44.entities.DashboardWidget.create({ widget_type: MODULE_KEY, position: 99, visible: true });
      toast({ title: "Widget toegevoegd", description: `${widgetDef.label} staat nu op je dashboard` });
    } catch (e) {
      toast({ title: "Toevoegen mislukt", variant: "destructive" });
    } finally { setAdding(false); }
  };

  return (
    <div className="min-h-screen bg-metal relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 18% 16%, rgba(224,222,211,0.18) 0%, rgba(242,242,240,0.08) 28%, rgba(45,45,35,0) 60%)" }} />

      <div className="relative z-10 mx-auto max-w-[1100px] px-4 sm:px-8 py-6 flex flex-col items-center h-screen">
        <div className="w-full flex items-center justify-between mb-4">
          <Link to="/" className="text-storm/60 hover:text-storm text-sm">← Terug naar OS</Link>
          <p className="text-storm/45 text-[11px] uppercase tracking-[0.24em]">Onderdeelpaneel · {mod.panelWidth}px · Taken</p>
        </div>

        {/* Het exacte dashboard-paneel — zelfde glass-3 kaart, breedte en hoogte als op het dashboard */}
        <div
          className="glass-3 float-shadow rounded-[28px] overflow-y-auto overflow-x-hidden relative flex flex-col w-full max-w-[720px]"
          style={{ height: "calc(100dvh - 7rem)" }}
        >
          <button onClick={() => navigate("/")} className="absolute top-4 left-4 z-10 h-8 w-8 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Sluiten">
            <X className="h-4 w-4" />
          </button>

          {/* ModulePanel inner structure — exacte kopie */}
          <div className="flex flex-col h-full">
            <div className="h-[3px] w-full shrink-0" style={{ background: ACCENT }} />
            <div className="relative shrink-0 h-44 overflow-hidden">
              <img src={widgetDef.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
            </div>

            <div className="flex-1 -mt-10 rounded-t-[28px] glass-3 overflow-y-auto">
              <div className="px-7 lg:px-9 pt-7 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">Snelle context</p>
                    <h2 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory">{TOPIC}</h2>
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-2.5">
                      {MODULE_FUNCTIONS[MODULE_KEY].map((f) => (
                        <Link key={f.label} to={f.to} className="text-[11px] text-ivory/55 hover:text-ivory transition-colors underline underline-offset-4 decoration-ivory/20">{f.label}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <button onClick={addToDashboard} disabled={adding} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-2 text-[11px] font-semibold text-ivory transition disabled:opacity-50">
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Widget</span>
                      <Plus className="h-3 w-3" />
                    </button>
                    <button onClick={() => navigate(ROUTE)} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-2 text-[11px] font-bold hover:bg-charcoal/90 transition shadow-sm">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Open space</span>
                    </button>
                    <AnimatedPicto icon={mod.icon} accent={ACCENT} />
                  </div>
                </div>
              </div>

              <div className="px-7 lg:px-9 pb-8">
                <TasksPreview onOpen={() => navigate(ROUTE)} limit={5} hideHeader />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}