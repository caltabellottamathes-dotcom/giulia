import {
  Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity as ActivityIcon, Brain, Plug, Settings as SettingsIcon, User, Telescope, Cpu, Timer, Sparkles, Sunrise, Bell, Heart, CalendarHeart, Home, ClipboardList, Palette, HelpCircle, Repeat, Target, Clock,
} from "lucide-react";

import Agenda from "@/focus/pages/Agenda";
import Projects from "@/focus/pages/Projects";
import Tasks from "@/focus/pages/Tasks";
import Email from "@/focus/pages/Email";
import WhatsApp from "@/focus/pages/WhatsApp";
import Knowledge from "@/focus/pages/Knowledge";
import Documents from "@/focus/pages/Documents";
import People from "@/focus/pages/People";
import Chat from "@/giulia/pages/Chat";
import Voice from "@/giulia/pages/Voice";
import Approvals from "@/giulia/pages/Approvals";
import Notifications from "@/focus/pages/Notifications";
import ActivityPage from "@/giulia/pages/Activity";
import Memory from "@/giulia/pages/Memory";
import Integrations from "@/system/pages/Integrations";
import SettingsPage from "@/system/pages/Settings";
import Profile from "@/system/pages/Profile";
import Insights from "@/giulia/pages/Insights";
import TimeTracker from "@/focus/pages/TimeTracker";
import Agents from "@/giulia/pages/Agents";
import Updates from "@/giulia/pages/Updates";
import GoodMorningPanel from "@/self/panels/GoodMorningPanel";
import JeDagPreview from "@/giulia/panels/JeDagPreview";
import SocialPulsePage from "@/life/pages/SocialPulsePage";
import SocialPlannerPage from "@/life/pages/SocialPlannerPage";
import HouseholdPage from "@/life/pages/HouseholdPage";
import PersonalAdminPage from "@/life/pages/PersonalAdminPage";
import HobbiesPage from "@/life/pages/HobbiesPage";
import WantsToKnow from "@/giulia/pages/WantsToKnow";
import DailyStatePanel from "@/self/panels/DailyStatePanel";
import RoutinesPanel from "@/self/panels/RoutinesPanel";
import WakePanel from "@/self/panels/WakePanel";
import TherapyPanel from "@/self/panels/TherapyPanel";
import JournalPanel from "@/self/panels/JournalPanel";
import PersonalDevelopmentPanel from "@/self/panels/PersonalDevelopmentPanel";
import PersonalTimePanel from "@/self/panels/PersonalTimePanel";
import SelfInsightsPanel from "@/self/panels/SelfInsightsPanel";

/**
 * Single source of truth for every module that opens as a sliding glass
 * panel. `panelWidth` lets the content determine the panel size — panels
 * don't all share the same ratio.
 */
export const MODULES = {
  agenda:      { label: "Agenda",       icon: Calendar,     Component: Agenda,      panelWidth: 720 },
  projects:    { label: "Projects",     icon: Briefcase,    Component: Projects,    panelWidth: 860 },
  tasks:       { label: "Tasks",        icon: CheckSquare,  Component: Tasks,       panelWidth: 720 },
  email:       { label: "Email",        icon: Mail,          Component: Email,       panelWidth: 1000 },
  whatsapp:    { label: "WhatsApp",      icon: MessageCircle, Component: WhatsApp,    panelWidth: 1100 },
  knowledge:   { label: "Knowledge",     icon: BookOpen,      Component: Knowledge,    panelWidth: 860 },
  documents:   { label: "Documents",    icon: FileText,      Component: Documents,    panelWidth: 860 },
  people:      { label: "People",        icon: Users,         Component: People,       panelWidth: 720 },
  chat:        { label: "Chat",         icon: MessageSquare, Component: Chat,         panelWidth: 720 },
  voice:       { label: "Voice",        icon: Mic,           Component: Voice,        panelWidth: 720 },
  approvals:   { label: "Approvals",     icon: ClipboardCheck, Component: Approvals,   panelWidth: 720 },
  notifications: { label: "Notifications", icon: Bell,         Component: Notifications, panelWidth: 640 },
  activity:    { label: "Activity",      icon: ActivityIcon,  Component: ActivityPage, panelWidth: 720 },
  memory:      { label: "Memory",        icon: Brain,         Component: Memory,      panelWidth: 720 },
  integrations:{ label: "Integrations",  icon: Plug,           Component: Integrations, panelWidth: 720 },
  settings:    { label: "Settings",      icon: SettingsIcon,   Component: SettingsPage, panelWidth: 720 },
  profile:     { label: "Profile",       icon: User,           Component: Profile,     panelWidth: 560 },
  insights:    { label: "Insights",      icon: Telescope,      Component: Insights,    panelWidth: 720 },
  timetracker: { label: "Tijd",         icon: Timer,           Component: TimeTracker,  panelWidth: 720 },
  agents:      { label: "Agenten",       icon: Cpu,             Component: Agents,        panelWidth: 860 },
  updates:     { label: "Updates",       icon: Sparkles,        Component: Updates,       panelWidth: 720 },
  goodmorning: { label: "Good Morning",  icon: Sunrise,          Component: GoodMorningPanel, panelWidth: 560 },
  jedag:     { label: "Je dag",       icon: Sparkles,        Component: JeDagPreview,  panelWidth: 860 },
  socialpulse:   { label: "Social Pulse",      icon: Heart,           Component: SocialPulsePage,    panelWidth: 760 },
  socialplanner: { label: "Social Planner",    icon: CalendarHeart,   Component: SocialPlannerPage,  panelWidth: 760 },
  household:     { label: "Huishouden",         icon: Home,            Component: HouseholdPage,      panelWidth: 760 },
  personaladmin: { label: "Persoonlijk Admin",  icon: ClipboardList,   Component: PersonalAdminPage,  panelWidth: 760 },
  hobbies:       { label: "Hobby's",            icon: Palette,         Component: HobbiesPage,        panelWidth: 760 },
  wantstoknow:   { label: "Wants to know",       icon: HelpCircle,      Component: WantsToKnow,        panelWidth: 760 },
  selfdailystate:    { label: "Daily State",       icon: ActivityIcon,    Component: DailyStatePanel,           panelWidth: 760 },
  selfroutines:      { label: "Routines",          icon: Repeat,          Component: RoutinesPanel,             panelWidth: 760 },
  selfwake:          { label: "Wake",              icon: Sunrise,         Component: WakePanel,                 panelWidth: 560 },
  selftherapy:       { label: "Therapy",           icon: Heart,           Component: TherapyPanel,              panelWidth: 760 },
  selfjournal:       { label: "Journal",           icon: BookOpen,        Component: JournalPanel,              panelWidth: 760 },
  selfdevelopment:   { label: "Development",       icon: Target,          Component: PersonalDevelopmentPanel,  panelWidth: 760 },
  selfpersonaltime:  { label: "Personal Time",     icon: Clock,           Component: PersonalTimePanel,         panelWidth: 760 },
  selfinsights:      { label: "Self Insights",     icon: Telescope,       Component: SelfInsightsPanel,         panelWidth: 760 },
};