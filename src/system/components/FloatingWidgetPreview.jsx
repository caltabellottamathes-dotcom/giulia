import React from "react";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { MODULES } from "@/lib/moduleRegistry";
import { WidgetThemeProvider } from "@/lib/WidgetThemeContext";

/** FloatingWidgetPreview — wanneer een GIULIA-widget-paneeel opent, zweeft er
 *  een vergrote, niet-interactieve versie van de widget links langs het paneel. */
const GIULIA_MAP = { jedag: "giulia", wantstoknow: "giuliaquestions" };
const PREVIEW_MODULES = ["jedag", "goodmorning", "approvals", "insights", "wantstoknow"];

export default function FloatingWidgetPreview() {
  const { activeModule } = usePanel();
  if (!activeModule || !PREVIEW_MODULES.includes(activeModule)) return null;
  const def = WIDGETS[activeModule] || WIDGETS[GIULIA_MAP[activeModule]];
  if (!def) return null;
  const Comp = def.Component;
  const panelWidth = MODULES[activeModule]?.panelWidth || 720;

  return (
    <div className="fixed z-30 pointer-events-none animate-slide-right hidden lg:block" style={{ right: panelWidth + 28, top: "50%", transform: "translateY(-50%)", width: 340 }}>
      <WidgetThemeProvider value={{ theme: "glass", color: "", opacity: 1, blur: 0, domain: def.domain }}>
        <Comp />
      </WidgetThemeProvider>
    </div>
  );
}