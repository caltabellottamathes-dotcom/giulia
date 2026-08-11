import {
  Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity as ActivityIcon, Brain, Plug, Settings as SettingsIcon, User, Telescope, Cpu, Timer,
} from "lucide-react";

import Agenda from "@/pages/Agenda";
import Projects from "@/pages/Projects";
import Tasks from "@/pages/Tasks";
import Email from "@/pages/Email";
import WhatsApp from "@/pages/WhatsApp";
import Knowledge from "@/pages/Knowledge";
import Documents from "@/pages/Documents";
import People from "@/pages/People";
import Chat from "@/pages/Chat";
import Voice from "@/pages/Voice";
import Approvals from "@/pages/Approvals";
import ActivityPage from "@/pages/Activity";
import Memory from "@/pages/Memory";
import Integrations from "@/pages/Integrations";
import SettingsPage from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Insights from "@/pages/Insights";
import TimeTracker from "@/pages/TimeTracker";
import Agents from "@/pages/Agents";

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
  activity:    { label: "Activity",      icon: ActivityIcon,  Component: ActivityPage, panelWidth: 720 },
  memory:      { label: "Memory",        icon: Brain,         Component: Memory,      panelWidth: 720 },
  integrations:{ label: "Integrations",  icon: Plug,           Component: Integrations, panelWidth: 720 },
  settings:    { label: "Settings",      icon: SettingsIcon,   Component: SettingsPage, panelWidth: 720 },
  profile:     { label: "Profile",       icon: User,           Component: Profile,     panelWidth: 560 },
  insights:    { label: "Insights",      icon: Telescope,      Component: Insights,    panelWidth: 720 },
  timetracker: { label: "Tijd",         icon: Timer,           Component: TimeTracker,  panelWidth: 720 },
  agents:      { label: "Agenten",       icon: Cpu,             Component: Agents,        panelWidth: 860 },
};