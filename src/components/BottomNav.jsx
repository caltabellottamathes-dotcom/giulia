import { NavLink } from "react-router-dom";
import { Home, Calendar, Briefcase, CheckSquare, Mail } from "lucide-react";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Agenda", to: "/agenda" },
  { label: "Projecten", to: "/projects" },
  { label: "Taken", to: "/tasks" },
  { label: "Email", to: "/email" },
  { label: "WhatsApp", to: "/whatsapp" },
  { label: "Kennisbank", to: "/knowledge" },
  { label: "Documenten", to: "/documents" },
  { label: "Mensen", to: "/people" },
  { label: "Inzichten", to: "/insights" },
  { label: "Backdesk", to: "/settings" },
];

// Mobile tab bar — 5 primary destinations. The rest live in the QuickAction + menu.
const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/projects", label: "Projecten", icon: Briefcase },
  { to: "/tasks", label: "Taken", icon: CheckSquare },
  { to: "/email", label: "Email", icon: Mail },
];

export default function BottomNav() {
  return (
    <>
      {/* Mobile tab bar — floating glass pill */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30">
        <div className="mx-3 mb-3 rounded-[24px] glass-3 float-shadow px-2 py-1.5 flex items-center justify-between">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2 rounded-2xl transition-colors ${
                  isActive ? "text-olive" : "text-foreground/55"
                }`
              }
            >
              <t.icon className="h-5 w-5" strokeWidth={1.75} />
              <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop nav — unchanged */}
      <nav className="hidden lg:block fixed bottom-0 inset-x-0 z-20">
        <div className="px-5 lg:px-10 py-3 pr-20 lg:pr-28 flex items-center gap-x-5 gap-y-1.5 overflow-x-auto lg:overflow-visible lg:flex-wrap">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-[11px] uppercase tracking-[0.18em] font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-olive" : "text-foreground/50 hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}