import {
  Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity as ActivityIcon, Brain, Plug, Settings as SettingsIcon, User,
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

/**
 * Single source of truth for every module that opens as a sliding glass
 * panel. Key = the identifier used across nav, quick actions and the panel.
 */
export const MODULES = {
  agenda: { label: "Agenda", icon: Calendar, Component: Agenda },
  projects: { label: "Projects", icon: Briefcase, Component: Projects },
  tasks: { label: "Tasks", icon: CheckSquare, Component: Tasks },
  email: { label: "Email", icon: Mail, Component: Email },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, Component: WhatsApp },
  knowledge: { label: "Knowledge", icon: BookOpen, Component: Knowledge },
  documents: { label: "Documents", icon: FileText, Component: Documents },
  people: { label: "People", icon: Users, Component: People },
  chat: { label: "Chat", icon: MessageSquare, Component: Chat },
  voice: { label: "Voice", icon: Mic, Component: Voice },
  approvals: { label: "Approvals", icon: ClipboardCheck, Component: Approvals },
  activity: { label: "Activity", icon: ActivityIcon, Component: ActivityPage },
  memory: { label: "Memory", icon: Brain, Component: Memory },
  integrations: { label: "Integrations", icon: Plug, Component: Integrations },
  settings: { label: "Settings", icon: SettingsIcon, Component: SettingsPage },
  profile: { label: "Profile", icon: User, Component: Profile },
};