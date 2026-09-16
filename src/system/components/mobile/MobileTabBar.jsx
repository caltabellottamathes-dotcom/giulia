import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarDays, ListTodo, Sparkles, LayoutGrid, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanel } from "@/lib/PanelContext";
import { useActiveDomain } from "@/lib/useActiveDomain";

/**
 * MobileTabBar — de énige navigatie op mobiel (<lg). Minimale hybride
 * glass-balk: vier hoofdbestemmingen, Meer (QuickLauncher) en een
 * opvallende Giulia-chatknop rechts. Desktop gebruikt de WorkspaceToolbar;
 * deze balk bestaat daar niet (lg:hidden).
 */
const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/tasks", label: "Taken", icon: ListTodo },
  { to: "/life", label: "Life", icon: Sparkles },
];

const glassStyle = {
  background: "rgba(120,122,128,0.10)",
  backdropFilter: "blur(30px) saturate(1.4)",
  WebkitBackdropFilter: "blur(30px) saturate(1.4)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 18px 40px -16px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.18)",
};

export default function MobileTabBar() {
  const { pathname } = useLocation();
  const { openChat } = usePanel();
  const { accent } = useActiveDomain();

  // Op projectdetail-pagina's neemt het project zelf de bottom bar over.
  if (/^\/projects\/[^/]+/.test(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-3 h-[3.75rem] rounded-full glass flex items-stretch pl-1.5 pr-1.5" style={glassStyle}>
        {TABS.map((t) => {
          const active = t.end ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              aria-label={t.label}
              className="flex-1 flex flex-col items-center justify-center gap-1 rounded-full transition-colors"
            >
              <span className="flex items-center justify-center" style={active ? { color: accent } : undefined}>
                <Icon className={cn("h-[18px] w-[18px]", !active && "text-foreground/50")} strokeWidth={active ? 2.2 : 1.7} />
              </span>
              <span className={cn("text-[9px] font-bold uppercase tracking-[0.12em] leading-none", active ? "text-foreground" : "text-foreground/45")}>
                {t.label}
              </span>
            </NavLink>
          );
        })}

        <span aria-hidden className="my-3.5 w-px shrink-0 bg-white/20" />

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("giulia:open-launcher"))}
          aria-label="Meer navigatie"
          title="Meer"
          className="flex-1 flex flex-col items-center justify-center gap-1 rounded-full transition-colors"
        >
          <LayoutGrid className="h-[18px] w-[18px] text-foreground/50" strokeWidth={1.7} />
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] leading-none text-foreground/45">Meer</span>
        </button>

        <button
          onClick={openChat}
          aria-label="Chat met Giulia"
          title="Chat met Giulia"
          className="my-1.5 ml-1.5 h-[3rem] w-[3rem] shrink-0 rounded-full bg-charcoal border border-white/20 flex items-center justify-center text-ivory shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.9} />
        </button>
      </div>
    </nav>
  );
}