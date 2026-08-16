import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

/**
 * QuickLauncher — het editoriale navigatiecommandocentrum van GIULIA OS.
 *
 * Geen iconenrij, geen rasters. Een inhoudsopgave zoals in een tijdschrift:
 * groepskoppen als kleine kapitalen, elk onderdeel genummerd (01, 02 …) in
 * een display lettertype, met op hover het routepad in mono eronder. Eén
 * zoekregel met een "›" prompt. Toetsenbord: ↑↓ verplaatst de markering,
 * Enter activeert, Esc sluit. De + in de InteractionBar opent dit.
 *
 * Data (routes + modules) is ongewijzigd — alleen de presentatie is premium.
 */
const GROUPS = [
  {
    label: "Giulia",
    items: [
      { label: "Chat", route: "/chat", module: "chat" },
      { label: "Wants to know", route: "/wants-to-know", module: "wantstoknow" },
      { label: "Goedkeuringen", route: "/approvals", module: "approvals" },
      { label: "Briefing", route: "/briefing" },
      { label: "Insights", route: "/insights", module: "insights" },
      { label: "Geheugen", route: "/memory", module: "memory" },
      { label: "Activiteit", route: "/activity", module: "activity" },
      { label: "Agenten", route: "/agents" },
      { label: "Updates", route: "/updates", module: "updates" },
    ],
  },
  {
    label: "Focus",
    items: [
      { label: "Agenda", route: "/agenda", module: "agenda" },
      { label: "Taken", route: "/tasks", module: "tasks" },
      { label: "Planning", route: "/planning" },
      { label: "Projecten", route: "/projects", module: "projects" },
      { label: "Email", route: "/email", module: "email" },
      { label: "WhatsApp", route: "/whatsapp", module: "whatsapp" },
      { label: "Kennis", route: "/knowledge", module: "knowledge" },
      { label: "Documenten", route: "/documents", module: "documents" },
      { label: "Mensen", route: "/people", module: "people" },
      { label: "Notificaties", route: "/notifications" },
      { label: "Tijd", route: "/timetracker" },
    ],
  },
  {
    label: "Life",
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
    label: "Self",
    items: [
      { label: "Wake", route: "/wake" },
      { label: "Good Morning", route: "/", module: "goodmorning" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Zoeken", route: "/search" },
      { label: "Integraties", route: "/integrations" },
      { label: "Instellingen", route: "/settings" },
      { label: "Profiel", route: "/profile" },
      { label: "Experiment", route: "/experiment" },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("nl-NL", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam",
  });
}

export default function QuickLauncher({ open, onClose }) {
  const navigate = useNavigate();
  const { openModule, openChat } = usePanel();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const clock = useClock();

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return GROUPS;
    return GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(query)) })).filter((g) => g.items.length);
  }, [query]);

  const flat = useMemo(() => {
    if (query) return filtered.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
    return ALL;
  }, [filtered, query]);

  // houd de markering binnen bereik als de lijst verandert
  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    if (active > flat.length - 1) setActive(Math.max(0, flat.length - 1));
  }, [flat.length, active]);

  // toetsenbord: Esc sluit, ↑↓ verplaatst, Enter activeert
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      else if (e.key === "Enter" && flat[active]) { e.preventDefault(); go(flat[active]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, active]);

  // reset bij open
  useEffect(() => { if (open) { setQ(""); setActive(0); } }, [open]);

  if (!open) return null;

  let ordinal = 0;
  const idxOf = (item, group) => flat.findIndex((f) => f.label === item.label && f.group === group);

  const go = (item) => {
    if (item.module === "chat") openChat();
    else if (item.module) openModule(item.module);
    navigate(item.route);
    onClose();
  };

  const shutdown = async () => {
    onClose();
    await base44.auth.logout("/login").catch(() => { window.location.href = "/login"; });
  };

  return (
    <>
      <div className="fixed inset-0 z-[38] bg-charcoal/30 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[39] left-2 right-2 bottom-[4.75rem] sm:left-auto sm:right-10 sm:w-[480px] sm:max-h-[80vh] flex flex-col"
        >
          <div className="glass-4 rounded-[26px] overflow-hidden text-ivory border border-white/18 shadow-[0_32px_72px_-20px_rgba(0,0,0,0.6)] flex flex-col max-h-[80vh]">
            {/* Masthead */}
            <div className="px-6 pt-5 pb-4 border-b border-ivory/10 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
                  <span className="text-[11px] uppercase tracking-[0.32em] font-bold text-ivory/75">GIULIA · OS</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-ivory/45 tabular-nums">{clock} AMS</span>
                  <button onClick={onClose} className="text-ivory/45 hover:text-ivory transition" aria-label="Sluiten">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Commandoregel */}
              <div className="mt-4 flex items-center gap-2.5">
                <span className="text-[15px] font-mono text-olive leading-none">›</span>
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="naar onderdeel…"
                  className="flex-1 bg-transparent text-[17px] font-display font-medium text-ivory placeholder:text-ivory/35 focus:outline-none tracking-[-0.01em]"
                />
                <span className="text-[10px] font-mono text-ivory/30 hidden sm:inline">↵ enter</span>
              </div>
            </div>

            {/* Index */}
            <div ref={listRef} className="overflow-y-auto px-2 py-2">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-ivory/40 py-12 font-display">Niets gevonden voor "{q}"</p>
              )}
              {filtered.map((g, gi) => (
                <div key={g.label} className={gi === 0 ? "" : "mt-4"}>
                  <div className="flex items-center gap-2 px-4 pt-2 pb-1.5">
                    <span className="text-[9px] uppercase tracking-[0.34em] text-ivory/40 font-bold">{g.label}</span>
                    <span className="flex-1 h-px bg-ivory/8" />
                    <span className="text-[9px] font-mono text-ivory/25 tabular-nums">{String(g.items.length).padStart(2, "0")}</span>
                  </div>
                  <div className="flex flex-col">
                    {g.items.map((item) => {
                      ordinal += 1;
                      const flatIdx = idxOf(item, g.label);
                      const isActive = flatIdx === active;
                      return (
                        <motion.button
                          key={item.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(gi * 0.03 + (flatIdx % 6) * 0.012, 0.18), duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          onClick={() => go(item)}
                          onMouseEnter={() => setActive(flatIdx)}
                          className={"group flex items-baseline gap-3 w-full px-4 py-2.5 rounded-xl text-left transition-colors " + (isActive ? "bg-ivory/8" : "hover:bg-ivory/5")}
                        >
                          <span className={"text-[10px] font-mono tabular-nums leading-none transition-colors " + (isActive ? "text-olive" : "text-ivory/25 group-hover:text-ivory/45")}>
                            {String(ordinal).padStart(2, "0")}
                          </span>
                          <span className={"text-[16px] font-display font-medium tracking-[-0.012em] truncate transition-colors " + (isActive ? "text-ivory" : "text-ivory/80 group-hover:text-ivory")}>
                            {item.label}
                          </span>
                          <span className={"ml-auto pl-2 text-[10px] font-mono transition-opacity " + (isActive ? "text-ivory/50 opacity-100" : "text-ivory/30 opacity-0 group-hover:opacity-100")}>
                            {item.route}
                          </span>
                          <span className={"text-[12px] font-mono leading-none transition-colors " + (isActive ? "text-olive" : "text-ivory/20 group-hover:text-ivory/45")}>↗</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hairline */}
            <div className="px-6 py-3 border-t border-ivory/10 shrink-0 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ivory/35">{flat.length} onderdelen · ↑↓ ↵ esc</span>
              <div className="flex items-center gap-4">
                <button onClick={shutdown} className="text-[10px] uppercase tracking-[0.24em] text-ivory/45 hover:text-ivory transition font-bold">Afsluiten</button>
                <span className="text-[10px] uppercase tracking-[0.24em] text-ivory/30 font-bold">Editorial Index</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}