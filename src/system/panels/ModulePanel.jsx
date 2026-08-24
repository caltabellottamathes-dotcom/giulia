import React, { useState } from "react";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { MODULES } from "@/lib/moduleRegistry";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, LayoutGrid, ArrowUpRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AgendaPreview from "@/focus/panels/AgendaPreview";
import TasksPreview from "@/focus/panels/TasksPreview";
import ProjectsPreview from "@/focus/panels/ProjectsPreview";
import EmailPreview from "@/focus/panels/EmailPreview";
import WhatsAppPreview from "@/focus/panels/WhatsAppPreview";
import PeoplePreview from "@/focus/panels/PeoplePreview";
import ApprovalsPreview from "@/giulia/panels/ApprovalsPreview";
import ActivityPreview from "@/giulia/panels/ActivityPreview";
import InsightsPreview from "@/giulia/panels/InsightsPreview";
import MemoryPreview from "@/giulia/panels/MemoryPreview";
import KnowledgePreview from "@/focus/panels/KnowledgePreview";
import DocumentsPreview from "@/focus/panels/DocumentsPreview";
import AgentsPreview from "@/giulia/panels/AgentsPreview";
import TimeTrackerPreview from "@/focus/panels/TimeTrackerPreview";
import JeDagPreview from "@/giulia/panels/JeDagPreview";
import SocialPulsePreview from "@/life/panels/SocialPulsePreview";
import SocialPlannerPreview from "@/life/panels/SocialPlannerPreview";
import HouseholdPreview from "@/life/panels/HouseholdPreview";
import PersonalAdminPreview from "@/life/panels/PersonalAdminPreview";
import HobbiesPreview from "@/life/panels/HobbiesPreview";
import FoodPreview from "@/life/panels/FoodPreview";
import QuestionsPreview from "@/giulia/panels/QuestionsPreview";
import { AnimatedPicto } from "@/system/panels/previewParts";

/** LEVEL 02 quick-context previews — one per data module. Modules without
 *  a preview (chat, voice, settings, profile, integrations) keep the full
 *  component, since those surfaces are themselves the interaction. */
const PREVIEWS = {
  agenda: AgendaPreview, tasks: TasksPreview, projects: ProjectsPreview,
  email: EmailPreview, whatsapp: WhatsAppPreview, people: PeoplePreview,
  approvals: ApprovalsPreview, activity: ActivityPreview, insights: InsightsPreview,
  memory: MemoryPreview, knowledge: KnowledgePreview, documents: DocumentsPreview,
  agents: AgentsPreview,
  jedag: JeDagPreview,
  timetracker: TimeTrackerPreview,
  socialpulse: SocialPulsePreview, socialplanner: SocialPlannerPreview,
  household: HouseholdPreview, personaladmin: PersonalAdminPreview, hobbies: HobbiesPreview,
  food: FoodPreview,
  wantstoknow: QuestionsPreview,
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
  notifications: "hsl(var(--ridge))",
  activity: "hsl(var(--sand))", memory: "hsl(var(--charcoal))", insights: "hsl(var(--sand))",
  chat: "hsl(var(--olive))", voice: "hsl(var(--charcoal))",
  agents: "hsl(var(--olive))",
  timetracker: "hsl(var(--olive))",
  updates: "hsl(var(--sand))",
  goodmorning: "hsl(var(--sand))",
  jedag: "#595f34",
  socialpulse: "hsl(var(--life-blue))", socialplanner: "hsl(var(--life-blue))",
  household: "hsl(var(--life-blue))", personaladmin: "hsl(var(--life-sand))", hobbies: "hsl(var(--life-blue))",
  food: "hsl(var(--life-sand))",
  wantstoknow: "hsl(var(--olive))",
  imageviewer: "hsl(var(--blue-grey))", videoplayer: "hsl(var(--sand))", musicplayer: "hsl(var(--olive))", docviewer: "hsl(var(--charcoal))",
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
  jedag: IMAGES.wWhatMatters,
  socialpulse: IMAGES.lifeSocialPulse, socialplanner: IMAGES.lifeSocialPlanner,
  household: IMAGES.lifeHousehold, personaladmin: IMAGES.lifePersonalAdmin, hobbies: IMAGES.lifeHobbies,
  food: IMAGES.lifeFood,
  wantstoknow: IMAGES.wWantsToKnow,
};

