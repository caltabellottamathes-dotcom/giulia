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

  const tintBorder = `color-mix(in srgb, ${accent} 30%, transparent)`;
  const glassStyle = {
    borderColor: tintBorder,
    background: "rgba(120,122,128,0.10)",
    backdropFilter: "blur(16px) saturate(1.4)",
    WebkitBackdropFilter: "blur(16px) saturate(1.4)",
    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.18), 0 14px 30px -16px rgba(0,0,0,0.26)"
  };

  return (
    <nav className="fixed bottom-3 left-3 lg:bottom-5 lg:left-10 z-20 flex items-center gap-2">
      {/* Toggle — zwevende glazen knop, blijft altijd zichtbaar */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Navigatie tonen" : "Navigatie verbergen"}
        className="h-8 w-8 rounded-full glass flex items-center justify-center shrink-0 text-foreground/60 hover:text-foreground transition-colors"
        style={glassStyle}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Zwevende glazen pill — schuift horizontaal in/uit */}
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-full glass px-1.5 py-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left",
          collapsed ? "-translate-x-[calc(100%+0.5rem)] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        )}
        style={glassStyle}
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
                "flex items-center justify-center rounded-full px-2 py-1 transition-colors",
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
          className="hidden sm:flex items-center justify-center rounded-full px-2 py-1 text-foreground/55 hover:text-foreground transition-colors"
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={1.7} />
        </button>
      </div>
    </nav>
  );
}