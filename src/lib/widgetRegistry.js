import {
  Sparkles, Calendar, CheckSquare, ClipboardCheck, Mail, MessageCircle,
  Briefcase, BookOpen, Users, FileText, Brain, Activity as ActivityIcon, Telescope, Cpu, MessageSquare, Timer, Sunrise, Bell, Heart, CalendarHeart, Home, ClipboardList, Palette, HelpCircle, Repeat, Target, Clock, Image as ImageIcon, Music, Video, Images, Utensils,
} from "lucide-react";
import { IMAGES } from "@/lib/images";

import GiuliaWidget from "@/giulia/widgets/GiuliaWidget";
import GoodMorningWidget from "@/self/widgets/GoodMorningWidget";
import AgendaWidget from "@/focus/widgets/AgendaWidget";
import TasksWidget from "@/focus/widgets/TasksWidget";
import ApprovalsWidget from "@/giulia/widgets/ApprovalsWidget";
import NotificationsWidget from "@/focus/widgets/NotificationsWidget";
import EmailWidget from "@/focus/widgets/EmailWidget";
import WhatsAppWidget from "@/focus/widgets/WhatsAppWidget";
import ProjectsWidget from "@/focus/widgets/ProjectsWidget";
import KnowledgeWidget from "@/focus/widgets/KnowledgeWidget";
import PeopleWidget from "@/focus/widgets/PeopleWidget";
import DocumentsWidget from "@/focus/widgets/DocumentsWidget";
import MemoryWidget from "@/giulia/widgets/MemoryWidget";
import InsightsWidget from "@/giulia/widgets/InsightsWidget";
import ActivityWidget from "@/giulia/widgets/ActivityWidget";
import AgentActivityWidget from "@/giulia/widgets/AgentActivityWidget";
import ConciergeWidget from "@/giulia/widgets/ConciergeWidget";
import TimeTrackerWidget from "@/focus/widgets/TimeTrackerWidget";
import UpdatesWidget from "@/giulia/widgets/UpdatesWidget";
import SocialPulseWidget from "@/life/widgets/SocialPulseWidget";
import SocialPlannerWidget from "@/life/widgets/SocialPlannerWidget";
import HouseholdWidget from "@/life/widgets/HouseholdWidget";
import PersonalAdminWidget from "@/life/widgets/PersonalAdminWidget";
import HobbiesWidget from "@/life/widgets/HobbiesWidget";
import FoodWidget from "@/life/widgets/FoodWidget";
import GiuliaQuestionsWidget from "@/giulia/widgets/GiuliaQuestionsWidget";
import DailyStateEditorial from "@/self/widgets/editorial/DailyStateEditorial";
import PersonalDevelopmentEditorial from "@/self/widgets/editorial/PersonalDevelopmentEditorial";
import ImageViewerWidget from "@/system/widgets/viewers/ImageViewerWidget";
import VideoPlayerWidget from "@/system/widgets/viewers/VideoPlayerWidget";
import MusicPlayerWidget from "@/system/widgets/viewers/MusicPlayerWidget";
import DocViewerWidget from "@/system/widgets/viewers/DocViewerWidget";
import BeeldbankWidget from "@/system/widgets/BeeldbankWidget";

/**
 * Single source of truth for every dashboard widget.
 * `domain` deelt widgets in over de vijf OS-lagen: giulia / focus / life / self / system.
 * `image` is de branding-foto, gebruikt in de widget én als ronde thumb in het
 * toevoeg-paneel.
 */
