import {
  Sparkles, Calendar, CheckSquare, ClipboardCheck, Mail, MessageCircle,
  Briefcase, BookOpen, Users, FileText, Brain, Activity as ActivityIcon, Telescope, Cpu, MessageSquare, Timer, Sunrise, Bell, Heart, CalendarHeart, Home, ClipboardList, Palette,
} from "lucide-react";
import { IMAGES } from "@/lib/images";

import GiuliaWidget from "@/components/widgets/GiuliaWidget";
import GoodMorningWidget from "@/components/widgets/GoodMorningWidget";
import AgendaWidget from "@/components/widgets/AgendaWidget";
import TasksWidget from "@/components/widgets/TasksWidget";
import ApprovalsWidget from "@/components/widgets/ApprovalsWidget";
import NotificationsWidget from "@/components/widgets/NotificationsWidget";
import EmailWidget from "@/components/widgets/EmailWidget";
import WhatsAppWidget from "@/components/widgets/WhatsAppWidget";
import ProjectsWidget from "@/components/widgets/ProjectsWidget";
import KnowledgeWidget from "@/components/widgets/KnowledgeWidget";
import PeopleWidget from "@/components/widgets/PeopleWidget";
import DocumentsWidget from "@/components/widgets/DocumentsWidget";
import MemoryWidget from "@/components/widgets/MemoryWidget";
import InsightsWidget from "@/components/widgets/InsightsWidget";
import ActivityWidget from "@/components/widgets/ActivityWidget";
import AgentActivityWidget from "@/components/widgets/AgentActivityWidget";
import ConciergeWidget from "@/components/concierge/ConciergeWidget";
import TimeTrackerWidget from "@/components/widgets/TimeTrackerWidget";
import UpdatesWidget from "@/components/widgets/UpdatesWidget";
import SocialPulseWidget from "@/components/widgets/SocialPulseWidget";
import SocialPlannerWidget from "@/components/widgets/SocialPlannerWidget";
import HouseholdWidget from "@/components/widgets/HouseholdWidget";
import PersonalAdminWidget from "@/components/widgets/PersonalAdminWidget";
import HobbiesWidget from "@/components/widgets/HobbiesWidget";

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
};

export const WIDGET_LIST = Object.values(WIDGETS);