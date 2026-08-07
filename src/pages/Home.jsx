import React from "react";
import { cn } from "@/lib/utils";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import ConciergeWidget from "@/components/widgets/ConciergeWidget";
import AgendaWidget from "@/components/widgets/AgendaWidget";
import TasksWidget from "@/components/widgets/TasksWidget";
import ApprovalsWidget from "@/components/widgets/ApprovalsWidget";

/**
 * Home — the GIULIA OS widget center, mobile-first.
 * The editorial photo is a large, wide card anchored to the RIGHT edge;
 * the glass widgets float on the left, overlapping the photo's left edge
 * in an asymmetric composition.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-my-8 min-h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Mobile: editorial photo banner at the top */}
      <div className="lg:hidden relative h-[30vh] overflow-hidden rounded-b-[28px] z-0">
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-transparent to-background/30" />
      </div>

      {/* Desktop: large wide photo card anchored to the right edge */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] overflow-hidden z-0 lg:rounded-l-[32px]">
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-storm/25" />
      </div>

      {/* Content layer — slides right when a module panel opens */}
      <div
        className={cn(
          "relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
          panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        <header className="px-5 lg:px-10 pt-8 lg:pt-10 pb-6 lg:pb-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/80 mb-3 font-semibold">
            {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground text-balance">
            {greeting}.
          </h1>
        </header>

        {/* Widgets — float on the left, overlapping the photo's left edge */}
        <div
          className="px-5 lg:px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
          style={{ gridAutoRows: "minmax(150px, auto)" }}
        >
          {/* Concierge — large anchor, top-left; right edge floats over the photo */}
          <div className="lg:col-start-1 lg:col-span-7 lg:row-start-1 lg:row-span-2 relative z-30">
            <ConciergeWidget />
          </div>

          {/* Agenda — narrower, floats over the photo */}
          <div className="lg:col-start-1 lg:col-span-6 lg:row-start-3 relative z-30">
            <AgendaWidget />
          </div>

          {/* Tasks — right-aligned, fully over the photo */}
          <div className="lg:col-start-7 lg:col-span-6 lg:row-start-3 relative z-30">
            <TasksWidget />
          </div>

          {/* Approvals — wide, overlaps deep into the photo */}
          <div className="lg:col-start-1 lg:col-span-9 lg:row-start-4 relative z-30">
            <ApprovalsWidget />
          </div>
        </div>

        <nav className="px-5 lg:px-10 pb-8 flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: "Projecten", key: "projects" },
            { label: "Email", key: "email" },
            { label: "WhatsApp", key: "whatsapp" },
            { label: "Kennisbank", key: "knowledge" },
            { label: "Documenten", key: "documents" },
            { label: "Mensen", key: "people" },
          ].map((m) => (
            <button key={m.key} onClick={() => openModule(m.key)} className="text-[12px] text-foreground/75 hover:text-foreground transition-colors tracking-wide font-medium">
              {m.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}