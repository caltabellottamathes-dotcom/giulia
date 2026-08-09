import React, { useState } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { MODULES } from "@/lib/moduleRegistry";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, LayoutGrid } from "lucide-react";

/**
 * The ONE sliding glass panel used for every module. The content determines
 * the width (panelWidth per module). The header carries a clear
 * "Add widget to dashboard" action when a widget exists for this module.
 */
const MODULE_ACCENT = {
  agenda: "hsl(var(--sand))", projects: "hsl(var(--olive))", tasks: "hsl(var(--charcoal))",
  email: "hsl(var(--blue-grey))", whatsapp: "hsl(var(--sand))", knowledge: "hsl(var(--olive))",
  documents: "hsl(var(--charcoal))", people: "hsl(var(--blue-grey))", approvals: "hsl(var(--olive))",
  activity: "hsl(var(--sand))", memory: "hsl(var(--charcoal))", insights: "hsl(var(--sand))",
  chat: "hsl(var(--olive))", voice: "hsl(var(--charcoal))",
};

const MODULE_IMAGE = {
  agenda: IMAGES.sittingChairs,
  projects: IMAGES.feetChair,
  tasks: IMAGES.topDownWalk,
  email: IMAGES.walkingChairs,
  whatsapp: IMAGES.walkingChairs,
  knowledge: IMAGES.portraitThinking,
  documents: IMAGES.topDownWalk,
  people: IMAGES.sittingChairs,
  approvals: IMAGES.feetChair,
  activity: IMAGES.walkingChairs,
  memory: IMAGES.portraitThinking,
  insights: IMAGES.portraitBootHands,
  chat: IMAGES.portraitBootFace,
  voice: IMAGES.portraitBootFace,
};

export default function ModulePanel() {
  const { activeModule, closeModule } = usePanel();
  const mod = activeModule ? MODULES[activeModule] : null;
  const ActiveComponent = mod?.Component;
  const widgetDef = activeModule ? WIDGETS[activeModule] : null;
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);

  const addToDashboard = async () => {
    if (!widgetDef) return;
    setAdding(true);
    try {
      const existing = await base44.entities.DashboardWidget.filter({ widget_type: activeModule });
      if (existing && existing.length) {
        toast({ title: "Staat al op je dashboard" });
        return;
      }
      await base44.entities.DashboardWidget.create({ widget_type: activeModule, position: 99, visible: true });
      toast({ title: "Widget toegevoegd", description: `${widgetDef.label} staat nu op je dashboard` });
    } catch (e) {
      toast({ title: "Toevoegen mislukt", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <FloatingPanel open={!!mod} onClose={closeModule} level={3} width={mod?.panelWidth || 720} draggable>
      {mod && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="h-[3px] w-full shrink-0" style={{ background: MODULE_ACCENT[activeModule] || "hsl(var(--sand))" }} />
          {/* Cleaner header — lighter image, clearer title, dashboard action */}
          <div className="relative px-7 lg:px-9 pt-7 pb-5 shrink-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img src={MODULE_IMAGE[activeModule] || IMAGES.walkingChairs} alt="" className="h-full w-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-charcoal/30 to-transparent" />
            </div>
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/75 font-medium mb-2">Onderdeel</p>
                <h2 className="text-[26px] lg:text-[30px] font-display font-semibold tracking-tight leading-none text-ivory text-shadow-soft">
                  {mod.label}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                {widgetDef && (
                  <button
                    onClick={addToDashboard}
                    disabled={adding}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ivory text-charcoal px-3 py-2 text-[11px] font-semibold hover:bg-ivory/90 transition disabled:opacity-50"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Widget</span>
                    <Plus className="h-3 w-3" />
                  </button>
                )}
                <span className="h-11 w-11 rounded-full bg-ivory/15 border border-ivory/25 flex items-center justify-center shrink-0">
                  <mod.icon className="h-4 w-4 text-ivory" strokeWidth={1.5} />
                </span>
              </div>
            </div>
            <div className="relative mt-5 h-px w-full bg-gradient-to-r from-ivory/40 via-ivory/15 to-transparent" />
          </div>

          {/* Content — cleaner, more opaque surface for readability */}
          <div className="flex-1 overflow-y-auto px-7 lg:px-9 py-7">
            <ActiveComponent />
          </div>
        </div>
      )}
    </FloatingPanel>
  );
}