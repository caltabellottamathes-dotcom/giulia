import {
  Sparkles, Calendar, CheckSquare, ClipboardCheck, Mail, MessageCircle,
  Briefcase, BookOpen, Users, FileText, Brain, Activity as ActivityIcon,
} from "lucide-react";

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
import ActivityWidget from "@/components/widgets/ActivityWidget";

/**
 * Single source of truth for every dashboard widget.
 * `w` = tile width on the spatial canvas (px). `glass` = suggested treatment
 * ("opaque" | "card" | "translucent") so tiles vary between solid and airy.
 */
export const WIDGETS = {
  giulia:     { type: "giulia",     label: "Giulia · je dag", icon: Sparkles,       Component: GiuliaWidget,    w: 360, span: 8, category: "core" },
  agenda:     { type: "agenda",    label: "Agenda",           icon: Calendar,       Component: AgendaWidget,    w: 300, span: 4, category: "core" },
  tasks:      { type: "tasks",     label: "Taken",            icon: CheckSquare,    Component: TasksWidget,     w: 320, span: 4, category: "work" },
  approvals:  { type: "approvals",  label: "Goedkeuringen",    icon: ClipboardCheck, Component: ApprovalsWidget, w: 300, span: 4, category: "work" },
  email:      { type: "email",      label: "Email",           icon: Mail,           Component: EmailWidget,      w: 340, span: 4, category: "comms" },
  whatsapp:   { type: "whatsapp",   label: "WhatsApp",        icon: MessageCircle,  Component: WhatsAppWidget,  w: 310, span: 4, category: "comms" },
  projects:   { type: "projects",   label: "Projecten",       icon: Briefcase,      Component: ProjectsWidget,   w: 380, span: 5, category: "work" },
  knowledge:  { type: "knowledge",  label: "Kennisbank",       icon: BookOpen,       Component: KnowledgeWidget,  w: 310, span: 4, category: "work" },
  people:     { type: "people",     label: "Mensen",          icon: Users,          Component: PeopleWidget,     w: 280, span: 3, category: "work" },
  documents:  { type: "documents",  label: "Documenten",       icon: FileText,       Component: DocumentsWidget,  w: 300, span: 4, category: "work" },
  memory:     { type: "memory",     label: "Geheugen",         icon: Brain,          Component: MemoryWidget,     w: 300, span: 4, category: "intelligence" },
  activity:   { type: "activity",   label: "Activiteit",       icon: ActivityIcon,   Component: ActivityWidget,   w: 350, span: 6, category: "intelligence" },
};

export const WIDGET_LIST = Object.values(WIDGETS);