import React, { useState } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { MODULES } from "@/lib/moduleRegistry";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, LayoutGrid, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AgendaPreview from "@/components/panels/previews/AgendaPreview";
import TasksPreview from "@/components/panels/previews/TasksPreview";
import ProjectsPreview from "@/components/panels/previews/ProjectsPreview";
import EmailPreview from "@/components/panels/previews/EmailPreview";
import WhatsAppPreview from "@/components/panels/previews/WhatsAppPreview";
import PeoplePreview from "@/components/panels/previews/PeoplePreview";
import ApprovalsPreview from "@/components/panels/previews/ApprovalsPreview";
import ActivityPreview from "@/components/panels/previews/ActivityPreview";
import InsightsPreview from "@/components/panels/previews/InsightsPreview";
import MemoryPreview from "@/components/panels/previews/MemoryPreview";
import KnowledgePreview from "@/components/panels/previews/KnowledgePreview";
import DocumentsPreview from "@/components/panels/previews/DocumentsPreview";
import AgentsPreview from "@/components/panels/previews/AgentsPreview";
import TimeTrackerPreview from "@/components/panels/previews/TimeTrackerPreview";
import { AnimatedPicto } from "@/components/panels/previews/previewParts";

/** LEVEL 02 quick-context previews — one per data module. Modules without
 *  a preview (chat, voice, settings, profile, integrations) keep the full
 *  component, since those surfaces are themselves the interaction. */
const PREVIEWS = {
  agenda: AgendaPreview, tasks: TasksPreview, projects: ProjectsPreview,
  email: EmailPreview, whatsapp: WhatsAppPreview, people: PeoplePreview,
  approvals: ApprovalsPreview, activity: ActivityPreview, insights: InsightsPreview,
  memory: MemoryPreview, knowledge: KnowledgePreview, documents: DocumentsPreview,
  agents: AgentsPreview,
  timetracker: TimeTrackerPreview,
};

/**
 * The ONE sliding glass panel used for every module. The content determines
 * the width (panelWidth per module). The header carries a clear
 * "Add widget to dashboard" action when a widget exists for this module.
 */
const MODULE_ACCENT = {
  agenda: "hsl(var(--sand))", projects: "hsl(var(--olive))", tasks: "hsl(var(--charcoal))",
  email: "hsl(var(--blue-grey))", whatsapp: "hsl(var(--sand))", knowledge: "hsl(var(--olive))",
  documents: "hsl(var(--charcoal))", people: "hsl(var(--blue-grey))", approvals: "hsl(var(--olive))",
  activity: "hsl(var(--sand))", memory: "hsl(var(--charcoal))", insights: "hsl(var(--sand))",
  chat: "hsl(var(--olive))", voice: "hsl(var(--charcoal))",
  agents: "hsl(var(--olive))",
  timetracker: "hsl(var(--olive))",
  updates: "hsl(var(--sand))",
  goodmorning: "hsl(var(--sand))",
};

// Modules without a widget keep an editorial photo; modules WITH a widget
// inherit the widget's branding image (WIDGETS[module].image) so the panel
// header, the widget and the page hero all share one photo.
const MODULE_IMAGE = {
  chat: IMAGES.portraitBootFace,
  voice: IMAGES.portraitBootFace,
  settings: IMAGES.walkingChairs,
  profile: IMAGES.portraitBootHands,
  integrations: IMAGES.sittingChairs,
  agents: IMAGES.feetChair,
};

const MODULE_ROUTE = {
  agenda: "/agenda", projects: "/projects", tasks: "/tasks", email: "/email",
  whatsapp: "/whatsapp", knowledge: "/knowledge", documents: "/documents",
  people: "/people", chat: "/chat", voice: "/voice", approvals: "/approvals",
  activity: "/activity", memory: "/memory", integrations: "/integrations",
  settings: "/settings", profile: "/profile", insights: "/insights",
  agents: "/agents",
  timetracker: "/timetracker",
  updates: "/updates",
  goodmorning: "/wake",
};

