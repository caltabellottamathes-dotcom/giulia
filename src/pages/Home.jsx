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
 *
 * The editorial photo is inset from the left on desktop, so the widget bento
 * (starting at the content's left edge) overhangs the photo's left edge —
 * an asymmetric, editorial composition. When a module panel opens, the
 * content layer slides right out of view, revealing the photo in full.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="relative overflow-hidden rounded-[32px] min-h-[calc(100vh-7rem)]">
      {/* Large editorial photo — inset on desktop so cards overhang its left edge */}
      <div className="absolute top-0 bottom-0 right-0 left-0 lg:left-[14%] rounded-[24px] lg:rounded-[32px] overflow-hidden">
        <img
          src={IMAGES.feetChair}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Content layer — slides right when a module panel opens */}
      <div
        className={cn(
          "relative transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
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

        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 px-1 lg:px-3"
          style={{ gridAutoRows: "minmax(180px, auto)" }}
        >
          <div className="lg:col-span-7 lg:row-span-2">
            <ConciergeWidget />
          </div>
          <div className="lg:col-span-5">
            <AgendaWidget />
          </div>
          <div className="lg:col-span-5">
            <TasksWidget />
          </div>
          <div className="lg:col-span-10 lg:col-start-2">
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