const MODULE_ROUTE = {
  agenda: "/agenda", projects: "/projects", tasks: "/tasks", email: "/email",
  whatsapp: "/whatsapp", knowledge: "/knowledge", documents: "/documents",
  people: "/people", chat: "/chat", voice: "/voice", approvals: "/approvals",
  notifications: "/notifications",
  activity: "/activity", memory: "/memory", integrations: "/integrations",
  settings: "/settings", profile: "/profile", insights: "/insights",
  agents: "/agents",
  timetracker: "/timetracker",
  updates: "/updates",
  goodmorning: "/wake",
  social: "/life/social",
  household: "/life/household", personaladmin: "/life/personal-admin", hobbies: "/life/hobbies",
  food: "/life/food",
  wantstoknow: "/wants-to-know",
  dailystate: "/life/daily-state", development: "/life/development",
  jedag: "/agenda",
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
  notifications: "Vragen en opmerkingen van Giulia",
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
  jedag: "Jouw dag in één blik",
  socialpulse: "Wie aandacht verdient", socialplanner: "Sociale tijd inplannen",
  household: "Het huishouden op orde", personaladmin: "Wat er geregeld moet worden",
  hobbies: "Wat jou energie geeft",
  food: "Wat je eet deze week",
  wantstoknow: "Wat Giulia nog wil weten",
  selfdailystate: "Hoe je er nu bij staat",
  selfroutines: "Routines die je vasthoudt",
  selfwake: "Je ochtendritueel",
  selftherapy: "Je traject en voortgang",
  selfjournal: "Je gedachten vastgelegd",
  selfdevelopment: "Waar je aan groeit",
  selfpersonaltime: "Tijd voor jezelf",
  selfinsights: "Patronen over jezelf",
  imageviewer: "Jouw afbeeldingen", videoplayer: "Je video's", musicplayer: "Je muziek", docviewer: "Jouw documenten",
};

// Modules whose panel is the interaction surface itself — render full-bleed
// (no header photo / title) so the panel looks exactly like its widget.
const FULL_BLEED = { voice: true };

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
        FULL_BLEED[activeModule] ? (
          <div className="h-full"><ActiveComponent /></div>
        ) : (
        <div className="flex flex-col h-full">
          <div className="h-[3px] w-full shrink-0" style={{ background: MODULE_ACCENT[activeModule] || "hsl(var(--sand))" }} />
          {/* Clean header photo — no overlay */}
          <div className="relative shrink-0 h-44 overflow-hidden">
            <img src={WIDGETS[activeModule]?.image || MODULE_IMAGE[activeModule] || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
          </div>

          {/* Floating glass content card — overlaps the header photo with rounded corners */}
          <div className="flex-1 -mt-10 rounded-t-[28px] glass-3 flex flex-col min-h-0 overflow-hidden">
            <div className="px-7 lg:px-9 pt-7 pb-5 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">Snelle context</p>
                  <h2 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory">
                    {MODULE_TOPIC[activeModule] || mod.label}
                  </h2>
                  {(MODULE_FUNCTIONS[activeModule] || []).length > 0 && (
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-2.5">
                      {MODULE_FUNCTIONS[activeModule].map((f) => (
                        <Link key={f.label} to={f.to} onClick={closeModule} className="text-[11px] text-ivory/55 hover:text-ivory transition-colors underline underline-offset-4 decoration-ivory/20">
                          {f.label}
                        </Link>
                      ))}
                    </div>
                  )}
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
            <div className="flex-1 min-h-0 px-7 lg:px-9 pb-8 overflow-y-auto">
              {Preview ? <Preview onOpen={openSpace} /> : <ActiveComponent />}
            </div>
          </div>
        </div>
        )
      )}
    </FloatingPanel>
  );
}