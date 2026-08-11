import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import {
  Plus, Phone, MessageSquare, Home, Calendar, CalendarDays, Briefcase, CheckSquare,
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
  "h-10 w-10 rounded-full flex items-center justify-center text-ivory/85 hover:bg-ivory/15 hover:text-ivory transition-colors shrink-0";

/**
 * InteractionBar — a permanent glass command panel anchored to the bottom.
 * Uses the exact widget glass treatment (rgba(48,50,55,0.18) + blur + accent
 * strip) so it reads as part of the same material as the dashboard tiles.
 * A subtle text field sends what you type straight into the Giulia chat, plus
 * three integrated actions: ＋ (quick navigation), Telefoon (voice), Chat.
 */
export default function InteractionBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { openModule, openChat, setPendingMessage } = usePanel();

  const handleNav = (key) => {
    setMenuOpen(false);
    openModule(key);
  };

  const submit = (e) => {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    setQuery("");
    setPendingMessage(text);
    openChat();
  };

  return (
    <>
      <div
        className="fixed z-30 bottom-[4.75rem] inset-x-3 lg:bottom-0 lg:inset-x-auto lg:right-10 lg:w-[560px] flex items-center gap-2 px-4 py-3 text-ivory overflow-hidden border border-current/10 ring-1 ring-inset ring-white/10 rounded-[24px] lg:rounded-t-[24px] lg:rounded-b-none animate-fade-up"
        style={{
          background: "rgba(48,50,55,0.18)",
          backdropFilter: "blur(22px) saturate(1.35)",
          WebkitBackdropFilter: "blur(22px) saturate(1.35)",
          boxShadow: "0 28px 64px -26px rgba(0,0,0,0.42), inset 0 1px 0 0 rgba(255,255,255,0.14)",
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "hsl(var(--sand))" }}
        />
        <form onSubmit={submit} className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vraag Giulia anything…"
            className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/45 focus:outline-none"
          />
        </form>
        <span className="h-6 w-px bg-ivory/15 shrink-0" />
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