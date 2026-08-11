import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import {
  Search, Plus, Phone, MessageSquare, Home, Calendar, CalendarDays, Briefcase, CheckSquare,
  Mail, MessageCircle, BookOpen, FileText, Users, Mic, ClipboardCheck,
  Activity, Brain, Plug, Settings, User,
} from "lucide-react";

const navSections = [
  {
    label: null,
    items: [
      { key: "home", to: "/", icon: Home, label: "Home" },
      { key: "agenda", icon: Calendar, label: "Agenda" },
      { key: "planning", to: "/planning", icon: CalendarDays, label: "Planning" },
      { key: "projects", icon: Briefcase, label: "Projects" },
      { key: "tasks", icon: CheckSquare, label: "Tasks" },
      { key: "email", icon: Mail, label: "Email" },
      { key: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
      { key: "knowledge", icon: BookOpen, label: "Knowledge" },
      { key: "documents", icon: FileText, label: "Documents" },
      { key: "people", icon: Users, label: "People" },
    ],
  },
  { label: "Giulia", items: [
    { key: "chat", icon: MessageSquare, label: "Chat" },
    { key: "voice", icon: Mic, label: "Voice" },
  ] },
  { label: "Intelligence", items: [
    { key: "approvals", icon: ClipboardCheck, label: "Approvals" },
    { key: "activity", icon: Activity, label: "Activity" },
    { key: "memory", icon: Brain, label: "Memory" },
  ] },
  { label: "System", items: [
    { key: "integrations", icon: Plug, label: "Integrations" },
    { key: "settings", icon: Settings, label: "Settings" },
    { key: "profile", icon: User, label: "Profile" },
  ] },
];

const actionBtn =
  "h-11 w-11 rounded-full flex items-center justify-center text-ivory/90 hover:bg-ivory/15 hover:text-ivory transition-colors shrink-0";

/**
 * InteractionBar — a permanent, minimal glass command bar anchored to the
 * bottom-right. A text search field plus three integrated actions: ＋ (quick
 * navigation), Telefoon (voice call with Giulia), Chat (textual interaction).
 */
export default function InteractionBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { openModule, openChat } = usePanel();
  const navigate = useNavigate();

  const handleNav = (key) => {
    setMenuOpen(false);
    openModule(key);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setQuery("");
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 lg:bottom-8 lg:right-8 z-30 flex items-center gap-1 glass-2 float-shadow rounded-full p-2 pl-4 w-[min(92vw,540px)]">
        <form onSubmit={submitSearch} className="flex items-center gap-2 flex-1 min-w-0 pl-2">
          <Search className="h-4 w-4 text-ivory/55 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek in alles…"
            className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/45 focus:outline-none"
          />
        </form>
        <span className="h-7 w-px bg-ivory/15 shrink-0" />
        <button onClick={() => setMenuOpen(true)} aria-label="Snelle acties" className={actionBtn}>
          <Plus className="h-5 w-5" />
        </button>
        <button onClick={() => openModule("voice")} aria-label="Bel Giulia" className={actionBtn}>
          <Phone className="h-5 w-5" />
        </button>
        <button onClick={openChat} aria-label="Chat met Giulia" className={actionBtn}>
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>

      <FloatingPanel open={menuOpen} onClose={() => setMenuOpen(false)} position="bottom" level={3}>
        <div className="p-6 lg:p-8 text-ivory max-h-[78vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/60 mb-1">Menu</p>
              <h2 className="text-lg font-heading font-light">Navigatie</h2>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="h-8 w-8 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
              aria-label="Sluiten"
            >
              <Plus className="h-4 w-4 rotate-45" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-4">
            {navSections.map((section, si) => (
              <div key={si} className="space-y-1">
                {section.label && (
                  <p className="px-2 mb-1 text-[10px] uppercase tracking-[0.24em] text-ivory/70 font-semibold">
                    {section.label}
                  </p>
                )}
                {section.items.map((item) =>
                  item.to ? (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      end
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-300 font-medium",
                          isActive ? "glass-1 text-ivory" : "text-ivory/85 hover:text-ivory hover:bg-ivory/[0.07]"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ) : (
                    <button
                      key={item.key}
                      onClick={() => handleNav(item.key)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-300 font-medium text-ivory/85 hover:text-ivory hover:bg-ivory/[0.07]"
                    >
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </FloatingPanel>
    </>
  );
}