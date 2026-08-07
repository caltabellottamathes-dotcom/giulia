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
 * Full-bleed editorial photo to the viewport edges; an asymmetric but
 * ALIGNED bento (no staggering); content slides away when a panel opens.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-my-8 min-h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Full-bleed editorial photo — edge to edge */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.feetChair}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-storm/35 via-storm/10 to-charcoal/25" />
      </div>

      {/* Content layer — slides right when a module panel opens */}
      <div
        className={cn(
          "relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
          panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        <header className="px-5 lg:px-10 pt-8 lg:pt-10 pb-6 lg:pb-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/80 mb-3 text-shadow-soft font-semibold">
            {new Date().toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground text-shadow-soft text-balance">
            {greeting}.
          </h1>
        </header>

        {/* Asymmetric, aligned bento — no offsets, just varied spans */}
        <div
          className="px-5 lg:px-10 pb-8 lg:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
          style={{ gridAutoRows: "minmax(160px, auto)" }}
        >
          <div className="lg:col-span-7 lg:row-span-2 relative z-10">
            <ConciergeWidget />
          </div>
          <div className="lg:col-span-5 relative z-20">
            <AgendaWidget />
          </div>
          <div className="lg:col-span-5 relative z-20">
            <TasksWidget />
          </div>
          <div className="lg:col-span-12 relative z-20">
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