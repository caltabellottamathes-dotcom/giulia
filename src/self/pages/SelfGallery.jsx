import React from "react";
import { Link } from "react-router-dom";
import { PanelProvider } from "@/lib/PanelContext";
import ModulePanel from "@/system/panels/ModulePanel";
import DailyStateEditorial from "@/self/widgets/editorial/DailyStateEditorial";
import RoutinesEditorial from "@/self/widgets/editorial/RoutinesEditorial";
import WakeEditorial from "@/self/widgets/editorial/WakeEditorial";
import TherapyEditorial from "@/self/widgets/editorial/TherapyEditorial";
import JournalEditorial from "@/self/widgets/editorial/JournalEditorial";
import PersonalDevelopmentEditorial from "@/self/widgets/editorial/PersonalDevelopmentEditorial";
import PersonalTimeEditorial from "@/self/widgets/editorial/PersonalTimeEditorial";
import SelfInsightsEditorial from "@/self/widgets/editorial/SelfInsightsEditorial";

/**
 * SelfGallery — een standalone pagina, los van het OS, die de acht
 * "editorial information objects" van SELF samenbrengt. Burgundy / beton /
 * glas; elke widget heeft zijn eigen formaat, foto en visuele metafoor.
 */
export default function SelfGallery() {
  return (
    <PanelProvider>
      <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
        <div className="mb-6">
          <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
          <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">SELF · Galerij</h1>
          <p className="text-sm text-muted-foreground mt-1">Acht editorial information objects — plum, contrast, glas.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(190px,auto)] gap-4">
          <DailyStateEditorial />
          <RoutinesEditorial />
          <WakeEditorial />
          <TherapyEditorial />
          <JournalEditorial />
          <PersonalDevelopmentEditorial />
          <PersonalTimeEditorial />
          <SelfInsightsEditorial />
        </div>
      </div>
      <ModulePanel />
    </PanelProvider>
  );
}