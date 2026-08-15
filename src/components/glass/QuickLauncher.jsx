import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { X, Search } from "lucide-react";

/**
 * QuickLauncher — de OS-navigatie. Helder en overzichtelijk: één zoekveld
 * dat alles filtert, gegroepeerde secties met telling, twee kolommen op
 * desktop. Opent de pagina én (indien van toepassing) het bijbehorende paneel.
 */
const GROUPS = [
  {
    label: "Vandaag",
    items: [
      { label: "Agenda", route: "/agenda", module: "agenda" },
      { label: "Taken", route: "/tasks", module: "tasks" },
      { label: "Planning", route: "/planning" },
      { label: "Briefing", route: "/briefing" },
      { label: "Goedkeuringen", route: "/approvals", module: "approvals" },
      { label: "Notificaties", route: "/notifications" },
    ],
  },
  {
    label: "Werk",
    items: [
      { label: "Projecten", route: "/projects", module: "projects" },
      { label: "Email", route: "/email", module: "email" },
      { label: "WhatsApp", route: "/whatsapp", module: "whatsapp" },
      { label: "Kennis", route: "/knowledge", module: "knowledge" },
      { label: "Documenten", route: "/documents", module: "documents" },
      { label: "Mensen", route: "/people", module: "people" },
    ],
  },
  {
    label: "Leven",
    items: [
      { label: "LIFE", route: "/life" },
      { label: "Social Pulse", route: "/life/social-pulse", module: "socialpulse" },
      { label: "Social Planner", route: "/life/social-planner", module: "socialplanner" },
      { label: "Huishouden", route: "/life/household", module: "household" },
      { label: "Persoonlijke Admin", route: "/life/personal-admin", module: "personaladmin" },
      { label: "Hobby's", route: "/life/hobbies", module: "hobbies" },
    ],
  },
  {
    label: "Giulia",
    items: [
      { label: "Wants to know", route: "/wants-to-know", module: "wantstoknow" },
      { label: "Chat", route: "/chat", module: "chat" },
      { label: "Wake", route: "/wake" },
      { label: "Insights", route: "/insights", module: "insights" },
      { label: "Geheugen", route: "/memory", module: "memory" },
      { label: "Activiteit", route: "/activity", module: "activity" },
    ],
  },
  {
    label: "Systeem",
    items: [
      { label: "Agenten", route: "/agents" },
      { label: "Updates", route: "/updates", module: "updates" },
      { label: "Tijd", route: "/timetracker" },
      { label: "Zoeken", route: "/search" },
      { label: "Integraties", route: "/integrations" },
      { label: "Instellingen", route: "/settings" },
      { label: "Profiel", route: "/profile" },
      { label: "Experiment", route: "/experiment" },
    ],
  },
];

export default function QuickLauncher({ open, onClose }) {
  const navigate = useNavigate();
  const { openModule, openChat } = usePanel();
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return GROUPS;
    return GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(query)) })).filter((g) => g.items.length);
  }, [query]);

  if (!open) return null;

  const go = (item) => {
    if (item.module === "chat") openChat();
    else if (item.module) openModule(item.module);
    navigate(item.route);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[38] bg-charcoal/25 animate-fade-in" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[39] left-2 right-2 bottom-[4.75rem] sm:left-auto sm:right-10 sm:w-[440px] sm:max-h-[78vh] flex flex-col"
        >
          <div className="glass-4 rounded-[24px] overflow-hidden text-ivory border border-white/18 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.55)] flex flex-col max-h-[78vh]">
            {/* Header + search */}
            <div className="px-5 pt-4 pb-3 border-b border-ivory/10 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
                  <span className="text-[11px] uppercase tracking-[0.28em] font-bold text-ivory/70">Navigatie</span>
                </div>
                <button onClick={onClose} className="text-ivory/50 hover:text-ivory transition" aria-label="Sluiten">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-ivory/8 px-3.5 py-2.5 border border-ivory/12">
                <Search className="h-3.5 w-3.5 text-ivory/40 shrink-0" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Zoek een onderdeel…"
                  className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Groups */}
            <div className="overflow-y-auto px-3 py-2">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-ivory/40 py-10">Niets gevonden voor "{q}"</p>
              )}
              {filtered.map((g, gi) => (
                <div key={g.label} className={gi === 0 ? "" : "mt-3"}>
                  <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-ivory/40 font-bold">{g.label}</span>
                    <span className="text-[9px] text-ivory/25">{g.items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                    {g.items.map((item, ii) => (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gi * 0.02 + ii * 0.015, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => go(item)}
                        className="group flex items-baseline w-full px-3 py-2 rounded-lg text-left hover:bg-ivory/8 transition-colors"
                      >
                        <span className="text-[15px] font-display font-medium text-ivory/85 group-hover:text-ivory tracking-[-0.01em] truncate">
                          {item.label}
                        </span>
                        <span className="ml-auto text-[10px] text-ivory/20 group-hover:text-ivory/45 transition-colors">↗</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}