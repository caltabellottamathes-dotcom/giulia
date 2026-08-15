import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WIDGETS as REG } from "@/lib/widgetRegistry";
import { WidgetThemeProvider } from "@/lib/WidgetThemeContext";

import AgendaDesigns from "@/system/components/gallery/gallery3/AgendaDesigns";
import TasksDesigns from "@/system/components/gallery/gallery3/TasksDesigns";
import ApprovalsDesigns from "@/system/components/gallery/gallery3/ApprovalsDesigns";
import EmailDesigns from "@/system/components/gallery/gallery3/EmailDesigns";
import WhatsAppDesigns from "@/system/components/gallery/gallery3/WhatsAppDesigns";
import ProjectsDesigns from "@/system/components/gallery/gallery3/ProjectsDesigns";
import KnowledgeDesigns from "@/system/components/gallery/gallery3/KnowledgeDesigns";
import PeopleDesigns from "@/system/components/gallery/gallery3/PeopleDesigns";
import DocumentsDesigns from "@/system/components/gallery/gallery3/DocumentsDesigns";
import MemoryDesigns from "@/system/components/gallery/gallery3/MemoryDesigns";
import InsightsDesigns from "@/system/components/gallery/gallery3/InsightsDesigns";
import ActivityDesigns from "@/system/components/gallery/gallery3/ActivityDesigns";
import AgentsDesigns from "@/system/components/gallery/gallery3/AgentsDesigns";
import TimeTrackerDesigns from "@/system/components/gallery/gallery3/TimeTrackerDesigns";
import GiuliaDesigns from "@/system/components/gallery/gallery3/GiuliaDesigns";
import UpdatesDesigns from "@/system/components/gallery/gallery3/UpdatesDesigns";

/* Per widget: ontwerp 1 = huidige goedgekeurde widget (live), ontwerp 2 & 3 =
 * custom ontwerpen speciaal voor die functie (eigen layout, verhouding,
 * beweging) — gebaseerd op analyse van widget + ModulePanel + pagina. */
const DESIGNS = {
  agenda: AgendaDesigns, tasks: TasksDesigns, approvals: ApprovalsDesigns,
  email: EmailDesigns, whatsapp: WhatsAppDesigns, projects: ProjectsDesigns,
  knowledge: KnowledgeDesigns, people: PeopleDesigns, documents: DocumentsDesigns,
  memory: MemoryDesigns, insights: InsightsDesigns, activity: ActivityDesigns,
  agentactivity: AgentsDesigns, timetracker: TimeTrackerDesigns,
  giulia: GiuliaDesigns, updates: UpdatesDesigns,
};

const ORDER = Object.values(REG)
  .filter((w) => w.type !== "concierge" && DESIGNS[w.type])
  .sort((a, b) => a.label.localeCompare(b.label, "nl"));

function Slot({ caption, children }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="w-full">{children}</div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-center text-muted-foreground">{caption}</p>
    </div>
  );
}

export default function WidgetGallery3() {
  return (
    <div className="px-5 lg:px-10 py-8 space-y-14 max-w-[1400px] mx-auto">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Terug naar Home
        </Link>
        <h1 className="text-3xl font-display font-bold tracking-tight">Widget Gallery 3</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Per widget drie ontwerpen — links de huidige widget (live), rechts twee custom ontwerpen, elk met een eigen layout, verhouding en beweging, speciaal voor die functie ontworpen.
        </p>
      </div>
      {ORDER.map((w) => {
        const Real = w.Component;
        const D = DESIGNS[w.type];
        const Design2 = D?.Design2, Design3 = D?.Design3;
        return (
          <section key={w.type} className="space-y-3">
            <h2 className="text-xl font-display font-semibold">{w.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              <Slot caption="1 · Huidig (live)">
                <WidgetThemeProvider value={{ theme: "glass", color: "", opacity: 1, blur: 0 }}>
                  <Real />
                </WidgetThemeProvider>
              </Slot>
              {Design2 && <Slot caption="2 · Nieuw ontwerp"><Design2 /></Slot>}
              {Design3 && <Slot caption="3 · Nieuw ontwerp"><Design3 /></Slot>}
            </div>
          </section>
        );
      })}
    </div>
  );
}