import {
  Sparkles, Calendar, CheckSquare, ClipboardCheck, Mail, MessageCircle,
  Briefcase, BookOpen, Users, FileText, Brain, Activity as ActivityIcon, Telescope, Cpu,
} from "lucide-react";
import { IMAGES } from "@/lib/images";

import GiuliaWidget from "@/components/widgets/GiuliaWidget";
import AgendaWidget from "@/components/widgets/AgendaWidget";
import TasksWidget from "@/components/widgets/TasksWidget";
import ApprovalsWidget from "@/components/widgets/ApprovalsWidget";
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

/**
 * Single source of truth for every dashboard widget. `image` is a branding
 * photo used as a designed element inside the widget and in the add-picker.
 */
export const WIDGETS = {
  giulia:     { type: "giulia",     label: "Giulia · je dag",     icon: Sparkles,       Component: GiuliaWidget,    image: IMAGES.bootPhone,        span: 8, category: "core" },
  agenda:     { type: "agenda",    label: "Agenda",              icon: Calendar,       Component: AgendaWidget,    image: IMAGES.walkChairsBeach,  span: 4, category: "core" },
  tasks:      { type: "tasks",     label: "Taken",               icon: CheckSquare,    Component: TasksWidget,     image: IMAGES.feetChairs,       span: 4, category: "work" },
  approvals:  { type: "approvals",  label: "Goedkeuringen",       icon: ClipboardCheck, Component: ApprovalsWidget, image: IMAGES.leanChair,        span: 4, category: "work" },
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
};

export const WIDGET_LIST = Object.values(WIDGETS);