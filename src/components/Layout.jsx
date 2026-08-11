import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import QuickAction from "@/components/glass/QuickAction";
import ModulePanel from "@/components/panels/ModulePanel";
import ChatWindow from "@/components/panels/ChatWindow";
import { PanelProvider, usePanel } from "@/lib/PanelContext";
import { GiuliaVoiceProvider } from "@/lib/GiuliaVoiceContext";
import AmbientBloom from "@/components/glass/AmbientBloom";
import { GiuliaAgentProvider } from "@/lib/GiuliaAgentContext";
import GiuliaAgentButton from "@/components/giulia/GiuliaAgentButton";
import GiuliaAgentPanel from "@/components/giulia/GiuliaAgentPanel";
import BottomNav from "@/components/BottomNav";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import {
  Plug, Settings, User, Search, Bell, ChevronDown, LogOut, Phone,
} from "lucide-react";

const userMenuItems = [
  { key: "profile", icon: User, label: "Profile" },
  { key: "settings", icon: Settings, label: "Settings" },
  { key: "integrations", icon: Plug, label: "Integrations" },
];

export default function Layout() {
  return (
    <PanelProvider>
      <GiuliaVoiceProvider>
        <GiuliaAgentProvider>
          <LayoutInner />
        </GiuliaAgentProvider>
      </GiuliaVoiceProvider>
    </PanelProvider>
  );
}

function LayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const { openModule } = usePanel();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen relative">
      <AmbientBloom />
      {/* Full-width workspace — navigation lives in the bottom plus-button menu */}
      <div className="flex flex-col h-screen relative overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 h-14 shrink-0 flex items-center justify-between px-5 lg:px-10 bg-transparent">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 shrink-0 pr-1 group"
              aria-label="Naar dashboard"
            >
              <span className="h-2.5 w-2.5 rounded-sm bg-charcoal transition-transform group-hover:scale-110" />
              <span className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase group-hover:text-foreground transition-colors">
                Giulia
              </span>
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-foreground/60 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Giulia actief
            </div>
            <button
              onClick={() => openModule("voice")}
              className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Bel Giulia"
            >
              <Phone className="h-4 w-4" />
            </button>
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 lg:px-10 pt-6 lg:pt-8 pb-24 w-full">
          <div key={location.pathname} className="animate-route-fade">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom plus-button — opens the navigation menu */}
      <QuickAction />

      {/* The single sliding glass panel that hosts every module */}
      <ModulePanel />

      {/* Dedicated chat window — the Giulia agent */}
      <ChatWindow />

      {/* Platform agent — floating conversational panel with tool access */}
      <GiuliaAgentButton />
      <GiuliaAgentPanel />

      {/* Bottom page navigation — always visible on every page */}
      <BottomNav />
    </div>
  );
}