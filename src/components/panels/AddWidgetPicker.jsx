import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Check } from "lucide-react";

/**
 * AddWidgetPicker — snelle, overzichtelijke launcher achter thema-tabs
 * (FOCUS / LIFE / SELF). Tik op een module → pagina opent én het bijbehorende
 * paneel schuift direct open. Alles met motion: staggered tiles, cross-fade
 * tussen thema's, hover-lift. Pint ook meteen op het dashboard als hij nieuw is.
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

export default function AddWidgetPicker({ open, onClose, onAdd, addedTypes = [] }) {
  const [theme, setTheme] = useState("focus");
  const navigate = useNavigate();
  const { openModule, openChat } = usePanel();
  const active = THEMES.find((t) => t.key === theme);
  const widgets = WIDGET_LIST.filter((w) => active.categories.includes(w.category));

  const launch = (w) => {
    if (!addedTypes.includes(w.type)) onAdd?.(w.type);
    if (w.type === "concierge" || w.type === "giulia") openChat();
    else openModule(w.type);
    const route = ROUTES[w.type];
    if (route) navigate(route);
    onClose();
  };

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={3} width={440}>
      <div className="p-6 lg:p-7 text-ivory">
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold mb-2">Snelle toegang</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight">Alles openen</h3>
        <p className="text-sm text-ivory/55 mt-1.5 mb-5">Tik een module — pagina + paneel openen direct.</p>

        {/* Theme tabs */}
        <div className="flex gap-1.5 p-1 rounded-full glass-card-2 mb-4">
          {THEMES.map((t) => (
            <button key={t.key} onClick={() => setTheme(t.key)} className={cn("flex-1 rounded-full px-3 py-2 text-[11px] font-semibold tracking-wide transition", theme === t.key ? "text-ivory" : "text-ivory/45 hover:text-ivory/80")} style={theme === t.key ? { background: t.accent } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40 font-semibold mb-3">{active.blurb}</p>

        <AnimatePresence mode="wait">
          <motion.div key={theme} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="grid grid-cols-2 gap-3">
            {widgets.length ? widgets.map((w, i) => {
              const added = addedTypes.includes(w.type);
              return (
                <motion.button
                  key={w.type}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => launch(w)}
                  className="glass-card-2 rounded-2xl overflow-hidden text-left group relative hover:-translate-y-0.5 transition-transform"
                >
                  <div className="relative h-16 overflow-hidden">
                    <img src={w.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                    {added && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[8px] uppercase tracking-wider bg-ivory text-charcoal px-1.5 py-0.5 rounded-full font-semibold">
                        <Check className="h-2.5 w-2.5" /> Pin
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ivory flex items-center gap-1.5 min-w-0">
                      {w.icon && <w.icon className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                      <span className="truncate">{w.label}</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-ivory/50 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </motion.button>
              );
            }) : (
              <div className="col-span-2 glass-card-2 rounded-2xl px-5 py-10 text-center">
                <p className="text-sm text-ivory/45">SELF-modules komen binnenkort.</p>
                <p className="text-[11px] text-ivory/30 mt-1">Rituelen, reflectie & zelfzorg.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </FloatingPanel>
  );
}