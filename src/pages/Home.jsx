import React from "react";
import { usePanel } from "@/lib/PanelContext";
import ConciergeWidget from "@/components/widgets/ConciergeWidget";
import AgendaWidget from "@/components/widgets/AgendaWidget";
import TasksWidget from "@/components/widgets/TasksWidget";
import ApprovalsWidget from "@/components/widgets/ApprovalsWidget";

/**
 * Home — the GIULIA OS widget center.
 * No large card panels. Instead: a modular bento grid of small glass
 * widgets in different sizes, with the Giulia Concierge as the floating
 * visual anchor. Editorial photography shows through the glass.
 */
export default function Home() {
  const { openModule } = usePanel();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="animate-fade-up">
      {/* Compact editorial greeting — not a card, just type */}
      <header className="px-1 lg:px-2 pt-2 pb-7 lg:pb-9">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
          {new Date().toLocaleDateString("nl-NL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="text-3xl lg:text-5xl font-heading font-light tracking-tight text-foreground leading-[1.05] text-balance">
          {greeting}.
        </h1>
      </header>

      {/* ── Widget bento grid ──
          Asymmetric: Concierge is the large floating anchor (col-span-8, row-span-2),
          Agenda + Tasks stack to its right, Approvals spans the bottom. */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
        style={{ gridAutoRows: "minmax(180px, auto)" }}
      >
        {/* Concierge — the visual anchor, largest, most depth */}
        <div className="lg:col-span-8 lg:row-span-2">
          <ConciergeWidget />
        </div>

        {/* Agenda — compact, top right */}
        <div className="lg:col-span-4">
          <AgendaWidget />
        </div>

        {/* Tasks — stacked, mid right */}
        <div className="lg:col-span-4">
          <TasksWidget />
        </div>

        {/* Approvals — full-width strip at the bottom */}
        <div className="lg:col-span-12">
          <ApprovalsWidget />
        </div>
      </div>

      {/* Quiet module rail — text links, not cards */}
      <nav className="mt-8 lg:mt-10 flex flex-wrap gap-x-6 gap-y-2 px-1">
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
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            {m.label}
          </button>
        ))}
      </nav>
    </div>
  );
}