// Topic-related subtitles per module — replaces the bare label so the panel
// header isn't a duplicate of the title shown on the dashboard.
const MODULE_TOPIC = {
  agenda: "Vandaag en wat eraan komt",
  tasks: "Wat nu op je ligt",
  projects: "Werk dat loopt",
  email: "Je inbox op orde",
  whatsapp: "Gesprekken die wachten",
  people: "Wie je kent en waarom",
  approvals: "Wacht op jouw ja",
  activity: "Wat Giulia deed",
  insights: "Signalen die ertoe doen",
  memory: "Wat Giulia onthoudt",
  knowledge: "Je verzamelde kennis",
  documents: "Bestanden bij de hand",
  agents: "Giulia's agents aan het werk",
  timetracker: "Uren per taak en project",
  chat: "Praat met Giulia",
  voice: "Spreek met Giulia",
  settings: "Jouw voorkeuren",
  profile: "Jij in Giulia",
  integrations: "Verbindingen van Giulia",
  updates: "Achter de schermen",
  goodmorning: "Een rustige ochtend",
};

export default function ModulePanel() {
  const { activeModule, closeModule } = usePanel();
  const navigate = useNavigate();
  const mod = activeModule ? MODULES[activeModule] : null;
  const ActiveComponent = mod?.Component;
  const Preview = activeModule ? PREVIEWS[activeModule] : null;
  const openSpace = () => {
    if (MODULE_ROUTE[activeModule]) navigate(MODULE_ROUTE[activeModule]);
    closeModule();
  };
  const widgetDef = activeModule ? WIDGETS[activeModule] : null;
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);

  const addToDashboard = async () => {
    if (!widgetDef) return;
    setAdding(true);
    try {
      const existing = await base44.entities.DashboardWidget.filter({ widget_type: activeModule });
      if (existing && existing.length) {
        toast({ title: "Staat al op je dashboard" });
        return;
      }
      await base44.entities.DashboardWidget.create({ widget_type: activeModule, position: 99, visible: true });
      toast({ title: "Widget toegevoegd", description: `${widgetDef.label} staat nu op je dashboard` });
    } catch (e) {
      toast({ title: "Toevoegen mislukt", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <FloatingPanel open={!!mod} onClose={closeModule} position="right" level={3} width={mod?.panelWidth || 720} showOverlay dim={false}>
      {mod && (
        <div className="flex flex-col h-full">
          <div className="h-[3px] w-full shrink-0" style={{ background: MODULE_ACCENT[activeModule] || "hsl(var(--sand))" }} />
          {/* Clean header photo — no overlay */}
          <div className="relative shrink-0 h-44 overflow-hidden">
            <img src={WIDGETS[activeModule]?.image || MODULE_IMAGE[activeModule] || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
          </div>

          {/* Floating glass content card — overlaps the header photo with rounded corners */}
          <div className="flex-1 -mt-10 rounded-t-[28px] glass-3 overflow-y-auto">
            <div className="px-7 lg:px-9 pt-7 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">Snelle context</p>
                  <h2 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory">
                    {MODULE_TOPIC[activeModule] || mod.label}
                  </h2>
                </div>
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                {widgetDef && (
                  <button
                    onClick={addToDashboard}
                    disabled={adding}
                    className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-2 text-[11px] font-semibold text-ivory transition disabled:opacity-50"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Widget</span>
                    <Plus className="h-3 w-3" />
                  </button>
                )}
                {MODULE_ROUTE[activeModule] && (
                  <button
                    onClick={() => { navigate(MODULE_ROUTE[activeModule]); closeModule(); }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-2 text-[11px] font-bold hover:bg-charcoal/90 transition shadow-sm"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Open space</span>
                  </button>
                )}
                <AnimatedPicto icon={mod.icon} accent={MODULE_ACCENT[activeModule]} />
                </div>
              </div>
            </div>

            {/* Content — LEVEL 02 quick-context preview, or full component for
                interaction surfaces (chat/voice/settings/profile/integrations). */}
            <div className="px-7 lg:px-9 pb-8">
              {Preview ? <Preview onOpen={openSpace} /> : <ActiveComponent />}
            </div>
          </div>
        </div>
      )}
    </FloatingPanel>
  );
}