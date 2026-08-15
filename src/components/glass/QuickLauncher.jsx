import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

/**
 * QuickLauncher — de volledige OS-launcher achter de "+" onderaan.
 * Opent de pagina én het bijbehorende paneel. Drie thema-tabbladen
 * (FOCUS / LIFE / SELF) + een rij "Snelle plekken" voor elke overige
 * bestemming. Smooth, met motion.
 */
const THEMES = [
  { key: "focus", label: "FOCUS", blurb: "Werk, communicatie & kennis", categories: ["core", "work", "comms", "intelligence"], accent: "hsl(var(--olive))" },
  { key: "life", label: "LIFE", blurb: "Relaties, huishouden, admin & hobby's", categories: ["life"], accent: "hsl(var(--life-blue-deep))" },
  { key: "self", label: "SELF", blurb: "Rust, zelfzorg & reflectie", categories: ["self"], accent: "hsl(var(--self-burgundy))" },
];

const ROUTES = {
  giulia: "/chat", goodmorning: "/wake", concierge: "/chat", agenda: "/agenda", tasks: "/tasks",
  approvals: "/approvals", notifications: "/notifications", email: "/email", whatsapp: "/whatsapp",
  projects: "/projects", knowledge: "/knowledge", people: "/people", documents: "/documents",
  memory: "/memory", activity: "/activity", agentactivity: "/agents", insights: "/insights",
  timetracker: "/timetracker", updates: "/updates", socialpulse: "/life/social-pulse",
  socialplanner: "/life/social-planner", household: "/life/household", personaladmin: "/life/personal-admin", hobbies: "/life/hobbies",
};

const EXTRA = [
  { label: "LIFE", route: "/life" },
  { label: "Planning", route: "/planning" },
  { label: "Briefing", route: "/briefing" },
  { label: "Wake", route: "/wake" },
  { label: "Insights", route: "/insights" },
  { label: "Agenten", route: "/agents" },
  { label: "Updates", route: "/updates" },
  { label: "Tijd", route: "/timetracker" },
  { label: "Zoeken", route: "/search" },
  { label: "Integraties", route: "/integrations" },
  { label: "Instellingen", route: "/settings" },
  { label: "Profiel", route: "/profile" },
  { label: "Experiment", route: "/experiment" },
];

export default function QuickLauncher({ open, onClose }) {
  const [theme, setTheme] = useState("focus");
  const navigate = useNavigate();
  const { openModule, openChat } = usePanel();
  if (!open) return null;
  const active = THEMES.find((t) => t.key === theme);
  const widgets = WIDGET_LIST.filter((w) => active.categories.includes(w.category));

  const launch = (w) => {
    if (w.type === "concierge" || w.type === "giulia") openChat();
    else openModule(w.type);
    const route = ROUTES[w.type];
    if (route) navigate(route);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[38]" onClick={onClose} />
      <div className="fixed z-[39] bottom-[4.5rem] right-4 lg:right-10 w-[min(380px,calc(100vw-2rem))] max-h-[72vh] animate-scale-in">
        <div className="glass-4 rounded-[24px] overflow-hidden text-ivory border border-white/18 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.55)] flex flex-col max-h-[72vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-ivory/10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
              <span className="text-[11px] uppercase tracking-[0.22em] font-bold text-ivory/70">Alles openen</span>
            </div>
            <button onClick={onClose} className="text-ivory/50 hover:text-ivory transition text-2xl leading-none">×</button>
          </div>

          {/* Theme tabs */}
          <div className="px-4 pt-3 pb-2 shrink-0">
            <div className="flex gap-1.5 p-1 rounded-full glass-card-2">
              {THEMES.map((t) => (
                <button key={t.key} onClick={() => setTheme(t.key)} className={cn("flex-1 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition", theme === t.key ? "text-ivory" : "text-ivory/45 hover:text-ivory/80")} style={theme === t.key ? { background: t.accent } : {}}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Widget tiles */}
          <div className="px-4 pb-3 overflow-y-auto">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/40 font-semibold mb-2">{active.blurb}</p>
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="grid grid-cols-2 gap-2.5">
                {widgets.map((w, i) => (
                  <motion.button
                    key={w.type}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => launch(w)}
                    className="glass-card-2 rounded-xl overflow-hidden text-left group relative hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="relative h-12 overflow-hidden">
                      <img src={w.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                    </div>
                    <div className="px-2.5 py-2 flex items-center justify-between gap-1">
                      <span className="text-[12px] font-semibold text-ivory flex items-center gap-1 min-w-0">
                        {w.icon && <w.icon className="w-3 h-3 opacity-70 shrink-0" />}
                        <span className="truncate">{w.label}</span>
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-ivory/50 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </motion.button>
                ))}
                {!widgets.length && (
                  <div className="col-span-2 glass-card-2 rounded-xl px-4 py-6 text-center">
                    <p className="text-xs text-ivory/45">SELF-modules komen binnenkort.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Snelle plekken */}
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/40 font-semibold mt-4 mb-2">Snelle plekken</p>
            <div className="flex flex-wrap gap-1.5">
              {EXTRA.map((d) => (
                <button key={d.route} onClick={() => { navigate(d.route); onClose(); }} className="rounded-full px-2.5 py-1 text-[11px] font-medium glass-card-2 text-ivory/70 hover:text-ivory transition">
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}