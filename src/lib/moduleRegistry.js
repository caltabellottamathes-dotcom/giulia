import {
  Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity as ActivityIcon, Brain, Plug, Settings as SettingsIcon, User, Telescope, Cpu, Timer, Sparkles, Sunrise, Bell, Heart, CalendarHeart, Home, ClipboardList, Palette, HelpCircle, Repeat, Target, Clock, Image as ImageIcon, Music, Video, Utensils,
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
import SocialPage from "@/life/pages/SocialPage";
import HouseholdPage from "@/life/pages/HouseholdPage";
import PersonalAdminPage from "@/life/pages/PersonalAdminPage";
import HobbiesPage from "@/life/pages/HobbiesPage";
import FoodPage from "@/life/pages/FoodPage";
import WantsToKnow from "@/giulia/pages/WantsToKnow";
import DailyStatePanel from "@/self/panels/DailyStatePanel";
import PersonalDevelopmentPanel from "@/self/panels/PersonalDevelopmentPanel";
import ImageViewerPanel from "@/system/panels/viewers/ImageViewerPanel";
import VideoPlayerPanel from "@/system/panels/viewers/VideoPlayerPanel";
import MusicPlayerPanel from "@/system/panels/viewers/MusicPlayerPanel";
import DocViewerPanel from "@/system/panels/viewers/DocViewerPanel";

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
  social:        { label: "Social",             icon: Heart,           Component: SocialPage,         panelWidth: 760 },
  household:     { label: "Huishouden",         icon: Home,            Component: HouseholdPage,      panelWidth: 760 },
  personaladmin: { label: "Persoonlijk Admin",  icon: ClipboardList,   Component: PersonalAdminPage,  panelWidth: 760 },
  hobbies:       { label: "Hobby's",            icon: Palette,         Component: HobbiesPage,        panelWidth: 760 },
  food:          { label: "Food",               icon: Utensils,         Component: FoodPage,          panelWidth: 760 },
  wantstoknow:   { label: "Wants to know",       icon: HelpCircle,      Component: WantsToKnow,        panelWidth: 760 },
  dailystate:        { label: "Daily State",       icon: ActivityIcon,    Component: DailyStatePanel,           panelWidth: 760 },
  development:      { label: "Development",       icon: Target,          Component: PersonalDevelopmentPanel,  panelWidth: 760 },
  imageviewer:       { label: "Afbeeldingen",       icon: ImageIcon,       Component: ImageViewerPanel,          panelWidth: 1000 },
  videoplayer:       { label: "Video",              icon: Video,           Component: VideoPlayerPanel,          panelWidth: 1000 },
  musicplayer:       { label: "Muziek",             icon: Music,           Component: MusicPlayerPanel,          panelWidth: 760 },
  docviewer:         { label: "Document",           icon: FileText,        Component: DocViewerPanel,            panelWidth: 1000 },
};