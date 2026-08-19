import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarDays, ListTodo, FolderKanban, Sparkles, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/agenda", label: "What's Happening?", icon: CalendarDays },
  { to: "/tasks", label: "To Do!", icon: ListTodo },
  { to: "/projects", label: "What I'm Building.", icon: FolderKanban },
  { to: "/life", label: "LIFE", icon: Sparkles },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  // Op projectdetail-pagina's neemt het project zelf de bottom bar over.
  if (/^\/projects\/[^/]+/.test(pathname)) return null;

  return (
    <nav className="fixed bottom-3 left-3 lg:bottom-5 lg:left-10 z-20">
      <div className="flex items-center gap-0.5 rounded-full glass-1 border border-foreground/12 px-1.5 py-1.5 shadow-[0_14px_36px_-14px_rgba(0,0,0,0.28)]">
        {PRIMARY.map((l) => {
          const active = l.end ? pathname === l.to : pathname.startsWith(l.to);
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              aria-label={l.label}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-full px-1.5 sm:px-3.5 py-1.5 transition-colors",
                active ? "text-olive" : "text-foreground/55 hover:text-foreground"
              )}
            >
              <Icon className="h-4 sm:h-[17px] w-4 sm:w-[17px]" strokeWidth={active ? 2.3 : 1.7} />
              <span className="hidden sm:block text-[8.5px] uppercase tracking-[0.14em] font-semibold leading-none">{l.label}</span>
            </NavLink>
          );
        })}
        {/* Meer — opent de QuickLauncher (volledige navigatie) */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("giulia:open-launcher"))}
          aria-label="Meer navigatie"
          className="hidden sm:flex flex-col items-center justify-center gap-1 rounded-full px-3.5 py-1.5 text-foreground/55 hover:text-foreground transition-colors"
        >
          <LayoutGrid className="h-[17px] w-[17px]" strokeWidth={1.7} />
          <span className="text-[8.5px] uppercase tracking-[0.14em] font-semibold leading-none">Meer</span>
        </button>
      </div>
    </nav>
  );
}