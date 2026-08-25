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
  const glassStyle = { background: tintBg, borderColor: tintBorder, backdropFilter: "blur(16px) saturate(1.15)", WebkitBackdropFilter: "blur(16px) saturate(1.15)" };

  return (
    <nav className="fixed bottom-3 left-3 lg:bottom-5 lg:left-10 z-20 flex items-center gap-2">
      {/* Toggle — zwevende glazen knop, blijft altijd zichtbaar */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Navigatie tonen" : "Navigatie verbergen"}
        className="h-4 w-4 rounded-full glass-1 border border-foreground/10 flex items-center justify-center shrink-0 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.18)] text-foreground/60 hover:text-foreground transition-colors"
        style={glassStyle}
      >
        {collapsed ? <ChevronRight className="h-2.5 w-2.5" /> : <ChevronLeft className="h-2.5 w-2.5" />}
      </button>

      {/* Zwevende glazen pill — schuift horizontaal in/uit */}
      <div
        className={cn(
          "flex items-center gap-0 rounded-full glass-1 border border-foreground/10 px-1 h-4 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.18)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left",
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
                "flex items-center justify-center rounded-full px-1.5 transition-colors",
                active ? "" : "text-foreground/55 hover:text-foreground"
              )}
              style={active ? { color: accent } : undefined}
            >
              <Icon className="h-3 w-3" strokeWidth={active ? 2.3 : 1.7} />
            </NavLink>
          );
        })}
        {/* Meer — opent de QuickLauncher (volledige navigatie) */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("giulia:open-launcher"))}
          title="Meer"
          aria-label="Meer navigatie"
          className="hidden sm:flex items-center justify-center rounded-full px-1.5 text-foreground/55 hover:text-foreground transition-colors"
        >
          <LayoutGrid className="h-3 w-3" strokeWidth={1.7} />
        </button>
      </div>
    </nav>
  );
}