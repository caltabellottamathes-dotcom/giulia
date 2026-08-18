import React, { useState, useEffect, useRef } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useContextCapture } from "@/lib/ContextCaptureContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Phone, MessageSquare, BrainCircuit, X, Send, Loader2 } from "lucide-react";
import QuickLauncher from "@/system/components/glass/QuickLauncher";
import { WIDGETS } from "@/lib/widgetRegistry";
import { DEFAULT_BOARDS, loadCustomBoards, createCustomBoard, getActiveBoard, setActiveBoard } from "@/lib/useDashboardBoard";

const actionBtn = "h-9 w-9 rounded-full flex items-center justify-center text-ivory/80 hover:bg-ivory/15 hover:text-ivory transition-colors shrink-0";

/* ── Active-section → color ─────────────────────────────────────────────
   FOCUS → groen (olive) · SELF & LIFE → lichtblauw (ridge) ·
   GIULIA & SYSTEEM → #d8dab3. */
const DOMAIN_COLOR = {
  focus: "#94925d",
  self: "#b1bec6",
  life: "#301728",
  giulia: "#d8dab3",
  system: "#d5e24a",
};

/* Per-dashboard tekstkleur — leesbaar op donker glas */
const BOARD_COLOR = {
  now: "#94B8D1",
  giulia: "#d8dab3",
  focus: "#c4c282",
  life: "#d49a98",
  self: "#b1bec6",
  system: "#d5e24a",
};

const ROUTE_DOMAIN = [
  [/^\/self/, "self"], [/^\/wake$/, "self"],
  [/^\/life/, "life"],
  [/^\/(agenda|projects|tasks|email|whatsapp|documents|people|planning|timetracker)/, "focus"],
  [/^\/knowledge/, "system"],
  [/^\/(chat|voice|approvals|insights|updates|briefing|wants-to-know|activity|memory|agents)/, "giulia"],
  [/^\/(search|integrations|settings|profile)/, "system"],
];
const MODULE_DOMAIN_FALLBACK = { chat: "giulia", voice: "giulia", settings: "system", profile: "system", integrations: "system" };

function useActiveSection(board) {
  const { activeModule } = usePanel();
  const loc = useLocation();
  if (activeModule) {
    const d = WIDGETS[activeModule]?.domain || MODULE_DOMAIN_FALLBACK[activeModule];
    if (d) return d;
  }
  if (loc.pathname === "/") {
    const b = (board || "").toLowerCase();
    if (b === "focus") return "focus";
    if (b === "self") return "self";
    if (b === "life") return "life";
    if (b === "system") return "system";
    return "giulia";
  }
  for (const [re, d] of ROUTE_DOMAIN) if (re.test(loc.pathname)) return d;
  return "giulia";
}

