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
import AgendaDag from "@/self/widgets/editorial12/AgendaDag";
import WeekRoadmap from "@/self/widgets/editorial12/WeekRoadmap";
import ProcessFlow from "@/self/widgets/editorial12/ProcessFlow";
import Stappenplan from "@/self/widgets/editorial12/Stappenplan";
import ProjectTraject from "@/self/widgets/editorial12/ProjectTraject";
import RoutineSequence from "@/self/widgets/editorial12/RoutineSequence";
import TherapyTraject from "@/self/widgets/editorial12/TherapyTraject";
import BriefingFlow from "@/self/widgets/editorial12/BriefingFlow";
import DailyPlanSteps from "@/self/widgets/editorial13/DailyPlanSteps";
import FocusBlockSteps from "@/self/widgets/editorial13/FocusBlockSteps";
import MorningRoutineSteps from "@/self/widgets/editorial13/MorningRoutineSteps";
import TherapySessionSteps from "@/self/widgets/editorial13/TherapySessionSteps";
import ProjectMilestonesSteps from "@/self/widgets/editorial13/ProjectMilestonesSteps";
import WeeklyGoalsSteps from "@/self/widgets/editorial13/WeeklyGoalsSteps";
import CookingRecipeSteps from "@/self/widgets/editorial13/CookingRecipeSteps";
import EveningWindDownSteps from "@/self/widgets/editorial13/EveningWindDownSteps";

