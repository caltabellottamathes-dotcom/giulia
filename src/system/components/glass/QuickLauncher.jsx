import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { X, ChevronRight, ChevronDown, User, Settings, Plug, LogOut } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/**
 * QuickLauncher — editoriale inhoudsopgave als accordeon. Eén zoekregel
 * bovenaan; elk OS-onderdeel (Giulia / Focus / Life / Self / System) is
 * een inklapbare sectie. Minimalistisch, kalm, toetsenbord-vriendelijk:
 * ↑↓ verplaatst de markering over de zichtbare items, ↵ activeert, esc sluit.
 */
const GROUP_COLORS = {
  Giulia: "rgba(255,255,255,0.85)",
  Focus: "rgba(255,255,255,0.85)",
  Life: "rgba(255,255,255,0.85)",
  System: "rgba(255,255,255,0.85)",
};

const GROUPS = [
  {
    label: "Giulia",
    items: [
      { label: "Chat", route: "/chat", module: "chat" },
      { label: "Questions for You", route: "/wants-to-know", module: "wantstoknow" },
      { label: "Approvals", route: "/approvals", module: "approvals" },
      { label: "Daily Briefing", route: "/briefing" },
      { label: "Insights", route: "/insights", module: "insights" },
      { label: "Updates", route: "/updates", module: "updates" },
      { label: "Good Morning", route: "/", module: "goodmorning" },
      { label: "Wake Mode", route: "/wake" },
    ],
  },
  {
    label: "Focus",
    items: [
      { label: "Tasks", route: "/tasks", module: "tasks" },
      { label: "Projects", route: "/projects", module: "projects" },
      { label: "Email", route: "/email", module: "email" },
      { label: "WhatsApp", route: "/whatsapp", module: "whatsapp" },
      { label: "Documents", route: "/documents", module: "documents" },
      { label: "People", route: "/people", module: "people" },
      { label: "Notifications", route: "/notifications" },
      { label: "Time Tracker", route: "/timetracker" },
    ],
  },
  {
    label: "Life",
    items: [
      { label: "Life Home", route: "/life" },
      { label: "PlayTime", route: "/playtime" },
      { label: "Agenda", route: "/agenda", module: "agenda" },
      { label: "Social Life", route: "/life/social", module: "social" },
      { label: "Home Reminders", route: "/life/household", module: "household" },
      { label: "Personal Admin", route: "/life/personal-admin", module: "personaladmin" },
      { label: "Hobbies", route: "/life/hobbies", module: "hobbies" },
      { label: "Personal Growth", route: "/life/development", module: "development" },
      { label: "Daily State", route: "/life/daily-state", module: "dailystate" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Search", route: "/search" },
      { label: "Memory", route: "/memory", module: "memory" },
      { label: "Activity Log", route: "/activity", module: "activity" },
      { label: "Agents", route: "/agents", module: "agents" },
      { label: "Knowledge Base", route: "/knowledge", module: "knowledge" },
      { label: "Image Library", route: "/beeldbank" },
      { label: "Ingestion", route: "/ingest" },
      { label: "FILES", route: "/media" },
      { label: "Browser", module: "browser" },
      { label: "Integrations", route: "/integrations" },
      { label: "Settings", route: "/settings" },
      { label: "Profile", route: "/profile" },
      { label: "Experiments", route: "/experiment" },
    ],
  },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });
}

