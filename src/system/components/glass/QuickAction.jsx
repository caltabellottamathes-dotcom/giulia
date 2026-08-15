import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import {
  Plus, Home, Calendar, CalendarDays, Briefcase, CheckSquare, Mail, MessageCircle,
  BookOpen, FileText, Users, MessageSquare, Mic, ClipboardCheck,
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

export default function QuickAction() {
  const [open, setOpen] = useState(false);
  const { openModule } = usePanel();

  const handleNav = (key) => {
    setOpen(false);
    openModule(key);
  };

  return (
    <>
      {/* Floating plus button — bottom center, opens the navigation menu */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 lg:bottom-7 lg:right-7 z-30 h-12 w-12 lg:h-14 lg:w-14 rounded-full glass-2 float-shadow flex items-center justify-center text-ivory transition-all duration-300 hover:scale-105 group"
        aria-label="Menu openen"
      >
        <Plus className="h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <FloatingPanel open={open} onClose={() => setOpen(false)} position="bottom" level={3}>
        <div className="p-6 lg:p-8 text-ivory max-h-[78vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/60 mb-1">Menu</p>
              <h2 className="text-lg font-heading font-light">Navigatie</h2>
            </div>
            <button
              onClick={() => setOpen(false)}
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
                      onClick={() => setOpen(false)}
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