function LiveLine({ color }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: color, opacity: 0.5 }}>
      <motion.span
        className="absolute top-0 bottom-0 w-1/4 rounded-full"
        style={{ background: color, filter: "blur(1px)", boxShadow: `0 0 10px ${color}` }}
        animate={{ x: ["-120%", "520%"] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/**
 * WorkspaceToolbar — één volledige glazen werkbalk onderaan over de volle
 * breedte. Levende kleurlijn bovenin (kleur = actieve OS-laag), tabs links,
 * Giulia-invoer rechts. Verdwijnt naar beneden bij inactiviteit; bij hover
 * onderaan verschijnt hij weer. Inactief blijft de levende lijn + een bloom
 * zichtbaar als indicator van het actieve onderdeel.
 */
export default function WorkspaceToolbar() {
  const { openModule, openChat, openVoice, setPendingMessage } = usePanel();
  const { active, start, stop, captured, clear } = useContextCapture();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState(getActiveBoard());
  const [custom, setCustom] = useState(loadCustomBoards());
  const [note, setNote] = useState("");
  const [savingCtx, setSavingCtx] = useState(false);
  const [hidden, setHidden] = useState(false);
  const hideTimer = useRef(null);

  const domain = useActiveSection(board);
  const color = DOMAIN_COLOR[domain] || DOMAIN_COLOR.giulia;

  const reveal = () => {
    setHidden(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHidden(true), 5000);
  };
  const scheduleHide = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHidden(true), 1800);
  };
  useEffect(() => { reveal(); return () => clearTimeout(hideTimer.current); }, []);

  useEffect(() => { if (captured) setNote(""); }, [captured]);
  useEffect(() => {
    const h = () => setLauncherOpen(true);
    window.addEventListener("giulia:open-launcher", h);
    return () => window.removeEventListener("giulia:open-launcher", h);
  }, []);

  const selectBoard = (id) => {
    setActiveBoard(id);
    setBoard(id);
    reveal();
    window.dispatchEvent(new CustomEvent("giulia:board-change", { detail: id }));
  };
  const addBoard = () => {
    const id = createCustomBoard("Nieuw");
    setCustom(loadCustomBoards());
    selectBoard(id);
  };

  const saveContext = async () => {
    if (!captured) return;
    setSavingCtx(true);
    try {
      const content = note.trim() ? `${captured.text}\n\nContext van Salvo: ${note.trim()}` : captured.text;
      await base44.entities.Memory.create({ content, category: "Important information", source: "manual_context" });
      clear();
    } finally { setSavingCtx(false); }
  };

  const submit = (e) => {
    if (e) e.preventDefault();
    const text = query.trim();
    if (!text) return;
    reveal();
    setQuery("");
    setPendingMessage(text);
    openChat();
  };

  const all = [...DEFAULT_BOARDS, ...custom];

  return (
    <>
      {/* bottom hover-reveal zone */}
      <div className="fixed bottom-0 inset-x-0 h-12 z-20" onMouseEnter={reveal} />

      {/* persistent live line + bloom (inactive indicator) */}
      {hidden && (
        <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
          <div className="relative h-[3px] w-full">
            <LiveLine color={color} />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-40 rounded-full blur-xl" style={{ background: color, opacity: 0.85 }} />
            <motion.span
              className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 14px 3px ${color}` }}
              animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.25, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      {/* the bar */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-30 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden ? "translate-y-[135%]" : "translate-y-0"
        )}
        onMouseEnter={reveal}
        onMouseLeave={scheduleHide}
      >
        <div className="px-3 lg:px-6 pb-3">
          <div className="relative w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-5 h-14 rounded-[20px] glass-4 border border-white/18 shadow-[0_28px_64px_-26px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.16)]">
            {/* top live line — animated, active color */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[20px] overflow-hidden">
              <LiveLine color={color} />
            </span>

            {/* Dashboard tabs (left) — elegant, no pill */}
            <div className="flex items-center gap-1 overflow-x-auto shrink-0 max-w-[44%] lg:max-w-[52%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {all.map((b) => {
                const on = board === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => selectBoard(b.id)}
                    style={{ color: BOARD_COLOR[b.id] || undefined }}
                    className={cn(
                      "relative px-2.5 lg:px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-opacity",
                      on ? "opacity-100" : "opacity-50 hover:opacity-85"
                    )}
                  >
                    {b.label}
                    {on && <span className="absolute -bottom-0.5 left-2.5 right-2.5 h-px rounded-full" style={{ background: BOARD_COLOR[b.id] || color }} />}
                  </button>
                );
              })}
              <button onClick={addBoard} title="Dashboard toevoegen" className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-ivory/50 hover:text-ivory hover:bg-ivory/10 transition"><Plus className="h-3.5 w-3.5" /></button>
            </div>

            {/* spacer pushes the input to the far right */}
            <div className="flex-1" />

            {/* Giulia input (right, tegen de knoppen) */}
            <form onSubmit={submit} className="hidden sm:flex items-center gap-2.5 w-[34%] lg:w-[24%]">
              <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Vraag Giulia anything…" className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/45 focus:outline-none text-right" />
            </form>

            {/* Actions (right) */}
            <button onClick={() => { reveal(); active ? stop() : start(); }} aria-label="Context toevoegen" className={cn(actionBtn, active && "text-olive")}><BrainCircuit className="h-5 w-5" /></button>
            <button onClick={() => { reveal(); setLauncherOpen(true); }} aria-label="Snelle acties" className={actionBtn}><Plus className="h-5 w-5" /></button>
            <button onClick={() => { reveal(); openVoice(); }} aria-label="Bel Giulia" className={actionBtn}><Phone className="h-5 w-5" /></button>
            <button onClick={() => { reveal(); openChat(); }} aria-label="Chat met Giulia" className={actionBtn}><MessageSquare className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {/* Context-capture popup */}
      {(active || captured) && (
        <div data-no-capture className="fixed z-40 right-4 lg:right-6 bottom-24 w-[calc(100%-2rem)] lg:w-[360px] glass-3 rounded-2xl p-4 space-y-3 animate-slide-up text-ivory">
          {active && !captured ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wider text-ivory/70 font-semibold">Context toevoegen</p>
                <button onClick={stop} className="text-ivory/60 hover:text-ivory"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-ivory/70">Klik op iets in de app om het aan Giulia's geheugen toe te voegen.</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-ivory/70 font-semibold">Onthouden</p>
                <button onClick={clear} className="text-ivory/60 hover:text-ivory"><X className="h-3.5 w-3.5" /></button>
              </div>
              <p className="text-xs text-ivory/80 line-clamp-3 bg-ivory/10 rounded-lg p-2.5">{captured.text || "(geen tekst gevonden)"}</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra context toevoegen (optioneel)…" className="w-full text-sm bg-ivory/5 border border-ivory/15 rounded-lg px-3 py-2 focus:outline-none text-ivory placeholder:text-ivory/40 min-h-[56px] resize-none" />
              <button onClick={saveContext} disabled={savingCtx} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-olive text-ivory px-3 py-2 text-xs font-semibold disabled:opacity-50">
                {savingCtx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Onthoud dit
              </button>
            </>
          )}
        </div>
      )}

      <QuickLauncher open={launcherOpen} onClose={() => setLauncherOpen(false)} />
    </>
  );
}