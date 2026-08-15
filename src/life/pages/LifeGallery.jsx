import React from "react";
import { Link } from "react-router-dom";
import { PanelProvider } from "@/lib/PanelContext";
import ModulePanel from "@/system/panels/ModulePanel";
import DailyStateWidget from "@/self/widgets/gallery/DailyStateWidget";
import RoutinesWidget from "@/self/widgets/gallery/RoutinesWidget";
import WakeWidget from "@/self/widgets/gallery/WakeWidget";
import TherapyWidget from "@/self/widgets/gallery/TherapyWidget";
import JournalWidget from "@/self/widgets/gallery/JournalWidget";
import PersonalDevelopmentWidget from "@/self/widgets/gallery/PersonalDevelopmentWidget";
import PersonalTimeWidget from "@/self/widgets/gallery/PersonalTimeWidget";
import InsightsWidget from "@/self/widgets/gallery/InsightsWidget";

/**
 * LifeGallery — standalone galerij los van het OS. Toont de acht nieuwe
 * editorial SELF-widgets, elk met een eigen visuele metafoor en formaat:
 * living state field · animated timeline · atmospheric progression ·
 * trajectory system · editorial journal · growth map · spatial time field ·
 * data narrative. Eigen PanelProvider + ModulePanel houdt ze interactief.
 */
export default function LifeGallery() {
  return (
    <PanelProvider>
      <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
            <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">SELF · Galerij</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">Acht editorial SELF-widgets — living state, animated timeline, atmospheric progression, trajectory system, editorial journal, growth map, spatial time field, data narrative.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(200px,auto)] gap-4">
          <DailyStateWidget />
          <RoutinesWidget />
          <WakeWidget />
          <TherapyWidget />
          <JournalWidget />
          <PersonalDevelopmentWidget />
          <PersonalTimeWidget />
          <InsightsWidget />
        </div>
      </div>
      <ModulePanel />
    </PanelProvider>
  );
}