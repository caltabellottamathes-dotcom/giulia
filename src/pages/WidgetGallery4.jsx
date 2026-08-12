import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { GiuliaAdaptive, AgendaAdaptive, TasksAdaptive, ApprovalsAdaptive } from "@/components/gallery4/CoreAdaptives";
import { EmailAdaptive, WhatsAppAdaptive, ProjectsAdaptive, KnowledgeAdaptive } from "@/components/gallery4/CommsAdaptives";
import { PeopleAdaptive, DocumentsAdaptive, MemoryAdaptive, ActivityAdaptive } from "@/components/gallery4/WorkAdaptives";
import { AgentActivityAdaptive, InsightsAdaptive, TimeTrackerAdaptive, UpdatesAdaptive } from "@/components/gallery4/IntelAdaptives";

/* Widget Gallery 4 — "same design, different proportions". Each widget keeps
 * its exact current design and is reflowed into 3 ratio/size variants:
 * wide (16:9), square (1:1), tall (3:4) — branding and all info preserved. */

const WIDGETS = [
  { label: "Giulia · je dag", C: GiuliaAdaptive },
  { label: "Agenda", C: AgendaAdaptive },
  { label: "Taken", C: TasksAdaptive },
  { label: "Goedkeuringen", C: ApprovalsAdaptive },
  { label: "Email", C: EmailAdaptive },
  { label: "WhatsApp", C: WhatsAppAdaptive },
  { label: "Projecten", C: ProjectsAdaptive },
  { label: "Kennisbank", C: KnowledgeAdaptive },
  { label: "Mensen", C: PeopleAdaptive },
  { label: "Documenten", C: DocumentsAdaptive },
  { label: "Geheugen", C: MemoryAdaptive },
  { label: "Activiteit", C: ActivityAdaptive },
  { label: "Giulia · Agenten", C: AgentActivityAdaptive },
  { label: "Giulia · Inzichten", C: InsightsAdaptive },
  { label: "Tijd · Timer", C: TimeTrackerAdaptive },
  { label: "Giulia · Updates", C: UpdatesAdaptive },
];

const RATIOS = [
  { key: "wide", label: "16:9 · breed" },
  { key: "square", label: "1:1 · vierkant" },
  { key: "tall", label: "3:4 · portrait" },
];

export default function WidgetGallery4() {
  return (
    <div className="px-5 lg:px-10 py-8 space-y-14 max-w-[1400px] mx-auto">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Terug naar Home
        </Link>
        <h1 className="text-3xl font-display font-bold tracking-tight">Widget Gallery 4</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Elk widget behoudt zijn exacte huidige ontwerp — dezelfde shell, header, teller, ring, merkfoto en accent — en is herdacht in drie verhoudingen: breed, vierkant en portrait. De layout past zich per verhouding aan zodat alle informatie zichtbaar blijft.
        </p>
      </div>
      {WIDGETS.map(({ label, C }) => (
        <section key={label} className="space-y-3">
          <h2 className="text-xl font-display font-semibold">{label}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {RATIOS.map((r) => (
              <div key={r.key} className="space-y-1.5">
                <C ratio={r.key} />
                <p className="text-[11px] uppercase tracking-[0.14em] text-center text-muted-foreground">{r.label}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}