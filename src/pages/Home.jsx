import React, { useState, useEffect } from "react";
import { usePanel } from "@/lib/PanelContext";
import ConciergeWidget from "@/components/widgets/ConciergeWidget";
import AgendaWidget from "@/components/widgets/AgendaWidget";
import TasksWidget from "@/components/widgets/TasksWidget";
import ApprovalsWidget from "@/components/widgets/ApprovalsWidget";
import SpotlightWidget from "@/components/widgets/SpotlightWidget";

/**
 * Home — the GIULIA OS desktop. A live OS status line, then an overlapping
 * grey-glass widget bento with real depth. Less text, more image & color.
 */
export default function Home() {
  const { openModule } = usePanel();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="animate-fade-up">
      {/* ── OS status line — graphic, minimal, no website hero ── */}
      <header className="flex items-end justify-between px-1 pb-7 lg:pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground/70 mb-1.5">
            {date}
          </p>
          <h1 className="font-display font-light text-[44px] lg:text-[72px] leading-[0.86] tracking-tight tabular-nums">
            {time}
          </h1>
        </div>
        <div className="text-right hidden sm:flex flex-col items-end">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground/70 mb-1.5">
            Giulia
          </p>
          <p className="text-sm text-foreground/85">3 acties klaar</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-sienna animate-pulse-soft" />
            systeem actief
          </div>
        </div>
      </header>

      {/* ── Overlapping widget bento ──
          Concierge is the anchor (col 1-7, 2 rows). Agenda + Tasks stack to
          its right and overlap the edge. Spotlight + Approvals overlap the
          bottom row. z-index creates layered depth. */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
        style={{ gridAutoRows: "minmax(200px, auto)" }}
      >
        <div className="lg:col-span-7 lg:row-span-2 z-20 animate-fade-up">
          <ConciergeWidget />
        </div>
        <div
          className="lg:col-span-5 lg:-ml-8 z-30 animate-fade-up"
          style={{ animationDelay: "110ms" }}
        >
          <AgendaWidget />
        </div>
        <div
          className="lg:col-span-5 lg:-ml-8 z-30 animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          <TasksWidget />
        </div>
        <div
          className="lg:col-span-7 lg:-mt-10 z-30 animate-fade-up"
          style={{ animationDelay: "260ms" }}
        >
          <SpotlightWidget />
        </div>
        <div
          className="lg:col-span-5 lg:-mt-10 lg:-ml-8 z-40 animate-fade-up"
          style={{ animationDelay: "320ms" }}
        >
          <ApprovalsWidget />
        </div>
      </div>

      {/* Quiet module rail — text links, no cards */}
      <nav className="mt-9 lg:mt-11 flex flex-wrap gap-x-7 gap-y-2 px-1">
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