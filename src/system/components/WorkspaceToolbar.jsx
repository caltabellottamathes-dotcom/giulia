import React, { useState, useEffect, useRef } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useContextCapture } from "@/lib/ContextCaptureContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { Plus, Phone, MessageSquare, BrainCircuit, X, Send, Loader2 } from "lucide-react";
import QuickLauncher from "@/system/components/glass/QuickLauncher";
import { WIDGETS } from "@/lib/widgetRegistry";
import { DEFAULT_BOARDS, loadCustomBoards, createCustomBoard, getActiveBoard, setActiveBoard } from "@/lib/useDashboardBoard";

const actionBtn = "h-9 w-9 flex items-center justify-center text-ivory/60 hover:bg-ivory/10 hover:text-ivory transition-colors shrink-0 rounded-lg";

function useActiveSection(board) {
  const { activeModule } = usePanel();
  const loc = useLocation();
  const ROUTE_DOMAIN = [
    [/^\/self/, "self"], [/^\/wake$/, "self"],
    [/^\/life/, "life"],
    [/^\/(agenda|projects|tasks|email|whatsapp|documents|people|planning|timetracker)/, "focus"],
    [/^\/knowledge/, "system"],
    [/^\/(chat|voice|approvals|insights|updates|briefing|wants-to-know|activity|memory|agents)/, "giulia"],
    [/^\/(search|integrations|settings|profile)/, "system"],
  ];
  const MODULE_DOMAIN_FALLBACK = { chat: "giulia", voice: "giulia", settings: "system", profile: "system", integrations: "system" };
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

/**
 * WorkspaceToolbar — minimalistische volledig-brede werkbalk onderaan.
 * Scherpe hoeken, solide donkere achtergrond, monochrome tabs. Geen glas,
 * geen ronde hoeken, geen kleur-chaos. Streep bovenin als actieve indicator.
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

      {/* persistent indicator (inactive) */}
      {hidden && (
        <div className="fixed bottom-4 inset-x-4 lg:bottom-6 lg:inset-x-8 z-30 pointer-events-none">
          <div className="h-[2px] w-full rounded-full bg-ivory/20" />
        </div>
      )}

      {/* the bar — full width, edge to edge, sharp corners */}
      <div
        className={cn(
          "fixed bottom-4 inset-x-4 lg:bottom-6 lg:inset-x-8 z-30 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden ? "translate-y-[calc(100%+1.5rem)]" : "translate-y-0"
        )}
        onMouseEnter={reveal}
        onMouseLeave={scheduleHide}
      >
        <div className="relative w-full h-14 rounded-2xl bg-[rgba(48,50,55,0.18)] backdrop-blur-[22px] backdrop-saturate-[1.35] border border-white/15 ring-1 ring-inset ring-white/10 shadow-[0_28px_64px_-26px_rgba(0,0,0,0.42),inset_0_1px_0_0_rgba(255,255,255,0.14)] flex items-center px-4 lg:px-8">
          {/* Dashboard tabs (left) — monochrome */}
          <div className="flex items-center gap-0.5 overflow-x-auto shrink-0 max-w-[44%] lg:max-w-[52%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {all.map((b) => {
              const on = board === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => selectBoard(b.id)}
                  className={cn(
                    "relative px-3 lg:px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-all rounded-lg",
                    on ? "text-ivory bg-ivory/10" : "text-ivory/45 hover:text-ivory/70 hover:bg-ivory/5"
                  )}
                >
                  {b.label}
                </button>
              );
            })}
            <button onClick={addBoard} title="Dashboard toevoegen" className="shrink-0 h-7 w-7 flex items-center justify-center text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition"><Plus className="h-3.5 w-3.5" /></button>
          </div>

          {/* spacer */}
          <div className="flex-1" />

          {/* Giulia input (right) */}
          <form onSubmit={submit} className="hidden sm:flex items-center gap-2.5 w-[30%] lg:w-[22%]">
            <span className="h-1.5 w-1.5 rounded-full bg-ivory/60 animate-pulse-soft shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Vraag Giulia anything…" className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/35 focus:outline-none text-right" />
          </form>

          {/* Actions (far right) */}
          <button onClick={() => { reveal(); active ? stop() : start(); }} aria-label="Context toevoegen" className={cn(actionBtn, active && "text-ivory")}><BrainCircuit className="h-5 w-5" /></button>
          <button onClick={() => { reveal(); setLauncherOpen(true); }} aria-label="Snelle acties" className={actionBtn}><Plus className="h-5 w-5" /></button>
          <button onClick={() => { reveal(); openVoice(); }} aria-label="Bel Giulia" className={actionBtn}><Phone className="h-5 w-5" /></button>
          <button onClick={() => { reveal(); openChat(); }} aria-label="Chat met Giulia" className={actionBtn}><MessageSquare className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Context-capture popup */}
      {(active || captured) && (
        <div data-no-capture className="fixed z-40 right-4 lg:right-8 bottom-20 w-[calc(100%-2rem)] lg:w-[360px] bg-charcoal/40 backdrop-blur-2xl border border-white/15 p-4 space-y-3 animate-slide-up text-ivory rounded-2xl">
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
              <p className="text-xs text-ivory/80 line-clamp-3 bg-ivory/10 p-2.5">{captured.text || "(geen tekst gevonden)"}</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra context toevoegen (optioneel)…" className="w-full text-sm bg-ivory/5 border border-ivory/15 px-3 py-2 focus:outline-none text-ivory placeholder:text-ivory/40 min-h-[56px] resize-none" />
              <button onClick={saveContext} disabled={savingCtx} className="w-full inline-flex items-center justify-center gap-1.5 bg-ivory text-charcoal px-3 py-2 text-xs font-semibold disabled:opacity-50">
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