import {
  Sparkles, Calendar, CheckSquare, ClipboardCheck, Mail, MessageCircle,
  Briefcase, BookOpen, Users, FileText, Brain, Activity as ActivityIcon, Telescope, Cpu, MessageSquare, Timer, Sunrise, Bell, Heart, CalendarHeart, Home, ClipboardList, Palette, HelpCircle, Repeat, Target, Clock,
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
import GiuliaQuestionsWidget from "@/giulia/widgets/GiuliaQuestionsWidget";
import DailyStateWidget from "@/self/widgets/DailyStateWidget";
import RoutinesWidget from "@/self/widgets/RoutinesWidget";
import WakeWidget from "@/self/widgets/WakeWidget";
import TherapyWidget from "@/self/widgets/TherapyWidget";
import JournalWidget from "@/self/widgets/JournalWidget";
import PersonalDevelopmentWidget from "@/self/widgets/PersonalDevelopmentWidget";
import PersonalTimeWidget from "@/self/widgets/PersonalTimeWidget";
import SelfInsightsWidget from "@/self/widgets/SelfInsightsWidget";

/**
 * Single source of truth for every dashboard widget. `image` is a branding
 * photo used as a designed element inside the widget and in the add-picker.
 */
export const WIDGETS = {
  giulia:       { type: "giulia",       label: "Giulia · je dag",     icon: Sparkles,       Component: GiuliaWidget,      image: IMAGES.bootPhone,        span: 8, category: "core" },
  goodmorning:  { type: "goodmorning",  label: "Good Morning",        icon: Sunrise,        Component: GoodMorningWidget, image: IMAGES.walkChairsBeach,  span: 3, category: "core" },
  agenda:     { type: "agenda",    label: "Agenda",              icon: Calendar,       Component: AgendaWidget,    image: IMAGES.walkChairsBeach,  span: 4, category: "core" },
  tasks:      { type: "tasks",     label: "Taken",               icon: CheckSquare,    Component: TasksWidget,     image: IMAGES.feetChairs,       span: 4, category: "work" },
  approvals:  { type: "approvals",  label: "Goedkeuringen",       icon: ClipboardCheck, Component: ApprovalsWidget, image: IMAGES.leanChair,        span: 4, category: "work" },
  notifications: { type: "notifications", label: "Notificaties",  icon: Bell,           Component: NotificationsWidget, image: IMAGES.feetChair,   span: 3, category: "core" },
  email:      { type: "email",      label: "Email",              icon: Mail,           Component: EmailWidget,      image: IMAGES.portraitBoot,     span: 4, category: "comms" },
  whatsapp:   { type: "whatsapp",   label: "WhatsApp",          icon: MessageCircle,  Component: WhatsAppWidget,  image: IMAGES.stilettoHead,     span: 4, category: "comms" },
  projects:   { type: "projects",   label: "Projecten",          icon: Briefcase,      Component: ProjectsWidget,   image: IMAGES.walkChairsHigh,   span: 5, category: "work" },
  knowledge:  { type: "knowledge",  label: "Kennisbank",          icon: BookOpen,       Component: KnowledgeWidget,  image: IMAGES.chairWater,       span: 4, category: "work" },
  people:     { type: "people",     label: "Mensen",             icon: Users,          Component: PeopleWidget,     image: IMAGES.portraitThinking, span: 3, category: "work" },
  documents:  { type: "documents",  label: "Documenten",          icon: FileText,       Component: DocumentsWidget,  image: IMAGES.chairsScattered,  span: 4, category: "work" },
  memory:     { type: "memory",     label: "Geheugen",           icon: Brain,          Component: MemoryWidget,     image: IMAGES.loungeChairs,     span: 4, category: "intelligence" },
  activity:   { type: "activity",   label: "Activiteit",          icon: ActivityIcon,   Component: ActivityWidget,   image: IMAGES.topDownWalk,     span: 6, category: "intelligence" },
  agentactivity: { type: "agentactivity", label: "Giulia · Agenten", icon: Cpu,             Component: AgentActivityWidget, image: IMAGES.feetChair,        span: 4, category: "intelligence" },
  insights:   { type: "insights",   label: "Giulia · Inzichten",  icon: Telescope,      Component: InsightsWidget,   image: IMAGES.feetChair,        span: 4, category: "intelligence" },
  timetracker: { type: "timetracker", label: "Tijd · Timer",     icon: Timer,          Component: TimeTrackerWidget, image: IMAGES.hourglassJacket,  span: 4, category: "work" },
  concierge:  { type: "concierge",  label: "Giulia · Concierge",  icon: MessageSquare,  Component: ConciergeWidget,   image: IMAGES.feetChair,        span: 3, category: "core" },
  updates:    { type: "updates",    label: "Giulia · Updates",    icon: Sparkles,       Component: UpdatesWidget,     image: IMAGES.feetChair,        span: 3, category: "intelligence" },
  socialpulse:   { type: "socialpulse",   label: "Social Pulse",        icon: Heart,          Component: SocialPulseWidget,    image: IMAGES.lifeSocialPulse,    span: 4, category: "life" },
  socialplanner: { type: "socialplanner", label: "Social Planner",      icon: CalendarHeart,  Component: SocialPlannerWidget,  image: IMAGES.lifeSocialPlanner,  span: 3, category: "life" },
  household:     { type: "household",     label: "Huishouden",          icon: Home,           Component: HouseholdWidget,      image: IMAGES.lifeHousehold,      span: 3, category: "life" },
  personaladmin: { type: "personaladmin", label: "Persoonlijk Admin",   icon: ClipboardList,  Component: PersonalAdminWidget,  image: IMAGES.lifePersonalAdmin, span: 3, category: "life" },
  hobbies:       { type: "hobbies",       label: "Hobby's",            icon: Palette,        Component: HobbiesWidget,        image: IMAGES.lifeHobbies,        span: 3, category: "life" },
  giuliaquestions: { type: "giuliaquestions", label: "Giulia · Wants to know", icon: HelpCircle, Component: GiuliaQuestionsWidget, image: IMAGES.portraitThinking, span: 4, category: "intelligence" },
  selfdailystate:    { type: "selfdailystate",    label: "Daily State",          icon: ActivityIcon,    Component: DailyStateWidget,           image: IMAGES.selfDailyState,    span: 4, category: "self" },
  selfroutines:      { type: "selfroutines",      label: "Routines",             icon: Repeat,          Component: RoutinesWidget,             image: IMAGES.selfRoutines,      span: 3, category: "self" },
  selfwake:          { type: "selfwake",          label: "Wake",                 icon: Sunrise,         Component: WakeWidget,                 image: IMAGES.selfWake,          span: 3, category: "self" },
  selftherapy:       { type: "selftherapy",       label: "Therapy",             icon: Heart,           Component: TherapyWidget,              image: IMAGES.selfTherapy,       span: 3, category: "self" },
  selfjournal:       { type: "selfjournal",       label: "Journal",             icon: BookOpen,        Component: JournalWidget,              image: IMAGES.selfJournal,       span: 3, category: "self" },
  selfdevelopment:   { type: "selfdevelopment",   label: "Development",          icon: Target,          Component: PersonalDevelopmentWidget,  image: IMAGES.selfDevelopment,   span: 4, category: "self" },
  selfpersonaltime:  { type: "selfpersonaltime",  label: "Personal Time",       icon: Clock,            Component: PersonalTimeWidget,         image: IMAGES.selfPersonalTime,  span: 3, category: "self" },
  selfinsights:      { type: "selfinsights",      label: "Self Insights",        icon: Telescope,       Component: SelfInsightsWidget,         image: IMAGES.selfInsights,      span: 4, category: "self" },
};

export const WIDGET_LIST = Object.values(WIDGETS);