import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarDays, ListTodo, FolderKanban, Sparkles, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveDomain } from "@/lib/useActiveDomain";

const PRIMARY = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/agenda", label: "What's Happening?", icon: CalendarDays },
  { to: "/tasks", label: "To Do!", icon: ListTodo },
  { to: "/projects", label: "What I'm Building.", icon: FolderKanban },
  { to: "/life", label: "LIFE", icon: Sparkles },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { accent } = useActiveDomain();
  const [collapsed, setCollapsed] = useState(false);
  // Op projectdetail-pagina's neemt het project zelf de bottom bar over.
  if (/^\/projects\/[^/]+/.test(pathname)) return null;

  const tintBg = `color-mix(in srgb, ${accent} 7%, transparent)`;
  const tintBorder = `color-mix(in srgb, ${accent} 30%, transparent)`;

  return (
    <nav className="fixed bottom-3 left-3 lg:bottom-5 lg:left-10 z-20 flex items-center gap-2">
      {/* Toggle — zwevende glazen knop, blijft altijd zichtbaar */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Navigatie tonen" : "Navigatie verbergen"}
        className="h-6 w-6 rounded-full glass-1 border border-foreground/10 flex items-center justify-center shrink-0 shadow-[0_14px_36px_-14px_rgba(0,0,0,0.28)] text-foreground/60 hover:text-foreground transition-colors"
        style={{ background: tintBg, borderColor: tintBorder }}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Zwevende glazen pill — schuift horizontaal in/uit */}
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-full glass-1 border border-foreground/10 px-1.5 h-6 shadow-[0_14px_36px_-14px_rgba(0,0,0,0.28)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left",
          collapsed ? "-translate-x-[calc(100%+0.5rem)] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        )}
        style={{ background: tintBg, borderColor: tintBorder }}
      >
        {PRIMARY.map((l) => {
          const active = l.end ? pathname === l.to : pathname.startsWith(l.to);
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              title={l.label}
              aria-label={l.label}
              className={cn(
                "flex items-center justify-center rounded-full px-2.5 transition-colors",
                active ? "" : "text-foreground/55 hover:text-foreground"
              )}
              style={active ? { color: accent } : undefined}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.3 : 1.7} />
            </NavLink>
          );
        })}
        {/* Meer — opent de QuickLauncher (volledige navigatie) */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("giulia:open-launcher"))}
          title="Meer"
          aria-label="Meer navigatie"
          className="hidden sm:flex items-center justify-center rounded-full px-2.5 text-foreground/55 hover:text-foreground transition-colors"
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={1.7} />
        </button>
      </div>
    </nav>
  );
}