export const WIDGETS = {
  // ── GIULIA ──
  giulia:          { type: "giulia",          label: "Giulia · je dag",      icon: Sparkles,      Component: GiuliaWidget,          image: IMAGES.bootPhone,        span: 8, category: "core", domain: "giulia" },
  goodmorning:     { type: "goodmorning",     label: "Good Morning",         icon: Sunrise,       Component: GoodMorningWidget,     image: IMAGES.walkChairsBeach,  span: 3, category: "core", domain: "giulia" },
  concierge:       { type: "concierge",       label: "Giulia · Concierge",   icon: MessageSquare, Component: ConciergeWidget,        image: IMAGES.giuliaConcierge, span: 3, category: "core", domain: "giulia" },
  approvals:       { type: "approvals",       label: "Goedkeuringen",         icon: ClipboardCheck,Component: ApprovalsWidget,       image: IMAGES.leanChair,        span: 4, category: "core", domain: "giulia" },
  memory:          { type: "memory",          label: "Geheugen",             icon: Brain,         Component: MemoryWidget,           image: IMAGES.loungeChairs,     span: 4, category: "intelligence", domain: "system" },
  activity:        { type: "activity",        label: "Activiteit",           icon: ActivityIcon,  Component: ActivityWidget,        image: IMAGES.topDownWalk,      span: 6, category: "intelligence", domain: "system" },
  agentactivity:   { type: "agentactivity",   label: "Giulia · Agenten",     icon: Cpu,           Component: AgentActivityWidget,    image: IMAGES.feetChair,        span: 4, category: "intelligence", domain: "system" },
  insights:        { type: "insights",        label: "Giulia · Inzichten",   icon: Telescope,     Component: InsightsWidget,         image: IMAGES.feetChair,        span: 4, category: "intelligence", domain: "giulia" },
  updates:         { type: "updates",         label: "Giulia · Updates",     icon: Sparkles,      Component: UpdatesWidget,          image: IMAGES.feetChair,        span: 3, category: "intelligence", domain: "giulia" },
  giuliaquestions: { type: "giuliaquestions", label: "Giulia · Wants to know", icon: HelpCircle,   Component: GiuliaQuestionsWidget,   image: IMAGES.portraitThinking, span: 4, category: "intelligence", domain: "giulia" },

  // ── FOCUS ──
  agenda:     { type: "agenda",     label: "Agenda",      icon: Calendar,    Component: AgendaWidget,     image: IMAGES.walkChairsBeach, span: 4, category: "core", domain: "life" },
  tasks:      { type: "tasks",      label: "Taken",       icon: CheckSquare, Component: TasksWidget,      image: IMAGES.feetChairs,       span: 4, category: "work", domain: "focus" },
  projects:   { type: "projects",   label: "Projecten",   icon: Briefcase,   Component: ProjectsWidget,   image: IMAGES.walkChairsHigh,   span: 5, category: "work", domain: "focus" },
  email:      { type: "email",      label: "Email",       icon: Mail,        Component: EmailWidget,      image: IMAGES.portraitBoot,     span: 4, category: "comms", domain: "focus" },
  whatsapp:   { type: "whatsapp",   label: "WhatsApp",    icon: MessageCircle, Component: WhatsAppWidget, image: IMAGES.stilettoHead,   span: 4, category: "comms", domain: "focus" },
  knowledge:  { type: "knowledge",  label: "Kennisbank",  icon: BookOpen,     Component: KnowledgeWidget,  image: IMAGES.chairWater,       span: 4, category: "work", domain: "system" },
  documents:  { type: "documents",  label: "Documenten",  icon: FileText,     Component: DocumentsWidget,  image: IMAGES.chairsScattered,  span: 4, category: "work", domain: "focus" },
  people:     { type: "people",     label: "Mensen",      icon: Users,        Component: PeopleWidget,     image: IMAGES.portraitThinking, span: 3, category: "work", domain: "focus" },
  timetracker:{ type: "timetracker", label: "Tijd · Timer", icon: Timer,      Component: TimeTrackerWidget, image: IMAGES.hourglassJacket,  span: 4, category: "work", domain: "focus" },

  // ── LIFE ──
  socialpulse:   { type: "socialpulse",   label: "Social Pulse",      icon: Heart,         Component: SocialPulseWidget,    image: IMAGES.lifeSocialPulse,    span: 4, category: "life", domain: "life" },
  socialplanner: { type: "socialplanner", label: "Social Planner",    icon: CalendarHeart,  Component: SocialPlannerWidget,  image: IMAGES.lifeSocialPlanner,  span: 3, category: "life", domain: "life" },
  household:     { type: "household",     label: "Huishouden",         icon: Home,          Component: HouseholdWidget,      image: IMAGES.lifeHousehold,      span: 3, category: "life", domain: "life" },
  personaladmin: { type: "personaladmin", label: "Persoonlijk Admin", icon: ClipboardList,  Component: PersonalAdminWidget,  image: IMAGES.lifePersonalAdmin,  span: 3, category: "life", domain: "life" },
  hobbies:       { type: "hobbies",       label: "Hobby's",           icon: Palette,        Component: HobbiesWidget,        image: IMAGES.lifeHobbies,        span: 3, category: "life", domain: "life" },
  food:          { type: "food",          label: "Food",              icon: Utensils,       Component: FoodWidget,           image: IMAGES.lifeFood,           span: 2, category: "life", domain: "life" },

  // ── LIFE · gemigreerd uit SELF (Daily State & Development blijven als LIFE-modules) ──
  dailystate:   { type: "dailystate",   label: "Daily State",      icon: ActivityIcon, Component: DailyStateEditorial,          image: IMAGES.selfDailyState,    span: 1, category: "life", domain: "life" },
  development:  { type: "development",  label: "Development",       icon: Target,       Component: PersonalDevelopmentEditorial,  image: IMAGES.selfDevelopment,   span: 2, category: "life", domain: "life" },

  // ── SYSTEM ──
  imageviewer: { type: "imageviewer", label: "Afbeeldingen", icon: ImageIcon, Component: ImageViewerWidget, image: IMAGES.notebookChair, span: 1, category: "system", domain: "system" },
  videoplayer: { type: "videoplayer", label: "Video", icon: Video, Component: VideoPlayerWidget, image: IMAGES.bootPhone, span: 1, category: "system", domain: "system" },
  musicplayer: { type: "musicplayer", label: "Muziek", icon: Music, Component: MusicPlayerWidget, image: IMAGES.hourglassJacket, span: 1, category: "system", domain: "system" },
  docviewer:   { type: "docviewer",   label: "Document", icon: FileText, Component: DocViewerWidget,   image: IMAGES.womanFolder, span: 1, category: "system", domain: "system" },
  notifications: { type: "notifications", label: "Notificaties", icon: Bell, Component: NotificationsWidget, image: IMAGES.feetChair, span: 3, category: "core", domain: "system" },

  // ── BEELDBANK & VOICE ──
  beeldbank:  { type: "beeldbank",  label: "Beeldbank",    icon: Images, Component: BeeldbankWidget,  image: IMAGES.feetChair,    span: 2, category: "system", domain: "system" },
};

export const WIDGET_LIST = Object.values(WIDGETS);