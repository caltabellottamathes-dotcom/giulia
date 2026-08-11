import { NavLink, useLocation } from "react-router-dom";

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

export default function BottomNav() {
  const { pathname } = useLocation();
  // On individual project pages the project's own tabs take over the bottom bar.
  if (/^\/projects\/[^/]+/.test(pathname)) return null;
  return (
    <nav className="fixed bottom-5 left-5 lg:left-10 z-20">
      <div className="flex items-center gap-x-4 gap-y-1.5 overflow-x-auto max-w-[calc(100vw-5.5rem)] lg:max-w-none lg:flex-wrap py-1">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `text-[10px] uppercase tracking-[0.16em] font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-olive" : "text-foreground/50 hover:text-foreground"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}