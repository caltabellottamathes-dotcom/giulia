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
import InRhythm from "@/self/widgets/editorial3/InRhythm";
import Overload from "@/self/widgets/editorial3/Overload";
import DeepWork from "@/self/widgets/editorial3/DeepWork";
import TwoWorlds from "@/self/widgets/editorial3/TwoWorlds";
import CountStars from "@/self/widgets/editorial3/CountStars";
import Breathe from "@/self/widgets/editorial3/Breathe";
import TwentyThreeDays from "@/self/widgets/editorial3/TwentyThreeDays";
import Threads from "@/self/widgets/editorial3/Threads";
import SteadyCard from "@/self/widgets/editorial4/SteadyCard";
import StackCard from "@/self/widgets/editorial4/StackCard";
import LacedRing from "@/self/widgets/editorial4/LacedRing";
import VeiledCard from "@/self/widgets/editorial4/VeiledCard";
import HandsMedallion from "@/self/widgets/editorial4/HandsMedallion";
import ThroughStrip from "@/self/widgets/editorial4/ThroughStrip";
import SignalCard from "@/self/widgets/editorial4/SignalCard";
import GalleryPolaroid from "@/self/widgets/editorial4/GalleryPolaroid";

/**
 * SelfGallery — standalone pagina met drie reeksen SELF information objects.
 * Reeks 1: acht oorspronkelijke editorial widgets (plum, sage, glas).
 * Reeks 2: tien nieuwe grafische widgets (verschillende formaten, live data).
 * Reeks 3: acht foto-gedreven widgets — grote foto's, grote grafische
 * typografie en visuele elementen (motion-driven, ADHD-vriendelijk).
 */
export default function SelfGallery() {
  // width spans: 1 = smal, 2 = breed
  const spans = [
    1, 2, 1, 2, 1, 2, 2, 2,          // reeks 1 — oorspronkelijke 8
    2, 1, 2, 1, 2, 1, 1, 1, 1, 1,    // reeks 2 — tien grafische widgets
    1, 1, 2, 1, 1, 2, 1, 1,          // reeks 3 — acht foto-gedreven widgets
    1, 1, 1, 1, 2, 2, 1, 1,          // reeks 4 — foto als ontwerpelement in glas
  ];
  return (
    <PanelProvider>
      <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
        <div className="mb-6">
          <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
          <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">SELF · Galerij</h1>
          <p className="text-sm text-muted-foreground mt-1">Drie reeksen — editorial objects, grafische widgets, foto-gedreven visuals.</p>
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
          {/* Reeks 2 — grafische widgets */}
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
          {/* Reeks 3 — foto-gedreven widgets */}
          <InRhythm />
          <Overload />
          <DeepWork />
          <TwoWorlds />
          <CountStars />
          <Breathe />
          <TwentyThreeDays />
          <Threads />
          {/* Reeks 4 — foto als ontwerpelement in glas */}
          <SteadyCard />
          <StackCard />
          <LacedRing />
          <VeiledCard />
          <HandsMedallion />
          <ThroughStrip />
          <SignalCard />
          <GalleryPolaroid />
        </MasonryGrid>
      </div>
      <ModulePanel />
    </PanelProvider>
  );
}