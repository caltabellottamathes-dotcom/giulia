import React from "react";
import { IMAGES } from "@/lib/images";
import LiquidPanel from "@/components/glass/LiquidPanel";
import Widget from "@/components/widgets/Widget";
import { ProgressBar } from "@/components/widgets/WidgetVisuals";
import { usePanel } from "@/lib/PanelContext";
import { mockProjects, mockTasks, mockEvents, mockApprovals } from "@/lib/mockData";
import {
  Calendar, Sparkles, ClipboardCheck, Briefcase, Search, Mail,
  CheckSquare, MessageCircle,
} from "lucide-react";

const consoleActions = [
  { key: "chat", icon: Search, label: "Vraag" },
  { key: "email", icon: Mail, label: "Email" },
  { key: "tasks", icon: CheckSquare, label: "Taken" },
  { key: "agenda", icon: Calendar, label: "Agenda" },
  { key: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { key: "projects", icon: Briefcase, label: "Projecten" },
];

/**
 * Today — the entry point, not a home screen. A console panel, not a
 * marketing hero: system status on the left, active profiles on the right.
 * Below it, only what needs attention — as designed widgets.
 */
export default function Home() {
  const { openModule } = usePanel();

  const todayEvents = mockEvents.filter((e) => e.start.startsWith("2026-08-07"));
  const overdueTask = mockTasks.find((t) => t.status === "overdue");
  const pendingApproval = mockApprovals.find((a) => a.status === "pending");
  const overdueProject = mockProjects.find((p) => p.id === overdueTask?.project_id);
  const focusProject = overdueProject || mockProjects[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  const status = overdueProject
    ? `${overdueProject.title} vraagt aandacht.`
    : pendingApproval
    ? `${pendingApproval.target} wacht op een antwoord.`
    : "Niets vraagt om aandacht.";

  return (
    <div className="space-y-14 animate-fade-up">
      {/* Console panel — system status + active profiles, not a photo hero */}
      <LiquidPanel bgImage={IMAGES.sittingChairs} className="float-shadow" contentClassName="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          <div className="px-8 lg:px-12 py-10 lg:py-12">
            <p className="text-kicker mb-3">Privé-besturingssysteem</p>
            <h1 className="font-graphic font-bold text-4xl lg:text-6xl tracking-[-0.04em] leading-[0.95] mb-4 text-balance">
              {greeting}.
            </h1>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-md">{status}</p>
          </div>
          <div className="px-8 lg:px-12 py-10 lg:py-12 lg:border-l border-white/10">
            <p className="text-kicker mb-4">Actieve profielen</p>
            <div className="grid grid-cols-3 gap-3 max-w-xs">
              {consoleActions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => openModule(action.key)}
                  className="glass-1 rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 hover:scale-[1.04] transition-transform duration-300"
                >
                  <action.icon className="h-4 w-4 text-foreground/80" />
                  <span className="text-[9px] text-foreground/60 tracking-wide">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
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