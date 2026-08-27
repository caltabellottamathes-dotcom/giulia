import React, { useEffect, useState } from "react";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { MODULES } from "@/lib/moduleRegistry";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { MODULE_PANEL_META, TAB_HELP } from "@/lib/modulePanelMeta";
import { ArrowUpRight, HelpCircle } from "lucide-react";
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
import PersonalTimePreview from "@/life/panels/PersonalTimePreview";
import HouseholdPreview from "@/life/panels/HouseholdPreview";
import PersonalAdminPreview from "@/life/panels/PersonalAdminPreview";
import HobbiesPreview from "@/life/panels/HobbiesPreview";
import FoodPreview from "@/life/panels/FoodPreview";
import QuestionsPreview from "@/giulia/panels/QuestionsPreview";
import GoodMorningMorningPreview from "@/giulia/panels/GoodMorningMorningPreview";
import GoodMorningRoutinePreview from "@/giulia/panels/GoodMorningRoutinePreview";
import GoodMorningSettingsPreview from "@/giulia/panels/GoodMorningSettingsPreview";
import ChatStage from "@/giulia/panels/ChatStage";
import VoiceStage from "@/giulia/panels/VoiceStage";

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
  socialpulse: SocialPulsePreview, socialplanner: SocialPlannerPreview, socialtime: PersonalTimePreview,
  household: HouseholdPreview, personaladmin: PersonalAdminPreview, hobbies: HobbiesPreview,
  food: FoodPreview,
  wantstoknow: QuestionsPreview,
  gm_morning: GoodMorningMorningPreview,
  gm_routine: GoodMorningRoutinePreview,
  gm_settings: GoodMorningSettingsPreview,
};

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
  socialpulse: "hsl(var(--life-blue))", socialplanner: "hsl(var(--life-blue))", socialtime: "hsl(var(--life-sand))",
  household: "hsl(var(--life-blue))", personaladmin: "hsl(var(--life-sand))", hobbies: "hsl(var(--life-blue))",
  food: "hsl(var(--life-sand))",
  wantstoknow: "hsl(var(--olive))",
  imageviewer: "hsl(var(--blue-grey))", videoplayer: "hsl(var(--sand))", musicplayer: "hsl(var(--olive))", docviewer: "hsl(var(--charcoal))",
  mediaplayer: "hsl(var(--life-blue))",
};

const MODULE_IMAGE = {
  chat: IMAGES.portraitBootFace,
  voice: IMAGES.portraitBootFace,
  settings: IMAGES.walkingChairs,
  profile: IMAGES.portraitBootHands,
  integrations: IMAGES.sittingChairs,
  agents: IMAGES.feetChair,
  jedag: IMAGES.wWhatMatters,
  socialpulse: IMAGES.lifeSocialPulse, socialplanner: IMAGES.lifeSocialPlanner, socialtime: IMAGES.selfPersonalTime,
  household: IMAGES.lifeHousehold, personaladmin: IMAGES.lifePersonalAdmin, hobbies: IMAGES.lifeHobbies,
  food: IMAGES.lifeFood,
  wantstoknow: IMAGES.wWantsToKnow,
  mediaplayer: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/aa291c631_MElodies.jpeg",
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
  mediaplayer: "/media",
  jedag: "/agenda",
};

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
  socialpulse: "Wie aandacht verdient", socialplanner: "Sociale tijd inplannen", socialtime: "Tijd voor jezelf",
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
  mediaplayer: "Al je media bij de hand",
};

const FULL_BLEED = { voice: true, velochat: true };

function GraphicRule({ accent, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="h-px bg-storm/15" />
      <div className="absolute left-0 top-0 h-px w-16" style={{ background: accent }} />
    </div>
  );
}

/**
 * Het ENE universele ModulePanel. Structuur:
 *   1. HeroPhoto
 *   2. GlassShellPanel
 *        - HEADER  : "Snelle context" + titel + links (body-nav) + Open Space + Help + Widget
 *        - BODY    : vaste hoogte, toont de actieve preview (tabs wisselen inhoud)
 *        - FOOTER  : contextrij + knoppen uit de preview, vast onderaan, zonder achtergrond
 */
