import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import QuickAction from "@/components/glass/QuickAction";
import FloatingPanel from "@/components/glass/FloatingPanel";
import ModulePanel from "@/components/panels/ModulePanel";
import { PanelProvider, usePanel } from "@/lib/PanelContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import {
  Home, Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity, Brain, Plug, Settings, User, Search, Bell,
  Menu, LogOut, ChevronDown,
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
      { key: "agenda", icon: Calendar, label: "Agenda" },
      { key: "projects", icon: Briefcase, label: "Projects" },
      { key: "tasks", icon: CheckSquare, label: "Tasks" },
      { key: "email", icon: Mail, label: "Email" },
      { key: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
      { key: "knowledge", icon: BookOpen, label: "Knowledge" },
      { key: "documents", icon: FileText, label: "Documents" },
      { key: "people", icon: Users, label: "People" },
    ],
  },
  {
    label: "Giulia",
    items: [
      { key: "chat", icon: MessageSquare, label: "Chat" },
      { key: "voice", icon: Mic, label: "Voice" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { key: "approvals", icon: ClipboardCheck, label: "Approvals" },
      { key: "activity", icon: Activity, label: "Activity" },
      { key: "memory", icon: Brain, label: "Memory" },
    ],
  },
  {
    label: "System",
    items: [
      { key: "integrations", icon: Plug, label: "Integrations" },
      { key: "settings", icon: Settings, label: "Settings" },
      { key: "profile", icon: User, label: "Profile" },
    ],
  },
];

function SidebarContent({ onNavigate }) {
  const { activeModule, openModule } = usePanel();

  return (
    <div className="flex flex-col h-full py-8 px-5">
      {/* Wordmark — bold editorial type, no icon */}
      <div className="px-2 mb-10">
        <p className="font-display font-semibold tracking-[-0.01em] text-2xl text-foreground leading-none">
          Giulia
        </p>
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/45 mt-1.5 font-medium">
          Concierge OS
        </p>
      </div>

      {/* Navigation — bold, editorial */}
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className="space-y-1">
            {section.label && (
              <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.24em] text-foreground/40 font-semibold">
                {section.label}
              </p>
            )}
            {section.items.map((item) =>
              item.to ? (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[15px] transition-all duration-300 relative font-medium",
                      isActive
                        ? "glass-1 text-foreground"
                        : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.03]"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-olive" />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ) : (
                <button
                  key={item.key}
                  onClick={() => {
                    openModule(item.key);
                    onNavigate?.();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[15px] transition-all duration-300 relative font-medium",
                    activeModule === item.key
                      ? "glass-1 text-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.03]"
                  )}
                >
                  {activeModule === item.key && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-olive" />
                  )}
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            )}
          </div>
        ))}
      </nav>

      {/* Giulia status — no icon */}
      <div className="glass-1 rounded-2xl p-3.5 flex items-center gap-3 mt-5">
        <div className="relative shrink-0">
          <span className="block h-8 w-8 rounded-full bg-emerald-500/15 border border-emerald-500/30" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate">Giulia actief</p>
          <p className="text-[11px] text-foreground/50 truncate">3 acties klaar</p>
        </div>
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
  const [search, setSearch] = useState("");
  const { openModule } = usePanel();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Full-width workspace — the nav now lives in a sliding panel */}
      <div className="flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setNavOpen(true)}
              className="p-1.5 -ml-1.5 rounded-lg glass-1 text-foreground hover:text-foreground transition-colors"
              aria-label="Menu openen"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 glass-1 rounded-full px-4 py-1.5 flex-1 max-w-sm">
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-foreground/60 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Giulia actief
            </div>
            <button
              onClick={() => openModule("approvals")}
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
                    <img
                      src={IMAGES.portraitThinking}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <ChevronDown className="h-3 w-3 text-foreground/55" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-2 border-border/40">
                {userMenuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    onClick={() => openModule(item.key)}
                    className="gap-2.5 text-[13px]"
                  >
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

        {/* Workspace content */}
        <main className="flex-1 px-5 lg:px-10 py-6 lg:py-8 max-w-[1440px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Left-sliding glass nav panel */}
      <FloatingPanel
        open={navOpen}
        onClose={() => setNavOpen(false)}
        position="left"
        level={3}
      >
        <SidebarContent onNavigate={() => setNavOpen(false)} />
      </FloatingPanel>

      {/* Universal quick action — floating, detached */}
      <QuickAction />

      {/* The single sliding glass panel that hosts every module */}
      <ModulePanel />
    </div>
  );
}