/** Nummer-badge — vaste index rechtsboven op elke widget voor eenvoudige selectie. */
function NumberBadge({ n }) {
  return (
    <div className="absolute right-1.5 top-1.5 z-30 h-6 min-w-[24px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums pointer-events-none select-none"
      style={{ background: "rgba(38,40,44,0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }}>
      {n}
    </div>
  );
}

/**
 * SelfGallery — standalone pagina met alle SELF widget-reeksen.
 * Elke widget krijgt een nummer (rechtsboven) voor snelle selectie.
 * Reeks 1: 8 editorial · Reeks 2: 10 grafisch · Reeks 3: 8 foto-gedreven
 * Reeks 4: 8 foto-in-glas · Reeks 5: 8 ultieme data · Reeks 6: 10 grafisch
 * Reeks 7: 10 foto+glas · Reeks 8: 10 licht · Reeks 9: 10 omgekeerd
 * Reeks 10: 12 gevuld · Reeks 11: 8 reeks-3-stijl · Reeks 12: 8 interactieve tijdlijnen
 */
export default function SelfGallery() {
  // width spans: 1 = smal, 2 = breed (moet exact gelijk lopen aan widgets-array)
  const spans = [
    1, 2, 1, 2, 1, 2, 2, 2,          // reeks 1
    2, 1, 2, 1, 2, 1, 1, 1, 1, 1,    // reeks 2
    1, 1, 2, 1, 1, 2, 1, 1,          // reeks 3
    1, 1, 1, 1, 2, 2, 1, 1,          // reeks 4
    2, 1, 2, 1, 1, 1, 1, 1,          // reeks 5
    2, 2, 1, 1, 1, 1, 2, 1, 1, 1,    // reeks 6
    2, 1, 2, 1, 1, 1, 1, 1, 2, 1,    // reeks 7
    2, 1, 2, 1, 1, 1, 1, 1, 2, 1,    // reeks 8
    2, 1, 2, 1, 1, 1, 1, 1, 2, 1,    // reeks 9
    2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, // reeks 10
    1, 1, 2, 1, 1, 2, 1, 1,          // reeks 11
    2, 2, 1, 1, 2, 1, 1, 2,          // reeks 12 — interactieve tijdlijnen
    2, 1, 1, 1, 2, 1, 1, 2,          // reeks 13 — afvinkbare stappenplannen
  ];

  const widgets = [
    // Reeks 1
    <DailyStateEditorial />, <RoutinesEditorial />, <WakeEditorial />, <TherapyEditorial />,
    <JournalEditorial />, <PersonalDevelopmentEditorial />, <PersonalTimeEditorial />, <SelfInsightsEditorial />,
    // Reeks 2
    <EnergyLiveLine />, <CapacityDonut />, <WeeklyRhythm />, <CrossDomainConstellation />,
    <ApprovalFlow />, <DayAgendaStack />, <SleepTimeline />, <SocialOrbit />,
    <SystemHeartbeat />, <CountdownVertical />,
    // Reeks 3
    <InRhythm />, <Overload />, <DeepWork />, <TwoWorlds />,
    <CountStars />, <Breathe />, <TwentyThreeDays />, <Threads />,
    // Reeks 4
    <SteadyCard />, <StackCard />, <LacedRing />, <VeiledCard />,
    <HandsMedallion />, <ThroughStrip />, <SignalCard />, <GalleryPolaroid />,
    // Reeks 5
    <AgendaTimelineUltimate />, <TaskPulseUltimate />, <EmailFlowUltimate />, <PeopleOrbitUltimate />,
    <ProjectProgressUltimate />, <FoodBudgetUltimate />, <EnergyLiveUltimate />, <ApprovalQueueUltimate />,
    // Reeks 6
    <LiveEnergyCurve />, <FocusVsLife />, <CapacityArc />, <DomainConstellation />,
    <MilestoneJourney />, <WeekGrid />, <AgentFlow />, <SystemPulse />,
    <ApprovalStack />, <CrossDomainFlow />,
    // Reeks 7
    <AgendaPhotoCard />, <TasksPhotoCard />, <EmailPhotoCard />, <PeoplePhotoCard />,
    <ProjectsPhotoCard />, <FoodPhotoCard />, <EnergyPhotoCard />, <ApprovalsPhotoCard />,
    <SocialPhotoCard />, <GiuliaPhotoCard />,
    // Reeks 8
    <AgendaLight />, <TasksLight />, <EmailLight />, <PeopleLight />,
    <ProjectsLight />, <FoodLight />, <EnergyLight />, <ApprovalsLight />,
    <SocialLight />, <GiuliaLight />,
    // Reeks 9
    <AgendaGlass />, <TasksGlass />, <EmailGlass />, <PeopleGlass />,
    <ProjectsGlass />, <FoodGlass />, <EnergyGlass />, <ApprovalsGlass />,
    <SocialGlass />, <GiuliaGlass />,
    // Reeks 10
    <WhatsAppFilled />, <KnowledgeFilled />, <DocumentsFilled />, <NotificationsFilled />,
    <ActivityFilled />, <MemoryFilled />, <InsightsFilled />, <TimeTrackerFilled />,
    <AgentsFilled />, <UpdatesFilled />, <WantsToKnowFilled />, <DevelopmentFilled />,
    // Reeks 11
    <Risen />, <Spend />, <Ticking />, <PeopleSeam />,
    <RoutineStars />, <Reflect />, <SessionRings />, <GoalThreads />,
    // Reeks 12 — interactieve tijdlijnen (glas-op-foto)
    <AgendaDag />, <WeekRoadmap />, <ProcessFlow />, <Stappenplan />,
    <ProjectTraject />, <RoutineSequence />, <TherapyTraject />, <BriefingFlow />,
    // Reeks 13 — afvinkbare stappenplannen (glas-op-foto, echte interactie)
    <DailyPlanSteps />, <FocusBlockSteps />, <MorningRoutineSteps />, <TherapySessionSteps />,
    <ProjectMilestonesSteps />, <WeeklyGoalsSteps />, <CookingRecipeSteps />, <EveningWindDownSteps />,
  ];

  return (
    <PanelProvider>
      <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
        <div className="mb-6">
          <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
          <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">SELF · Galerij</h1>
          <p className="text-sm text-muted-foreground mt-1">{widgets.length} widgets genummerd 1–{widgets.length} · dertien reeksen. Reeks 13: afvinkbare stappenplannen & briefing met sluiten.</p>
        </div>

        <MasonryGrid spans={spans} gap={16}>
          {widgets.map((w, i) => (
            <div key={i} className="relative">
              {w}
              <NumberBadge n={i + 1} />
            </div>
          ))}
        </MasonryGrid>
      </div>
      <ModulePanel />
    </PanelProvider>
  );
}