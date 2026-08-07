import React from "react";
import { cn } from "@/lib/utils";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import ConciergeWidget from "@/components/widgets/ConciergeWidget";
import AgendaWidget from "@/components/widgets/AgendaWidget";
import TasksWidget from "@/components/widgets/TasksWidget";
import ApprovalsWidget from "@/components/widgets/ApprovalsWidget";

/**
 * Home — the GIULIA OS widget center.
 * Full-bleed editorial photo behind a restrained, still-overlapping bento.
 * Content slides away when a module panel opens.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="relative overflow-hidden rounded-[32px] min-h-[calc(100vh-7rem)]">
      {/* Full-bleed editorial photo — edge to edge */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={IMAGES.feetChair}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* subtle scrim so glass cards read without killing the photo */}
        <div className="absolute inset-0 bg-gradient-to-br from-storm/25 via-transparent to-charcoal/15" />
      </div>

      {/* Content layer — slides right when a module panel opens */}
      <div
        className={cn(
          "relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
          panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        <header className="px-1 lg:px-3 pt-3 pb-8 lg:pb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/75 mb-3 text-shadow-soft font-medium">
            {new Date().toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="text-4xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground text-shadow-soft text-balance">
            {greeting}.
          </h1>
        </header>

        {/* Restrained bento — lined out, still lightly overlapping */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 px-1 lg:px-3"
          style={{ gridAutoRows: "minmax(180px, auto)" }}
        >
          <div className="lg:col-span-7 lg:row-span-2 relative z-10">
            <ConciergeWidget />
          </div>
          <div className="lg:col-span-5 relative z-30 lg:-ml-6">
            <AgendaWidget />
          </div>
          <div className="lg:col-span-5 relative z-20">
            <TasksWidget />
          </div>
          <div className="lg:col-span-10 lg:col-start-2 relative z-30 lg:-mt-6">
            <ApprovalsWidget />
          </div>
        </div>

        <nav className="mt-8 lg:mt-10 flex flex-wrap gap-x-6 gap-y-2 px-1 lg:px-3">
          {[
            { label: "Projecten", key: "projects" },
            { label: "Email", key: "email" },
            { label: "WhatsApp", key: "whatsapp" },
            { label: "Kennisbank", key: "knowledge" },
            { label: "Documenten", key: "documents" },
            { label: "Mensen", key: "people" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => openModule(m.key)}
              className="text-[12px] text-foreground/75 hover:text-foreground transition-colors tracking-wide text-shadow-soft font-medium"
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}