export default function ModulePanel() {
  const { activeModule, closeModule } = usePanel();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [footer, setFooter] = useState(null);

  const mod = activeModule ? MODULES[activeModule] : null;
  const meta = activeModule ? MODULE_PANEL_META[activeModule] : null;
  const tabs = meta?.tabs || null;
  const fallbackLinks = activeModule ? MODULE_FUNCTIONS[activeModule] || [] : [];
  const accent = activeModule ? (MODULE_ACCENT[activeModule] || "hsl(var(--sand))") : "hsl(var(--sand))";

  // Reset tab bij nieuwe module (footer wordt door de gemonteerde preview
  // zelf via onFooter gezet — niet hier nullen, want dit effect loopt ná het
  // child-effect en zou de footer dan weer leegmaken)
  useEffect(() => {
    if (activeModule) {
      const firstTab = MODULE_PANEL_META[activeModule]?.tabs?.[0]?.module;
      setActiveTab(firstTab || activeModule);
      setHelpOpen(false);
    }
  }, [activeModule]);

  const bodyModule = activeTab || activeModule;
  const Preview = bodyModule ? PREVIEWS[bodyModule] : null;
  const ActiveComponent = mod?.Component;
  const openSpace = () => { if (MODULE_ROUTE[activeModule]) navigate(MODULE_ROUTE[activeModule]); closeModule(); };

  const selectTab = (m) => { setActiveTab(m); setFooter(null); setHelpOpen(false); };
  const runAction = (a) => { if (a.onClick) a.onClick(); else if (a.to) navigate(a.to); };

  const isStage = activeModule === "chat" || activeModule === "voice";
  const panelWidth = activeModule === "chat" ? 460 : activeModule === "voice" ? 720 : (mod?.panelWidth || 720);
  return (
    <FloatingPanel open={!!activeModule} onClose={closeModule} position="left" level={3} width={panelWidth} showOverlay dim={false}>
      {activeModule && (
        isStage ? (
          activeModule === "chat" ? <ChatStage /> : <VoiceStage />
        ) : FULL_BLEED[activeModule] ? (
          <div className="h-full"><ActiveComponent /></div>
        ) : (
        <div className="flex flex-col h-full">
          {/* 1. HeroPhoto */}
          <div className="h-[3px] w-full shrink-0" style={{ background: accent }} />
          <div className="relative shrink-0 h-44 overflow-hidden">
            <img src={WIDGETS[activeModule]?.image || MODULE_IMAGE[activeModule] || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
          </div>

          {/* 2. GlassShellPanel */}
          <div className="flex-1 -mt-10 rounded-t-[28px] glass-3 flex flex-col min-h-0 overflow-hidden">
            {/* HEADER */}
            <div className="px-7 lg:px-9 pt-7 pb-4 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1.5">Snelle context</p>
                  <h2 className="text-[24px] lg:text-[28px] font-display font-semibold tracking-tight leading-none text-ivory">
                    {MODULE_TOPIC[activeModule] || mod.label}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {MODULE_ROUTE[activeModule] && (
                    <button onClick={() => { navigate(MODULE_ROUTE[activeModule]); closeModule(); }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-2 text-[11px] font-bold hover:bg-charcoal/90 transition shadow-sm">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Open space</span>
                    </button>
                  )}
                  {TAB_HELP[bodyModule] && (
                    <button onClick={() => setHelpOpen(v => !v)} aria-label="Help"
                      className={`inline-flex items-center justify-center rounded-full glass-button h-9 w-9 text-ivory transition ${helpOpen ? "ring-2 ring-ivory/30" : ""}`}>
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Links — body-navigatie (tabs wisselen Body) of route-links (fallback) */}
              {tabs ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                  {tabs.map(t => (
                    <button key={t.module} onClick={() => selectTab(t.module)}
                      className={`text-[12px] font-medium tracking-[0.04em] transition-colors ${bodyModule === t.module ? "text-ivory underline underline-offset-[6px] decoration-ivory/60" : "text-ivory/45 hover:text-ivory/80"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              ) : fallbackLinks.length > 0 && (
                <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-2.5">
                  {fallbackLinks.map(f => (
                    <Link key={f.label} to={f.to} onClick={closeModule}
                      className="text-[11px] text-ivory/55 hover:text-ivory transition-colors underline underline-offset-4 decoration-ivory/20">
                      {f.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mx-7 lg:mx-9 h-px bg-storm/10 shrink-0" />

            {/* Help-strip (universele info over de Body-inhoud) */}
            {helpOpen && TAB_HELP[bodyModule] && (
              <div className="mx-7 lg:mx-9 mb-3 shrink-0 rounded-2xl border border-storm/10 bg-marble/5 px-4 py-3">
                <p className="text-storm/70 text-xs leading-relaxed">{TAB_HELP[bodyModule]}</p>
              </div>
            )}

            {/* BODY — vaste hoogte tussen header en footer */}
            <div className={`flex-1 min-h-0 px-7 lg:px-9 pt-3 ${Preview ? "overflow-hidden" : "overflow-y-auto pb-8"}`}>
              {Preview ? <Preview key={bodyModule} onOpen={openSpace} onFooter={setFooter} /> : <ActiveComponent />}
            </div>

            {/* FOOTER — kleine contextfooter (uit de preview) of minimale merk-regel */}
            <div className="shrink-0">
              <div className="mx-7 lg:mx-9 h-px bg-storm/10" />
              <div className="px-7 lg:px-9 py-3 min-h-[2.75rem] flex items-center gap-3">
                {footer ? (
                  <div className="w-full flex items-center gap-3">{footer}</div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-medium">Giulia · {MODULES[bodyModule]?.label || mod?.label}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
        )
      )}
    </FloatingPanel>
  );
}