export default function QuickLauncher({ open, onClose, side = "right" }) {
  const navigate = useNavigate();
  const { openModule, openChat, openBrowser } = usePanel();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [openGroups, setOpenGroups] = useState(() => new Set([GROUPS[0].label]));
  const clock = useClock();

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return GROUPS;
    return GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(query)) })).filter((g) => g.items.length);
  }, [query]);

  // bij zoeken alle matching groepen openklappen
  useEffect(() => {
    if (query) setOpenGroups(new Set(filtered.map((g) => g.label)));
  }, [query, filtered]);

  // platte index over de zichtbare (open) groepen — toetsenbord beweegt hierin
  const flat = useMemo(
    () => filtered.flatMap((g) => (openGroups.has(g.label) ? g.items.map((i) => ({ ...i, group: g.label })) : [])),
    [filtered, openGroups]
  );

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => { if (active > flat.length - 1) setActive(Math.max(0, flat.length - 1)); }, [flat.length, active]);

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

  useEffect(() => { if (open) { setQ(""); setActive(0); setOpenGroups(new Set([GROUPS[0].label])); } }, [open]);

  if (!open) return null;

  const toggle = (label) => setOpenGroups((s) => {
    const n = new Set();
    if (s.has(label) && s.size === 1) return n; // open domein weer sluiten
    n.add(label); // ander domein opent → vorige sluit
    return n;
  });

  const go = (item) => {
    if (item.module === "chat") openChat();
    else if (item.module === "browser") { openBrowser(); onClose(); return; }
    else if (item.module) openModule(item.module);
    if (item.route) navigate(item.route);
    onClose();
  };

  const shutdown = () => { onClose(); base44.auth.logout("/login"); };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={"fixed z-[39] left-2 right-2 bottom-[4.75rem] sm:w-[440px] sm:max-h-[80vh] flex flex-col " + (side === "left" ? "sm:left-4 lg:left-6 sm:right-auto" : "sm:left-auto sm:right-4 lg:right-6")}
        >
          <div className="glass-2 rounded-[26px] overflow-hidden text-ivory border border-white/12 shadow-[0_32px_72px_-20px_rgba(0,0,0,0.4)] flex flex-col max-h-[80vh]" style={{ backdropFilter: "blur(18px) saturate(1.3)", WebkitBackdropFilter: "blur(18px) saturate(1.3)" }}>
            {/* Masthead */}
            <div className="px-6 pt-5 pb-4 border-b border-ivory/10 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                  <span className="text-[11px] uppercase tracking-[0.32em] font-bold text-ivory/75">GIULIA · OS</span>
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 h-8 rounded-full hover:ring-2 hover:ring-ivory/20 transition-all">
                        <span className="h-7 w-7 rounded-full overflow-hidden shrink-0 ring-1 ring-ivory/15">
                          <img src={IMAGES.portraitThinking} alt="Profile" className="h-full w-full object-cover" />
                        </span>
                        <ChevronDown className="h-3 w-3 text-ivory/55" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-charcoal text-ivory border-white/10">
                      <DropdownMenuItem onClick={() => { navigate("/profile"); onClose(); }} className="gap-2.5 text-[13px] text-ivory focus:bg-ivory/10">
                        <User className="h-3.5 w-3.5 text-ivory/60" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { openModule("settings"); onClose(); }} className="gap-2.5 text-[13px] text-ivory focus:bg-ivory/10">
                        <Settings className="h-3.5 w-3.5 text-ivory/60" /> Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { openModule("integrations"); onClose(); }} className="gap-2.5 text-[13px] text-ivory focus:bg-ivory/10">
                        <Plug className="h-3.5 w-3.5 text-ivory/60" /> Integrations
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-ivory/10" />
                      <DropdownMenuItem onClick={() => base44.auth.logout("/login")} className="gap-2.5 text-[13px] text-red-300 focus:bg-ivory/10">
                        <LogOut className="h-3.5 w-3.5" /> Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-[10px] font-mono text-ivory/45 tabular-nums">{clock} AMS</span>
                  <button onClick={onClose} className="text-ivory/45 hover:text-ivory transition" aria-label="Sluiten"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Naar onderdeel…" className="flex-1 bg-transparent text-[15px] font-display font-medium tracking-[-0.012em] text-ivory placeholder:text-ivory/75 focus:outline-none" />
              </div>
            </div>

            {/* Accordeon */}
            <div className="overflow-y-auto px-2 py-2">
              {filtered.length === 0 && <p className="text-center text-sm text-ivory/40 py-12 font-display">Niets gevonden voor "{q}"</p>}
              {filtered.map((g) => {
                const isOpen = openGroups.has(g.label);
                return (
                  <div key={g.label} className="mb-1">
                    <button onClick={() => toggle(g.label)} className="group flex items-center gap-2 w-full px-3 py-2.5 rounded-xl hover:bg-ivory/5 transition-colors">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: GROUP_COLORS[g.label] }} />
                      <span className="text-[9px] uppercase tracking-[0.34em] font-bold" style={{ color: GROUP_COLORS[g.label] }}>{g.label}</span>
                      <span className="flex-1 h-px bg-ivory/8" />
                      <span className="text-[9px] font-mono text-ivory/30 tabular-nums">{String(g.items.length).padStart(2, "0")}</span>
                      <ChevronRight className={"h-3.5 w-3.5 text-ivory/40 transition-transform duration-300 " + (isOpen ? "rotate-90" : "")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div key="items" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                          <div className="flex flex-col pb-1">
                            {g.items.map((item) => {
                              const flatIdx = flat.findIndex((f) => f.label === item.label && f.group === g.label);
                              const isActive = flatIdx === active;
                              return (
                                <button
                                  key={item.label}
                                  onClick={() => go(item)}
                                  onMouseEnter={() => setActive(flatIdx)}
                                  className={"flex items-center w-full px-4 py-2.5 rounded-xl text-left transition-colors " + (isActive ? "bg-ivory/8 text-ivory" : "text-ivory/75 hover:bg-ivory/5 hover:text-ivory")}
                                >
                                  <span className="text-[15px] font-display font-medium tracking-[-0.012em] truncate">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-ivory/10 shrink-0 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ivory/35">{flat.length} onderdelen · ↑↓ ↵ esc</span>
              <div className="flex items-center gap-4">
                <button onClick={shutdown} className="text-[10px] uppercase tracking-[0.24em] text-ivory/45 hover:text-ivory transition font-bold">Afsluiten</button>
                <span className="text-[10px] uppercase tracking-[0.24em] text-ivory/30 font-bold">Index</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}