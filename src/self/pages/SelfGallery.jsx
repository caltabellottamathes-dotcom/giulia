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
import AgendaTimelineUltimate from "@/self/widgets/editorial5/AgendaTimelineUltimate";
import TaskPulseUltimate from "@/self/widgets/editorial5/TaskPulseUltimate";
import EmailFlowUltimate from "@/self/widgets/editorial5/EmailFlowUltimate";
import PeopleOrbitUltimate from "@/self/widgets/editorial5/PeopleOrbitUltimate";
import ProjectProgressUltimate from "@/self/widgets/editorial5/ProjectProgressUltimate";
import FoodBudgetUltimate from "@/self/widgets/editorial5/FoodBudgetUltimate";
import EnergyLiveUltimate from "@/self/widgets/editorial5/EnergyLiveUltimate";
import ApprovalQueueUltimate from "@/self/widgets/editorial5/ApprovalQueueUltimate";
import LiveEnergyCurve from "@/self/widgets/editorial6/LiveEnergyCurve";
import FocusVsLife from "@/self/widgets/editorial6/FocusVsLife";
import CapacityArc from "@/self/widgets/editorial6/CapacityArc";
import DomainConstellation from "@/self/widgets/editorial6/DomainConstellation";
import MilestoneJourney from "@/self/widgets/editorial6/MilestoneJourney";
import WeekGrid from "@/self/widgets/editorial6/WeekGrid";
import AgentFlow from "@/self/widgets/editorial6/AgentFlow";
import SystemPulse from "@/self/widgets/editorial6/SystemPulse";
import ApprovalStack from "@/self/widgets/editorial6/ApprovalStack";
import CrossDomainFlow from "@/self/widgets/editorial6/CrossDomainFlow";
import AgendaPhotoCard from "@/self/widgets/editorial7/AgendaPhotoCard";
import TasksPhotoCard from "@/self/widgets/editorial7/TasksPhotoCard";
import EmailPhotoCard from "@/self/widgets/editorial7/EmailPhotoCard";
import PeoplePhotoCard from "@/self/widgets/editorial7/PeoplePhotoCard";
import ProjectsPhotoCard from "@/self/widgets/editorial7/ProjectsPhotoCard";
import FoodPhotoCard from "@/self/widgets/editorial7/FoodPhotoCard";
import EnergyPhotoCard from "@/self/widgets/editorial7/EnergyPhotoCard";
import ApprovalsPhotoCard from "@/self/widgets/editorial7/ApprovalsPhotoCard";
import SocialPhotoCard from "@/self/widgets/editorial7/SocialPhotoCard";
import GiuliaPhotoCard from "@/self/widgets/editorial7/GiuliaPhotoCard";
import AgendaLight from "@/self/widgets/editorial8/AgendaLight";
import TasksLight from "@/self/widgets/editorial8/TasksLight";
import EmailLight from "@/self/widgets/editorial8/EmailLight";
import PeopleLight from "@/self/widgets/editorial8/PeopleLight";
import ProjectsLight from "@/self/widgets/editorial8/ProjectsLight";
import FoodLight from "@/self/widgets/editorial8/FoodLight";
import EnergyLight from "@/self/widgets/editorial8/EnergyLight";
import ApprovalsLight from "@/self/widgets/editorial8/ApprovalsLight";
import SocialLight from "@/self/widgets/editorial8/SocialLight";
import GiuliaLight from "@/self/widgets/editorial8/GiuliaLight";
import AgendaGlass from "@/self/widgets/editorial9/AgendaGlass";
import TasksGlass from "@/self/widgets/editorial9/TasksGlass";
import EmailGlass from "@/self/widgets/editorial9/EmailGlass";
import PeopleGlass from "@/self/widgets/editorial9/PeopleGlass";
import ProjectsGlass from "@/self/widgets/editorial9/ProjectsGlass";
import FoodGlass from "@/self/widgets/editorial9/FoodGlass";
import EnergyGlass from "@/self/widgets/editorial9/EnergyGlass";
import ApprovalsGlass from "@/self/widgets/editorial9/ApprovalsGlass";
import SocialGlass from "@/self/widgets/editorial9/SocialGlass";
import GiuliaGlass from "@/self/widgets/editorial9/GiuliaGlass";
import WhatsAppFilled from "@/self/widgets/editorial10/WhatsAppFilled";
import KnowledgeFilled from "@/self/widgets/editorial10/KnowledgeFilled";
import DocumentsFilled from "@/self/widgets/editorial10/DocumentsFilled";
import NotificationsFilled from "@/self/widgets/editorial10/NotificationsFilled";
import ActivityFilled from "@/self/widgets/editorial10/ActivityFilled";
import MemoryFilled from "@/self/widgets/editorial10/MemoryFilled";
import InsightsFilled from "@/self/widgets/editorial10/InsightsFilled";
import TimeTrackerFilled from "@/self/widgets/editorial10/TimeTrackerFilled";
import AgentsFilled from "@/self/widgets/editorial10/AgentsFilled";
import UpdatesFilled from "@/self/widgets/editorial10/UpdatesFilled";
import WantsToKnowFilled from "@/self/widgets/editorial10/WantsToKnowFilled";
import DevelopmentFilled from "@/self/widgets/editorial10/DevelopmentFilled";
import Risen from "@/self/widgets/editorial11/Risen";
import Spend from "@/self/widgets/editorial11/Spend";
import Ticking from "@/self/widgets/editorial11/Ticking";
import PeopleSeam from "@/self/widgets/editorial11/PeopleSeam";
import RoutineStars from "@/self/widgets/editorial11/RoutineStars";
import Reflect from "@/self/widgets/editorial11/Reflect";
import SessionRings from "@/self/widgets/editorial11/SessionRings";
import GoalThreads from "@/self/widgets/editorial11/GoalThreads";

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
    2, 1, 2, 1, 1, 1, 1, 1,          // reeks 5 — ultieme data-widgets
    2, 2, 1, 1, 1, 1, 2, 1, 1, 1,      // reeks 6 — tien nieuwe grafische widgets
    2, 1, 2, 1, 1, 1, 1, 1, 2, 1,        // reeks 7 — grote foto + glas-kaart
    2, 1, 2, 1, 1, 1, 1, 1, 2, 1,        // reeks 8 — lichte variant
    2, 1, 2, 1, 1, 1, 1, 1, 2, 1,        // reeks 9 — glas-groot + foto-klein
    2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1,    // reeks 10 — andere OS-functies
    1, 1, 2, 1, 1, 2, 1, 1,                  // reeks 11 — reeks 3-stijl, andere functies
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
          {/* Reeks 5 — ultieme data-widgets (echte OS-data + editorial ontwerp) */}
          <AgendaTimelineUltimate />
          <TaskPulseUltimate />
          <EmailFlowUltimate />
          <PeopleOrbitUltimate />
          <ProjectProgressUltimate />
          <FoodBudgetUltimate />
          <EnergyLiveUltimate />
          <ApprovalQueueUltimate />
          {/* Reeks 6 — tien nieuwe grafische widgets (verschillende formaten) */}
          <LiveEnergyCurve />
          <FocusVsLife />
          <CapacityArc />
          <DomainConstellation />
          <MilestoneJourney />
          <WeekGrid />
          <AgentFlow />
          <SystemPulse />
          <ApprovalStack />
          <CrossDomainFlow />
          {/* Reeks 7 — grote foto + glas-kaart over elkaar, alle kernfuncties van Giulia */}
          <AgendaPhotoCard />
          <TasksPhotoCard />
          <EmailPhotoCard />
          <PeoplePhotoCard />
          <ProjectsPhotoCard />
          <FoodPhotoCard />
          <EnergyPhotoCard />
          <ApprovalsPhotoCard />
          <SocialPhotoCard />
          <GiuliaPhotoCard />
          {/* Reeks 8 — lichte variant: grote foto + zacht afgerond wit glas, zachter en minder technisch */}
          <AgendaLight />
          <TasksLight />
          <EmailLight />
          <PeopleLight />
          <ProjectsLight />
          <FoodLight />
          <EnergyLight />
          <ApprovalsLight />
          <SocialLight />
          <GiuliaLight />
          {/* Reeks 9 — omgekeerd: grote glas-kaart + kleine foto-kaart er bovenop */}
          <AgendaGlass />
          <TasksGlass />
          <EmailGlass />
          <PeopleGlass />
          <ProjectsGlass />
          <FoodGlass />
          <EnergyGlass />
          <ApprovalsGlass />
          <SocialGlass />
          <GiuliaGlass />
          {/* Reeks 10 — gevuld glas + foto-klein: andere OS-functies (WhatsApp, Kennis, Bestanden, etc.) */}
          <WhatsAppFilled />
          <KnowledgeFilled />
          <DocumentsFilled />
          <NotificationsFilled />
          <ActivityFilled />
          <MemoryFilled />
          <InsightsFilled />
          <TimeTrackerFilled />
          <AgentsFilled />
          <UpdatesFilled />
          <WantsToKnowFilled />
          <DevelopmentFilled />
          {/* Reeks 11 — reeks 3-stijl (full-bleed foto + gradient + grafisch element), andere functies */}
          <Risen />
          <Spend />
          <Ticking />
          <PeopleSeam />
          <RoutineStars />
          <Reflect />
          <SessionRings />
          <GoalThreads />
        </MasonryGrid>
      </div>
      <ModulePanel />
    </PanelProvider>
  );
}