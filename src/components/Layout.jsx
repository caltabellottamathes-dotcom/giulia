import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import {
  Home, Calendar, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
  Activity, Brain, Plug, Settings, User, Search, Bell, Plus,
  Sparkles, ChevronLeft, ChevronRight, X,
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

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 flex flex-col border-r border-border/60 bg-background/70 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded-lg bg-charcoal flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-ivory" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-[0.2em] uppercase">Giulia</span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded-md hover:bg-foreground/5 transition-colors text-muted-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-foreground/5 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, si) => (
            <div key={si} className="space-y-1">
              {section.label && !collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-300 group relative",
                      collapsed && "justify-center",
                      isActive
                        ? "glass-1 text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-olive" />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Giulia status */}
        <div className="p-3 border-t border-border/40">
          <div className={cn("glass-1 rounded-xl p-3 flex items-center gap-3", collapsed && "justify-center")}>
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-olive/40 to-blue-grey/30 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">Giulia actief</p>
                <p className="text-[10px] text-muted-foreground truncate">3 acties klaar</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"
        >
          <Home className="h-5 w-5" />
        </button>
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search.trim() && navigate("/search")}
            placeholder="Zoek in alles..."
            className="w-full glass-1 rounded-xl pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-olive/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/chat")}
          className="glass-button h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground"
          title="Vraag Giulia"
        >
          <Sparkles className="h-4 w-4" />
        </button>
        <button className="glass-button h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-olive" />
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="h-9 w-9 rounded-xl overflow-hidden border border-border/60 hover:ring-2 hover:ring-ring/20 transition-all"
        >
          <img src={IMAGES.portraitThinking} alt="Profile" className="h-full w-full object-cover" />
        </button>
      </div>
    </header>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle editorial texture background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url(${IMAGES.feetChair})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={cn("transition-all duration-300", collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]")}>
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}