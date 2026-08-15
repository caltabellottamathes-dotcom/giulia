import React from "react";
import { Link } from "react-router-dom";
import { PanelProvider } from "@/lib/PanelContext";
import ModulePanel from "@/system/panels/ModulePanel";
import HobbiesWidget from "@/life/widgets/HobbiesWidget";
import HouseholdWidget from "@/life/widgets/HouseholdWidget";
import SocialPlannerWidget from "@/life/widgets/SocialPlannerWidget";
import SocialPulseWidget from "@/life/widgets/SocialPulseWidget";
import PersonalAdminWidget from "@/life/widgets/PersonalAdminWidget";

/**
 * LifeGallery — een standalone pagina, los van het OS, die alle LIFE-widgets
 * samenbrengt. Geen OS-shell/header/nav; wel een eigen PanelProvider +
 * ModulePanel zodat de widgets interactief blijven (klik opent het panel).
 */
export default function LifeGallery() {
  return (
    <PanelProvider>
      <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
            <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">LIFE · Galerij</h1>
            <p className="text-sm text-muted-foreground mt-1">Alle LIFE-widgets, los van het OS.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(200px,auto)] gap-4">
          <SocialPulseWidget />
          <SocialPlannerWidget />
          <HouseholdWidget />
          <PersonalAdminWidget />
          <HobbiesWidget />
        </div>
      </div>
      <ModulePanel />
    </PanelProvider>
  );
}