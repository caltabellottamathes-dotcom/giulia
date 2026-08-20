import React from "react";
import { Link } from "react-router-dom";
import { PanelProvider } from "@/lib/PanelContext";
import ModulePanel from "@/system/panels/ModulePanel";
import MasonryGrid from "@/system/widgets/MasonryGrid";
import DailyStateEditorial from "@/self/widgets/editorial/DailyStateEditorial";
import RoutinesEditorial from "@/self/widgets/editorial/RoutinesEditorial";
import WakeEditorial from "@/self/widgets/editorial/WakeEditorial";
import TherapyEditorial from "@/self/widgets/editorial/TherapyEditorial";
import JournalEditorial from "@/self/widgets/editorial/JournalEditorial";
import PersonalDevelopmentEditorial from "@/self/widgets/editorial/PersonalDevelopmentEditorial";
import PersonalTimeEditorial from "@/self/widgets/editorial/PersonalTimeEditorial";
import SelfInsightsEditorial from "@/self/widgets/editorial/SelfInsightsEditorial";
import EnergyLiveLine from "@/self/widgets/editorial2/EnergyLiveLine";
import CapacityDonut from "@/self/widgets/editorial2/CapacityDonut";
import WeeklyRhythm from "@/self/widgets/editorial2/WeeklyRhythm";
import CrossDomainConstellation from "@/self/widgets/editorial2/CrossDomainConstellation";
import ApprovalFlow from "@/self/widgets/editorial2/ApprovalFlow";
import DayAgendaStack from "@/self/widgets/editorial2/DayAgendaStack";
import SleepTimeline from "@/self/widgets/editorial2/SleepTimeline";
import SocialOrbit from "@/self/widgets/editorial2/SocialOrbit";
import SystemHeartbeat from "@/self/widgets/editorial2/SystemHeartbeat";
import CountdownVertical from "@/self/widgets/editorial2/CountdownVertical";

/**
 * SelfGallery — standalone pagina met de acht oorspronkelijke SELF editorial
 * information objects, plus een tweede reeks van tien nieuwe grafische widgets
 * (verschillende formaten: 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16). Zelfde stijl:
 * plum, sage, glas, motion.
 */
export default function SelfGallery() {
  // width spans: 1 = smal, 2 = breed — aangepast per widget-inhoud
  const spans = [
    1, 2, 1, 2, 1, 2, 2, 2,        // reeks 1 — oorspronkelijke 8
    2, 1, 2, 1, 2, 1, 1, 1, 1, 1,  // reeks 2 — tien nieuwe grafische widgets
  ];
  return (
    <PanelProvider>
      <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
        <div className="mb-6">
          <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
          <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">SELF · Galerij</h1>
          <p className="text-sm text-muted-foreground mt-1">Acht editorial objects + tien nieuwe grafische widgets — plum, sage, glas.</p>
        </div>

        <MasonryGrid spans={spans} gap={16}>
          {/* Reeks 1 — oorspronkelijk */}
          <DailyStateEditorial />
          <RoutinesEditorial />
          <WakeEditorial />
          <TherapyEditorial />
          <JournalEditorial />
          <PersonalDevelopmentEditorial />
          <PersonalTimeEditorial />
          <SelfInsightsEditorial />
          {/* Reeks 2 — tien nieuwe grafische widgets */}
          <EnergyLiveLine />
          <CapacityDonut />
          <WeeklyRhythm />
          <CrossDomainConstellation />
          <ApprovalFlow />
          <DayAgendaStack />
          <SleepTimeline />
          <SocialOrbit />
          <SystemHeartbeat />
          <CountdownVertical />
        </MasonryGrid>
      </div>
      <ModulePanel />
    </PanelProvider>
  );
}