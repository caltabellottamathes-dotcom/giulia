import React, { useState } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { MODULES } from "@/lib/moduleRegistry";
import { WIDGETS } from "@/lib/widgetRegistry";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * The ONE sliding glass panel used for every module. Header redesigned in the
 * widget style: a bold dark block color-coded by module accent, with a thick
 * accent bar, a bold display label and tactile accent action chips.
 */
const MODULE_ACCENT = {
  agenda: "hsl(var(--sand))", projects: "hsl(var(--olive))", tasks: "hsl(16 45% 47%)",
  email: "hsl(var(--ridge))", whatsapp: "hsl(var(--sand))", knowledge: "hsl(var(--olive))",
  documents: "hsl(16 45% 47%)", people: "hsl(var(--ridge))", approvals: "hsl(var(--olive))",
  activity: "hsl(var(--sand))", memory: "hsl(16 45% 47%)", insights: "hsl(var(--sand))",
  chat: "hsl(var(--olive))", voice: "hsl(16 45% 47%)",
  integrations: "hsl(var(--ridge))", settings: "hsl(var(--sand))", profile: "hsl(var(--olive))",
};

const MODULE_ROUTE = {
  agenda: "/agenda", projects: "/projects", tasks: "/tasks", email: "/email",
  whatsapp: "/whatsapp", knowledge: "/knowledge", documents: "/documents",
  people: "/people", chat: "/chat", voice: "/voice", approvals: "/approvals",
  activity: "/activity", memory: "/memory", integrations: "/integrations",
  settings: "/settings", profile: "/profile", insights: "/insights",
};

export default function ModulePanel() {
  const { activeModule, closeModule } = usePanel();
  const navigate = useNavigate();
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

  const accent = MODULE_ACCENT[activeModule] || "hsl(var(--sand))";

  return (
    <FloatingPanel open={!!mod} onClose={closeModule} position="right" level={3} width={mod?.panelWidth || 720}>
      {mod && (
        <div className="flex flex-col h-full">
          <div className="h-1.5 w-full shrink-0" style={{ background: accent }} />
          {/* Header — bold dark block, color-coded like the widgets */}
          <div className="relative shrink-0 bg-charcoal px-7 lg:px-9 pt-8 pb-7 pl-14 lg:pl-16">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent }}>
                    <mod.icon className="h-5 w-5 text-ivory" strokeWidth={2} />
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: accent }}>Onderdeel</p>
                </div>
                <h2 className="text-3xl lg:text-[34px] font-display font-bold tracking-[-0.02em] leading-none text-ivory">
                  {mod.label}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                {widgetDef && (
                  <button
                    onClick={addToDashboard}
                    disabled={adding}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition hover:-translate-y-0.5 disabled:opacity-50"
                    style={{ background: accent, color: "hsl(var(--ivory))" }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Widget</span>
                  </button>
                )}
                {MODULE_ROUTE[activeModule] && (
                  <button
                    onClick={() => { navigate(MODULE_ROUTE[activeModule]); closeModule(); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ivory/25 px-3 py-2 text-[11px] font-bold text-ivory transition hover:bg-ivory/10"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Pagina</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-7 lg:px-9 py-7">
            <ActiveComponent />
          </div>
        </div>
      )}
    </FloatingPanel>
  );
}