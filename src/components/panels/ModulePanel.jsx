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
    <>
      {/* Floating Giulia + laars photo behind the open panel, between the
          backdrop photo and the panel itself. */}
      {mod && (
        <div className="fixed inset-0 pointer-events-none hidden lg:block" style={{ zIndex: 45 }} aria-hidden>
          <img
            src={IMAGES.portraitBootFace}
            alt=""
            className="absolute left-[5%] bottom-6 h-[68vh] w-auto object-contain drop-shadow-2xl animate-float-slow opacity-95"
            draggable={false}
          />
        </div>
      )}
      <FloatingPanel open={!!mod} onClose={closeModule} level={3} width={mod?.panelWidth || 720} draggable>
        {mod && (
          <div className="flex-1 min-h-0 flex flex-col">
          <div className="h-[3px] w-full shrink-0" style={{ background: MODULE_ACCENT[activeModule] || "hsl(var(--sand))" }} />
          {/* Full-bleed photo header — the whole header is a photograph */}
          <div className="relative shrink-0 h-[170px] overflow-hidden">
            <img src={MODULE_IMAGE[activeModule] || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-charcoal/10" />
            <div className="relative h-full flex flex-col justify-end px-7 lg:px-9 pb-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/70 font-semibold mb-1.5">Onderdeel</p>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-[30px] lg:text-[40px] font-display font-semibold tracking-[-0.02em] leading-none text-ivory text-shadow-soft">
                  {mod.label}
                </h2>
                <div className="flex items-center gap-2 shrink-0 pb-1">
                  {widgetDef && (
                    <button
                      onClick={addToDashboard}
                      disabled={adding}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ivory/90 text-charcoal px-3 py-2 text-[11px] font-semibold hover:bg-ivory transition disabled:opacity-50"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Widget</span>
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                  <span
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: MODULE_ACCENT[activeModule] || "hsl(var(--sand))", color: "hsl(var(--ivory))" }}
                  >
                    <mod.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content — cleaner, more opaque surface for readability */}
          <div className="flex-1 overflow-y-auto px-7 lg:px-9 py-7">
            <ActiveComponent />
          </div>
          </div>
        )}
      </FloatingPanel>
    </>
  );
}