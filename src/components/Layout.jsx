import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import QuickAction from "@/components/glass/QuickAction";
import ModulePanel from "@/components/panels/ModulePanel";
import SidebarPanel from "@/components/SidebarPanel";
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
];

function SidebarContent({ onNavigate }) {
  const { activeModule, openModule } = usePanel();

  return (
    <div className="flex flex-col h-full py-6 px-3.5">
      {/* Minimal monogram — no website wordmark */}
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <span className="h-8 w-8 rounded-xl glass-1 flex items-center justify-center font-display text-lg font-medium text-foreground">
          G
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
          Giulia OS
        </span>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className="space-y-0.5">
            {section.label && (
              <p className="px-3 mb-1.5 text-[9px] uppercase tracking-[0.24em] text-muted-foreground/45">
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
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-300 relative group",
                      isActive
                        ? "glass-1 text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-sienna" />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ) : (
                <button
                  key={item.key}
                  onClick={() => { openModule(item.key); onNavigate?.(); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-300 relative",
                    activeModule === item.key
                      ? "glass-1 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                  )}
                >
                  {activeModule === item.key && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-sienna" />
                  )}
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            )}
          </div>
        ))}
      </nav>
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
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { openModule } = usePanel();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Editorial photographic backdrop — visible through the grey glass */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${IMAGES.feetChair})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.42,
          filter: "blur(2px) saturate(1.02)",
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-warm-white/25 via-warm-white/5 to-warm-white/40" />

      {/* Floating glass dock — slides from the left */}
      <SidebarPanel open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <SidebarContent onNavigate={() => setSidebarOpen(false)} />
      </SidebarPanel>

      {/* Main workspace — shifts to make room for the dock on desktop */}
      <div
        className={cn(
          "flex flex-col min-h-screen relative transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          sidebarOpen ? "lg:pl-[268px]" : "lg:pl-2"
        )}
      >
        {/* OS status bar — slim, graphic */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="h-9 w-9 rounded-xl glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 glass-1 rounded-full px-4 py-1.5 flex-1 max-w-sm">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search.trim() && navigate("/search")}
                placeholder="Zoek in alles..."
                className="bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-sienna animate-pulse-soft" />
              Giulia actief
            </div>
            <button
              onClick={() => openModule("approvals")}
              className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-sienna" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 pl-0.5 pr-1 h-9 rounded-full glass-1 hover:ring-2 hover:ring-ring/20 transition-all">
                  <span className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                    <img
                      src={IMAGES.portraitThinking}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass-2 border-border/40">
                {userMenuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    onClick={() => openModule(item.key)}
                    className="gap-2.5 text-[13px]"
                  >
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
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

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1440px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Floating quick action */}
      <QuickAction />

      {/* The single sliding module panel (right edge) */}
      <ModulePanel />
    </div>
  );
}