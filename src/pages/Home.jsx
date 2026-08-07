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
 * A large editorial image sits as a rounded, fully-opaque card filling the
 * dashboard (the "background" anchor). The widget bento floats on top in
 * highly-transparent glass. When a module panel opens, the entire content
 * layer slides right out of view, revealing the image in full while the
 * sliding glass panel overlaps its right half.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="relative overflow-hidden rounded-[32px] min-h-[calc(100vh-7rem)]">
      {/* ── Large editorial image card ──
          The dashboard's background anchor: full, unfaded, rounded.
          Revealed completely once the widgets slide away. */}
      <div className="absolute inset-0 rounded-[32px] overflow-hidden">
        <img
          src={IMAGES.feetChair}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* soft ivory wash top → bottom keeps the greeting legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/55" />
      </div>

      {/* ── Content layer ──
          Greeting + widget bento + module rail. Slides right out of view
          when a module panel opens, exposing the image beneath. */}
      <div
        className={cn(
          "relative transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          panelOpen
            ? "translate-x-[100vw] opacity-0"
            : "translate-x-0 opacity-100"
        )}
      >
        {/* Compact editorial greeting */}
        <header className="px-1 lg:px-2 pt-2 pb-7 lg:pb-9">
          <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 mb-2">
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

        {/* Widget bento grid — asymmetric, Concierge as large anchor */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
          style={{ gridAutoRows: "minmax(180px, auto)" }}
        >
          <div className="lg:col-span-8 lg:row-span-2">
            <ConciergeWidget />
          </div>
          <div className="lg:col-span-4">
            <AgendaWidget />
          </div>
          <div className="lg:col-span-4">
            <TasksWidget />
          </div>
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
              className="text-[12px] text-foreground/70 hover:text-foreground transition-colors tracking-wide"
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}