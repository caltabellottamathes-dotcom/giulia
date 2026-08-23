import {
  Sparkles, Calendar, CheckSquare, ClipboardCheck, Mail, MessageCircle,
  Briefcase, BookOpen, Users, FileText, Brain, Activity as ActivityIcon, Telescope, Cpu, MessageSquare, Timer, Sunrise, Bell, Heart, CalendarHeart, Home, ClipboardList, Palette, HelpCircle, Repeat, Target, Clock, Image as ImageIcon, Music, Video, Images, Utensils,
} from "lucide-react";
import { IMAGES } from "@/lib/images";

import WhatMattersLayeredWidget from "@/giulia/widgets/new/WhatMattersLayeredWidget";
import GoodMorningWidget from "@/giulia/widgets/new/GoodMorningWidget";
import AgendaFocusWidget from "@/focus/widgets/new/AgendaFocusWidget";
import TasksBloomFocusWidget from "@/focus/widgets/new/TasksBloomFocusWidget";
import WaitingOnYouWidget from "@/giulia/widgets/new/WaitingOnYouWidget";
import NotificationsWidget from "@/focus/widgets/NotificationsWidget";
import EmailFocusWidget from "@/focus/widgets/new/EmailFocusWidget";
import WhatsAppChatFocusWidget from "@/focus/widgets/new/WhatsAppChatFocusWidget";
import ProjectsFocusWidget from "@/focus/widgets/new/ProjectsFocusWidget";
import KnowledgeWidget from "@/focus/widgets/KnowledgeWidget";
import PeopleFocusWidget from "@/focus/widgets/new/PeopleFocusWidget";
import DocumentsWidget from "@/focus/widgets/DocumentsWidget";
import MemoryWidget from "@/giulia/widgets/MemoryWidget";
import WhatIveNoticedWidget from "@/giulia/widgets/new/WhatIveNoticedWidget";
import ActivityWidget from "@/giulia/widgets/ActivityWidget";
import AgentActivityWidget from "@/giulia/widgets/AgentActivityWidget";
import GiuliaConciergeWidget from "@/giulia/widgets/new/GiuliaConciergeWidget";
import TimeTrackerFocusWidget from "@/focus/widgets/new/TimeTrackerFocusWidget";
import UpdatesWidget from "@/giulia/widgets/UpdatesWidget";
import SocialPulseWidget from "@/life/widgets/SocialPulseWidget";
import SocialPlannerWidget from "@/life/widgets/SocialPlannerWidget";
import HouseholdWidget from "@/life/widgets/HouseholdWidget";
import PersonalAdminWidget from "@/life/widgets/PersonalAdminWidget";
import HobbiesWidget from "@/life/widgets/HobbiesWidget";
import FoodWidget from "@/life/widgets/FoodWidget";
import WantsToKnowLayeredWidget from "@/giulia/widgets/new/WantsToKnowLayeredWidget";
import ImAliveWidget from "@/giulia/widgets/new/ImAliveWidget";
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
  giulia:          { type: "giulia",          label: "What Matters?",      icon: Sparkles,       Component: WhatMattersLayeredWidget, image: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/02f6f6d0e_Matters.jpeg", span: 2, category: "core", domain: "giulia" },
  goodmorning:     { type: "goodmorning",     label: "Good Morning!",       icon: Sunrise,        Component: GoodMorningWidget,        image: IMAGES.wGoodMorning,    span: 2, category: "core", domain: "giulia" },
  concierge:       { type: "concierge",       label: "GIULIA'S HOTLINE!",   icon: MessageSquare,  Component: GiuliaConciergeWidget,   image: IMAGES.wHotline,        span: 1, category: "core", domain: "giulia" },
  approvals:       { type: "approvals",       label: "Waiting on You.",     icon: ClipboardCheck, Component: WaitingOnYouWidget,      image: IMAGES.wWaitingOnYou,   span: 2, category: "core", domain: "giulia" },
  imalive:         { type: "imalive",         label: "I'm Alive!",          icon: ActivityIcon,   Component: ImAliveWidget,           image: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/cc3a9d642_Alive.jpeg", span: 2, category: "core", domain: "giulia" },
  memory:          { type: "memory",          label: "What I Remember.",    icon: Brain,          Component: MemoryWidget,           image: IMAGES.loungeChairs,     span: 4, category: "intelligence", domain: "system" },
  activity:        { type: "activity",        label: "I Do Process!",      icon: ActivityIcon,   Component: ActivityWidget,        image: IMAGES.topDownWalk,      span: 6, category: "intelligence", domain: "system" },
  agentactivity:   { type: "agentactivity",   label: "Who's Working?",      icon: Cpu,            Component: AgentActivityWidget,    image: IMAGES.feetChair,        span: 4, category: "intelligence", domain: "system" },
  insights:        { type: "insights",        label: "What I've Noticed.",  icon: Telescope,      Component: WhatIveNoticedWidget,   image: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/74381fdf2_Noticed.jpeg", span: 1, category: "intelligence", domain: "giulia" },
  updates:         { type: "updates",         label: "Meanwhile...",       icon: Sparkles,       Component: UpdatesWidget,          image: IMAGES.feetChair,        span: 3, category: "intelligence", domain: "system" },
  giuliaquestions: { type: "giuliaquestions", label: "Wants to Know!",      icon: HelpCircle,    Component: WantsToKnowLayeredWidget, image: IMAGES.wWantsToKnow,    span: 1, category: "intelligence", domain: "giulia" },

  // ── FOCUS ── (nieuwe Focus-widget-skelet — realtime data + panelen)
  agenda:      { type: "agenda",      label: "What's Happening?",   icon: Calendar,      Component: AgendaFocusWidget,        image: IMAGES.focusHappening, span: 2, category: "core",  domain: "focus" },
  tasks:       { type: "tasks",       label: "To Do!",              icon: CheckSquare,   Component: TasksBloomFocusWidget,     image: IMAGES.focusTodoNew,   span: 1, category: "work",  domain: "focus" },
  projects:    { type: "projects",    label: "What I'm Building.",  icon: Briefcase,     Component: ProjectsFocusWidget,        image: IMAGES.focusBuild,     span: 2, category: "work",  domain: "focus" },
  email:       { type: "email",       label: "Online Postoffice.",  icon: Mail,          Component: EmailFocusWidget,          image: IMAGES.focusMail,      span: 1, category: "comms", domain: "focus" },
  whatsapp:    { type: "whatsapp",    label: "Who's Texting?",      icon: MessageCircle, Component: WhatsAppChatFocusWidget,    image: IMAGES.focusTodo,     span: 2, category: "comms", domain: "focus" },
  people:      { type: "people",      label: "People Around Me.",   icon: Users,         Component: PeopleFocusWidget,         image: IMAGES.focusPeople,    span: 1, category: "work",  domain: "focus" },
  timetracker: { type: "timetracker", label: "Where My Time Goes.", icon: Timer,         Component: TimeTrackerFocusWidget,     image: IMAGES.focusTime,     span: 1, category: "work",  domain: "focus" },

  // ── SYSTEM (knowledge + documents) ──
  knowledge:   { type: "knowledge",   label: "What I Know.",        icon: BookOpen,      Component: KnowledgeWidget,  image: IMAGES.chairWater,       span: 4, category: "work", domain: "system" },
  documents:   { type: "documents",   label: "Files to Share.",     icon: FileText,      Component: DocumentsWidget,  image: IMAGES.chairsScattered,  span: 2, category: "work", domain: "system" },

  // ── LIFE ──
  socialpulse:   { type: "socialpulse",   label: "What Social Life?",   icon: Heart,         Component: SocialPulseWidget,    image: IMAGES.lifeSocialPulse,    span: 4, category: "life", domain: "life" },
  socialplanner: { type: "socialplanner", label: "What Social Life?",   icon: CalendarHeart, Component: SocialPlannerWidget,  image: IMAGES.lifeSocialPlanner,  span: 3, category: "life", domain: "life" },
  household:     { type: "household",     label: "Reminders For Home.", icon: Home,          Component: HouseholdWidget,      image: IMAGES.lifeHousehold,      span: 3, category: "life", domain: "life" },
  personaladmin: { type: "personaladmin", label: "Things to Handle!",  icon: ClipboardList, Component: PersonalAdminWidget,  image: IMAGES.lifePersonalAdmin,  span: 3, category: "life", domain: "life" },
  hobbies:       { type: "hobbies",       label: "Things I Love.",      icon: Palette,        Component: HobbiesWidget,        image: IMAGES.lifeHobbies,        span: 3, category: "life", domain: "life" },
  food:          { type: "food",          label: "What's for Dinner?",  icon: Utensils,       Component: FoodWidget,           image: IMAGES.lifeFood,           span: 2, category: "life", domain: "life" },

  // ── LIFE · gemigreerd uit SELF (Daily State & Development blijven als LIFE-modules) ──
  dailystate:   { type: "dailystate",   label: "How I'm Doing.",  icon: ActivityIcon, Component: DailyStateEditorial,          image: IMAGES.selfDailyState,    span: 1, category: "life", domain: "life" },
  development:  { type: "development",  label: "Becoming Me.",    icon: Target,        Component: PersonalDevelopmentEditorial,  image: IMAGES.selfDevelopment,   span: 2, category: "life", domain: "life" },

  // ── SYSTEM ──
  imageviewer:  { type: "imageviewer",  label: "Afbeeldingen.", icon: ImageIcon, Component: ImageViewerWidget, image: IMAGES.notebookChair, span: 1, category: "system", domain: "system" },
  videoplayer:  { type: "videoplayer",  label: "Video.",        icon: Video,     Component: VideoPlayerWidget, image: IMAGES.bootPhone,      span: 1, category: "system", domain: "system" },
  musicplayer:  { type: "musicplayer",  label: "Muziek.",       icon: Music,     Component: MusicPlayerWidget, image: IMAGES.hourglassJacket, span: 1, category: "system", domain: "system" },
  docviewer:    { type: "docviewer",    label: "Document.",    icon: FileText,  Component: DocViewerWidget,    image: IMAGES.womanFolder,    span: 1, category: "system", domain: "system" },
  notifications:{ type: "notifications", label: "Things to See.", icon: Bell,    Component: NotificationsWidget, image: IMAGES.feetChair,      span: 3, category: "core", domain: "system" },

  // ── BEELDBANK & VOICE ──
  beeldbank:    { type: "beeldbank",    label: "Change the Look!", icon: Images, Component: BeeldbankWidget,  image: IMAGES.feetChair,    span: 2, category: "system", domain: "system" },
};

export const WIDGET_LIST = Object.values(WIDGETS);