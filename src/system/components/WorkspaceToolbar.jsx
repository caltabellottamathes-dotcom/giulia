import React, { useState, useEffect, useRef } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useContextCapture } from "@/lib/ContextCaptureContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { Plus, Phone, MessageSquare, BrainCircuit, X, Send, Loader2 } from "lucide-react";
import QuickLauncher from "@/system/components/glass/QuickLauncher";
import { useActiveDomain } from "@/lib/useActiveDomain";
import { DEFAULT_BOARDS, loadCustomBoards, createCustomBoard, getActiveBoard, setActiveBoard } from "@/lib/useDashboardBoard";

const actionBtn = "h-8 w-8 flex items-center justify-center text-ivory/80 hover:bg-ivory/15 hover:text-ivory transition-colors shrink-0 rounded-lg";

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
  const [expanded, setExpanded] = useState(true);
  const collapseTimer = useRef(null);
  const enterTimer = useRef(null);

  // kalme, sensitievere hover — hij wacht 450ms voor hij opent (blijft dus
  // even dicht bij een snelle muisbeweging) en blijft na verlaten ±6s open.
  const expand = () => {
    clearTimeout(collapseTimer.current);
    clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => setExpanded(true), 1000);
  };
  const scheduleCollapse = (ms = 6000) => {
    clearTimeout(collapseTimer.current);
    clearTimeout(enterTimer.current);
    collapseTimer.current = setTimeout(() => setExpanded(false), ms);
  };
  useEffect(() => { setExpanded(true); scheduleCollapse(6000); return () => { clearTimeout(collapseTimer.current); clearTimeout(enterTimer.current); }; }, []);

  useEffect(() => { if (captured) setNote(""); }, [captured]);
  useEffect(() => {
    const h = () => setLauncherOpen(true);
    window.addEventListener("giulia:open-launcher", h);
    return () => window.removeEventListener("giulia:open-launcher", h);
  }, []);

  const selectBoard = (id) => {
    setActiveBoard(id);
    setBoard(id);
    expand();
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
    expand();
    setQuery("");
    setPendingMessage(text);
    openChat();
  };

  const all = [...DEFAULT_BOARDS, ...custom];

  const { accent } = useActiveDomain(board);

  return (
    <>
      {/* bottom hover-reveal zone */}
      <div className="fixed bottom-0 inset-x-0 h-10 z-20" onMouseEnter={expand} />

      {/* the bar — volledig glasmorfisch, schuift vloeiend in/uit.
          Ingeklapt: compacte balk links met de belangrijkste items
          (huidig dashboard + bellen + chat). Uitgeklapt: volledige werkbalk. */}
      <div
        className={cn(
          "fixed bottom-4 left-4 lg:bottom-6 lg:left-6 z-30 flex items-center transition-[width,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          expanded ? "w-[calc(100vw-2rem)] lg:w-[calc(100vw-3rem)]" : "w-[224px]"
        )}
        onMouseEnter={expand}
        onMouseLeave={() => scheduleCollapse(8000)}
      >
        <div
          className="relative flex items-center h-11 rounded-[14px] overflow-hidden w-full"
          style={{
            background: "rgba(120,122,128,0.05)",
            backdropFilter: "blur(8px) saturate(1.2)",
            WebkitBackdropFilter: "blur(8px) saturate(1.2)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 16px 40px -18px rgba(0,0,0,0.42), 0 6px 18px -10px rgba(0,0,0,0.25)",
          }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: accent, opacity: 0.16 }} />
          {expanded ? (
            <>
              {/* Dashboard tabs (left) */}
              <div className="flex items-center gap-0.5 overflow-x-auto shrink-0 max-w-[46%] lg:max-w-[54%] pl-2.5 lg:pl-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {all.map((b) => {
                  const on = board === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => selectBoard(b.id)}
                      className={cn(
                        "px-2.5 lg:px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-colors",
                        on ? "text-ivory" : "text-ivory/55 hover:text-ivory/85"
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

              {/* Giulia input */}
              <form onSubmit={submit} className="hidden sm:flex items-center gap-2.5 w-[30%] lg:w-[22%]">
                <span className="h-1.5 w-1.5 rounded-full bg-ivory/60 animate-pulse-soft shrink-0" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask Giulia anything…" className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/55 focus:outline-none text-right" />
              </form>
            </>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              className="ml-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap text-ivory shrink-0"
            >
              {all.find((b) => b.id === board)?.label || "GIULIA"}
            </button>
          )}

          {/* Actions — altijd zichtbaar; bij ingeklapt alleen de belangrijkste (bellen + chat) */}
          <div className={cn("ml-auto flex items-center gap-0.5 shrink-0", expanded ? "px-1.5 lg:px-2" : "pr-2")}>
            {expanded && (
              <>
                <button onClick={() => { expand(); active ? stop() : start(); }} aria-label="Context toevoegen" className={cn(actionBtn, active && "text-ivory")}><BrainCircuit className="h-4 w-4" /></button>
                <button onClick={() => { expand(); setLauncherOpen(true); }} aria-label="Snelle acties" className={actionBtn}><Plus className="h-4 w-4" /></button>
                </>
                )}
                <button onClick={() => { expand(); openVoice(); }} aria-label="Bel Giulia" className={actionBtn}><Phone className="h-4 w-4" /></button>
                <button onClick={() => { expand(); openChat(); }} aria-label="Chat met Giulia" className={actionBtn}><MessageSquare className="h-4 w-4" /></button>
          </div>
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