import React from "react";
import { IMAGES } from "@/lib/images";
import LiquidPanel from "@/components/glass/LiquidPanel";
import Widget from "@/components/widgets/Widget";
import { ProgressBar } from "@/components/widgets/WidgetVisuals";
import { usePanel } from "@/lib/PanelContext";
import { mockProjects, mockTasks, mockEvents, mockApprovals } from "@/lib/mockData";
import { Calendar, Sparkles, ClipboardCheck, Briefcase } from "lucide-react";

/**
 * Today — the entry point, not a home screen. A living briefing answering
 * "what deserves attention right now": short prose fragments, calm and
 * fixed (not a manipulable canvas). Below it, exactly the items that need
 * attention are surfaced as designed widgets — never a dashboard of counts.
 */
export default function Home() {
  const { openModule } = usePanel();

  const todayEvents = mockEvents.filter((e) => e.start.startsWith("2026-08-07"));
  const todayTasks = mockTasks.filter((t) => t.status === "today");
  const overdueTask = mockTasks.find((t) => t.status === "overdue");
  const pendingApproval = mockApprovals.find((a) => a.status === "pending");
  const overdueProject = mockProjects.find((p) => p.id === overdueTask?.project_id);
  const focusProject = overdueProject || mockProjects[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  const fragments = [
    overdueProject && `${overdueProject.title} vraagt je aandacht.`,
    pendingApproval && `${pendingApproval.target} wacht op een antwoord.`,
    todayEvents.length > 0 &&
      `Je hebt ${todayEvents.length} ${todayEvents.length === 1 ? "afspraak" : "afspraken"} vandaag.`,
    todayTasks.length > 0 && `${todayTasks.length} taken staan open voor vandaag.`,
  ].filter(Boolean);

  return (
    <div className="space-y-14 animate-fade-up">
      {/* Hero — graphic register: huge tight headline + tiny wide-tracking kicker,
          set over real photography so the liquid glass has something to refract. */}
      <LiquidPanel bgImage={IMAGES.sittingChairs} className="float-shadow" contentClassName="px-8 lg:px-14 py-14 lg:py-20">
        <p className="text-kicker mb-4">
          {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-graphic font-bold text-5xl lg:text-7xl tracking-[-0.04em] leading-[0.95] mb-8 text-balance">
          {greeting}.
        </h1>
        <div className="space-y-2.5 max-w-xl">
          <p className="font-editorial text-lg lg:text-xl text-foreground/85 leading-relaxed">Vandaag</p>
          {fragments.length > 0 ? (
            fragments.map((line, i) => (
              <p key={i} className="font-editorial text-lg lg:text-xl text-foreground/70 leading-relaxed">
                — {line}
              </p>
            ))
          ) : (
            <p className="font-editorial text-lg lg:text-xl text-foreground/70 leading-relaxed">
              — Niets vraagt om aandacht. Rustige dag.
            </p>
          )}
        </div>
      </LiquidPanel>

      {/* Vraagt aandacht — designed widgets, five-part anatomy, one per material */}
      <section>
        <p className="text-kicker mb-5">Vraagt aandacht</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayEvents[0] && (
            <Widget
              icon={Calendar}
              material="calendar"
              headline={todayEvents[0].title}
              subtext={todayEvents[0].location}
              status={new Date(todayEvents[0].start).toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              visual={<ProgressBar value={35} />}
              onClick={() => openModule("agenda")}
            />
          )}
          {focusProject && (
            <Widget
              icon={Briefcase}
              material="projects"
              headline={focusProject.title}
              subtext={focusProject.next_milestone}
              status={`${focusProject.progress}%`}
              visual={<ProgressBar value={focusProject.progress} />}
              onClick={() => openModule("projects")}
            />
          )}
          {pendingApproval && (
            <Widget
              icon={ClipboardCheck}
              material="communication"
              headline={pendingApproval.description}
              subtext={pendingApproval.target}
              status="Ter goedkeuring"
              onClick={() => openModule("approvals")}
            />
          )}
          <Widget
            icon={Sparkles}
            material="ideas"
            headline="Wireframe review verplaatsen"
            subtext="Botst met de fotografie shoot"
            status="Voorstel"
            onClick={() => openModule("approvals")}
          />
        </div>
      </section>
    </div>
  );
}