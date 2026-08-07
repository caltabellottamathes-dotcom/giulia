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
          <div className="relative px-7 lg:px-9 pt-8 pb-6 shrink-0 overflow-hidden">
            {/* Editorial accent field behind the title */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, hsl(var(--sienna)) 0%, transparent 55%)",
              }}
            />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.28em] text-sienna/90 font-medium mb-2.5">
                  Onderdeel
                </p>
                <h2 className="text-[26px] lg:text-[30px] font-heading font-light tracking-tight leading-none text-foreground">
                  {mod.label}
                </h2>
              </div>
              <div className="h-11 w-11 rounded-full glass-1 flex items-center justify-center shrink-0 mt-0.5">
                <mod.icon className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
              </div>
            </div>
            <div className="relative mt-6 h-px w-full bg-gradient-to-r from-border/70 via-border/30 to-transparent" />
          </div>
          <div className="flex-1 overflow-y-auto px-7 lg:px-9 py-7">
            <ActiveComponent />
          </div>
        </div>
      )}
    </FloatingPanel>
  );
}