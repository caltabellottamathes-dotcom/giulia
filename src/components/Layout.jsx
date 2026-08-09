import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import QuickAction from "@/components/glass/QuickAction";
import FloatingPanel from "@/components/glass/FloatingPanel";
import ChatWindow from "@/components/panels/ChatWindow";
import GlowButton from "@/components/glass/GlowButton";
import { PanelProvider, usePanel } from "@/lib/PanelContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import {
  Home, Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity, Brain, Plug, Settings, User, Search, Bell, Telescope,
  Menu, LogOut, ChevronDown, Phone,
} from "lucide-react";

const userMenuItems = [
  { key: "profile", icon: User, label: "Profile" },
  { key: "settings", icon: Settings, label: "Settings" },
  { key: "integrations", icon: Plug, label: "Integrations" },
];

const navSections = [
  {
    label: null,
    items: [
      { key: "home", to: "/", icon: Home, label: "Home" },
      { key: "agenda", to: "/agenda", icon: Calendar, label: "Agenda" },
      { key: "projects", to: "/projects", icon: Briefcase, label: "Projects" },
      { key: "tasks", to: "/tasks", icon: CheckSquare, label: "Tasks" },
      { key: "email", to: "/email", icon: Mail, label: "Email" },
      { key: "whatsapp", to: "/whatsapp", icon: MessageCircle, label: "WhatsApp" },
      { key: "knowledge", to: "/knowledge", icon: BookOpen, label: "Knowledge" },
      { key: "documents", to: "/documents", icon: FileText, label: "Documents" },
      { key: "people", to: "/people", icon: Users, label: "People" },
    ],
  },
  {
    label: "Giulia",
    items: [
      { key: "chat", to: "/chat", icon: MessageSquare, label: "Chat" },
      { key: "voice", to: "/voice", icon: Mic, label: "Voice" },
      { key: "insights", to: "/insights", icon: Telescope, label: "Inzichten" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { key: "approvals", to: "/approvals", icon: ClipboardCheck, label: "Approvals" },
      { key: "activity", to: "/activity", icon: Activity, label: "Activity" },
      { key: "memory", to: "/memory", icon: Brain, label: "Memory" },
    ],
  },
  {
    label: "System",
    items: [
      { key: "integrations", to: "/integrations", icon: Plug, label: "Integrations" },
      { key: "settings", to: "/settings", icon: Settings, label: "Settings" },
      { key: "profile", to: "/profile", icon: User, label: "Profile" },
    ],
  },
];

function SidebarContent({ onNavigate }) {
  const { openChat } = usePanel();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full py-8 px-5">
      {/* Wordmark — click → home */}
      <button onClick={() => { navigate("/"); onNavigate?.(); }} className="px-2 mb-10 text-left">
        <p className="font-display font-semibold tracking-[-0.01em] text-2xl text-foreground leading-none">Giulia</p>
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/45 mt-1.5 font-medium">Assistent</p>
      </button>

      {/* Navigation — every item navigates to its page */}
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className="space-y-1">
            {section.label && (
              <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.24em] text-foreground/40 font-semibold">{section.label}</p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.to === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[15px] transition-all duration-300 relative font-medium",
                    isActive ? "glass-1 text-foreground" : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.03]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-olive" />}
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Cool glowing Chat + Call buttons — with light */}
      <div className="mt-5 space-y-2.5">
        <GlowButton block icon={MessageSquare} tone="sand" label="Chat met Giulia" sublabel="Stel een vraag" onClick={() => { openChat(); onNavigate?.(); }} />
        <GlowButton block icon={Phone} tone="olive" label="Bel Giulia" sublabel="Meteen bellen" onClick={() => { navigate("/voice"); onNavigate?.(); }} />
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <PanelProvider>
      <LayoutInner />
    </PanelProvider>
  );
}

function LayoutInner() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const { openChat, openModule } = usePanel();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen relative">
      <div className="flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setNavOpen(true)} className="p-1.5 -ml-1.5 rounded-lg glass-1 text-foreground transition-colors shrink-0" aria-label="Menu openen">
              <Menu className="h-5 w-5" />
            </button>
            {/* Brand — click → home */}
            <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0 pr-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-charcoal" />
              <span className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase">Giulia</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 glass-1 rounded-full px-4 py-1.5 flex-1 max-w-sm">
              <Search className="h-3.5 w-3.5 text-foreground/55 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search.trim() && navigate("/search")}
                placeholder="Zoek in alles..."
                className="bg-transparent text-sm placeholder:text-foreground/45 focus:outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Cool glowing Chat + Call — with light */}
            <GlowButton icon={MessageSquare} tone="sand" label="Chat met Giulia" onClick={openChat} />
            <GlowButton icon={Phone} tone="olive" label="Bel Giulia" onClick={() => navigate("/voice")} />
            <button
              onClick={() => navigate("/approvals")}
              className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors relative"
              aria-label="Meldingen"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-olive" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 pl-0.5 pr-1 h-9 rounded-full border border-border/40 hover:ring-2 hover:ring-ring/20 transition-all glass-1">
                  <span className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                    <img src={IMAGES.portraitThinking} alt="Profile" className="h-full w-full object-cover" />
                  </span>
                  <ChevronDown className="h-3 w-3 text-foreground/55" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-2 border-border/40">
                {userMenuItems.map((item) => (
                  <DropdownMenuItem key={item.key} onClick={() => openModule(item.key)} className="gap-2.5 text-[13px]">
                    <item.icon className="h-3.5 w-3.5 text-foreground/60" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="gap-2.5 text-[13px] text-destructive">
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Workspace content — page slides in on navigation */}
        <main className="flex-1 px-5 lg:px-10 py-6 lg:py-8 pb-24 lg:pb-8 max-w-[1440px] mx-auto w-full">
          <div key={location.pathname} className="page-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Left-sliding glass nav panel */}
      <FloatingPanel open={navOpen} onClose={() => setNavOpen(false)} position="left" level={3}>
        <SidebarContent onNavigate={() => setNavOpen(false)} />
      </FloatingPanel>

      {/* Universal quick action — glowing orb */}
      <QuickAction />

      {/* Dedicated chat window — the Giulia agent */}
      <ChatWindow />

      {/* Mobile bottom nav — primary destinations */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-2 border-t border-border/40 flex items-center justify-around px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {[
          { to: "/", icon: Home, label: "Dashboard" },
          { to: "/chat", icon: MessageSquare, label: "Chat" },
          { to: "/email", icon: Mail, label: "Inbox" },
          { to: "/agenda", icon: Calendar, label: "Agenda" },
          { to: "/settings", icon: Settings, label: "Backdesk" },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors",
                isActive ? "text-olive" : "text-foreground/55"
              )
            }
          >
            <item.icon className="h-5 w-5" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}