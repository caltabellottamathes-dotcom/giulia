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
 * glass widgets float on the left and overlap each other in a layered,
 * asymmetric composition. When a module panel opens, the dashboard slides
 * away and the photo shrinks into an oblong card in the bottom-left corner.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-my-8 min-h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Editorial photo card — wide, to the right edge when closed;
          shrinks to an oblong card in the bottom-left when a panel opens */}
      <div
        className={cn(
          "absolute overflow-hidden z-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[left,top,width,height,border-radius]",
          panelOpen
            ? "left-[4%] top-[66%] w-[68%] h-[26vh] rounded-[24px] lg:left-[3%] lg:top-[66%] lg:w-[44%] lg:h-[30%]"
            : "left-[0%] top-[0%] w-full h-[30vh] rounded-b-[28px] lg:left-[42%] lg:top-[0%] lg:w-[58%] lg:h-[100%] lg:rounded-l-[32px]"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            panelOpen ? "bg-gradient-to-tr from-charcoal/40 to-transparent opacity-100" : "bg-gradient-to-l from-transparent via-transparent to-storm/25 opacity-100"
          )}
        />
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

        {/* Widgets — float on the left, overlap each other in a layered composition */}
        <div
          className="px-5 lg:px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
          style={{ gridAutoRows: "minmax(150px, auto)" }}
        >
          {/* Concierge — large anchor, base layer */}
          <div className="lg:col-start-1 lg:col-span-7 lg:row-start-1 lg:row-span-2 relative z-30">
            <ConciergeWidget />
          </div>

          {/* Agenda — pulled up, overlaps Concierge's bottom */}
          <div className="lg:col-start-1 lg:col-span-5 lg:row-start-3 relative z-40 lg:-mt-10">
            <AgendaWidget />
          </div>

          {/* Tasks — shifted left, overlaps Agenda's right edge */}
          <div className="lg:col-start-6 lg:col-span-7 lg:row-start-3 relative z-40 lg:-mt-4 lg:-ml-6">
            <TasksWidget />
          </div>

          {/* Approvals — wide, pulled up, overlaps the row above */}
          <div className="lg:col-start-1 lg:col-span-9 lg:row-start-4 relative z-50 lg:-mt-12">
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