import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import QuickAction from "@/components/glass/QuickAction";
import {
  Home, Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity, Brain, Plug, Settings, User, Search, Bell, Sparkles,
  Menu, X,
} from "lucide-react";

const navSections = [
  {
    label: null,
    items: [
      { to: "/", icon: Home, label: "Home", end: true },
      { to: "/agenda", icon: Calendar, label: "Agenda" },
      { to: "/projects", icon: Briefcase, label: "Projects" },
      { to: "/tasks", icon: CheckSquare, label: "Tasks" },
      { to: "/email", icon: Mail, label: "Email" },
      { to: "/whatsapp", icon: MessageCircle, label: "WhatsApp" },
      { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
      { to: "/documents", icon: FileText, label: "Documents" },
      { to: "/people", icon: Users, label: "People" },
    ],
  },
  {
    label: "Giulia",
    items: [
      { to: "/chat", icon: MessageSquare, label: "Chat" },
      { to: "/voice", icon: Mic, label: "Voice" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/approvals", icon: ClipboardCheck, label: "Approvals" },
      { to: "/activity", icon: Activity, label: "Activity" },
      { to: "/memory", icon: Brain, label: "Memory" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/integrations", icon: Plug, label: "Integrations" },
      { to: "/settings", icon: Settings, label: "Settings" },
      { to: "/profile", icon: User, label: "Profile" },
    ],
  },
];

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex flex-col h-full py-7 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-9">
        <div className="h-7 w-7 rounded-lg bg-charcoal flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-ivory" />
        </div>
        <span className="text-sm font-semibold tracking-[0.22em] uppercase">
          Giulia
        </span>
      </div>

      {/* Navigation — visually subordinate, quiet */}
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className="space-y-0.5">
            {section.label && (
              <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/40">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-300 relative group",
                    isActive
                      ? "glass-1 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-olive" />
                    )}
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Giulia status — subtle */}
      <div className="glass-1 rounded-xl p-3 flex items-center gap-3 mt-4">
        <div className="relative shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">Giulia actief</p>
          <p className="text-[10px] text-muted-foreground truncate">
            3 acties klaar
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen relative">
      {/* Editorial photographic backdrop — visible through glass */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${IMAGES.feetChair})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.16,
          filter: "blur(8px) saturate(0.85)",
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-warm-white/60 via-transparent to-warm-white/50" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed, transparent on desktop (floats over editorial bg),
          glass drawer on mobile */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[220px] z-50 transition-transform duration-300 lg:z-30 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div
          className={cn(
            "h-full transition-all",
            mobileOpen ? "glass-2" : "bg-transparent"
          )}
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden absolute top-6 right-4 p-1 rounded-md text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="lg:ml-[220px] flex flex-col min-h-screen relative">
        {/* Subtle header */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
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
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Giulia actief
            </div>
            <button
              onClick={() => navigate("/approvals")}
              className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-olive" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="h-9 w-9 rounded-full overflow-hidden border border-border/40 hover:ring-2 hover:ring-ring/20 transition-all"
            >
              <img
                src={IMAGES.portraitThinking}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* Workspace content — max-width so it doesn't stretch infinitely */}
        <main className="flex-1 px-5 lg:px-10 py-6 lg:py-8 max-w-[1440px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Universal quick action — floating, detached */}
      <QuickAction />
    </div>
  );
}