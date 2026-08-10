import { NavLink } from "react-router-dom";

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
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="px-5 lg:px-10 py-3 pr-20 lg:pr-28 flex items-center gap-x-5 gap-y-1.5 overflow-x-auto lg:overflow-visible lg:flex-wrap">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `text-[11px] uppercase tracking-[0.18em] font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-foreground" : "text-foreground/55 hover:text-foreground"
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