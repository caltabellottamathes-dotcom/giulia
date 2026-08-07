import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { MODULES } from "@/lib/moduleRegistry";

/**
 * The ONE sliding glass panel used for every module in the app.
 * Only one module is ever open at a time — its full content lives
 * inside this single panel, sliding in from the right edge.
 */
export default function ModulePanel() {
  const { activeModule, closeModule } = usePanel();
  const mod = activeModule ? MODULES[activeModule] : null;
  const ActiveComponent = mod?.Component;

  return (
    <FloatingPanel
      open={!!mod}
      onClose={closeModule}
      position="right"
      level={3}
    >
      {mod && (
        <div className="flex flex-col h-full">
          <div className="px-6 lg:px-8 pt-6 pb-4 border-b border-border/30 shrink-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Onderdeel
            </p>
            <h2 className="text-lg font-heading font-light flex items-center gap-2.5">
              <mod.icon className="h-4 w-4 text-muted-foreground" />
              {mod.label}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
            <ActiveComponent />
          </div>
        </div>
      )}
    </FloatingPanel>
  );
}