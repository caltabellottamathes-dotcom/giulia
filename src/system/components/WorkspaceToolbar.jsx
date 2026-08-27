import React, { useState, useEffect, useRef } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useContextCapture } from "@/lib/ContextCaptureContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { Plus, Phone, MessageSquare, BrainCircuit, X, Send, Loader2 } from "lucide-react";
import QuickLauncher from "@/system/components/glass/QuickLauncher";
import { useActiveDomain } from "@/lib/useActiveDomain";
import { DEFAULT_BOARDS, loadCustomBoards, createCustomBoard, renameCustomBoard, deleteCustomBoard, getActiveBoard, setActiveBoard, isDefaultBoard } from "@/lib/useDashboardBoard";

const actionBtn = "h-8 w-8 flex items-center justify-center text-white hover:bg-white/15 hover:text-white transition-colors shrink-0 rounded-lg";

/**
 * WorkspaceToolbar — minimalistische volledig-brede werkbalk onderaan.
 * Scherpe hoeken, solide donkere achtergrond, monochrome tabs. Geen glas,
 * geen ronde hoeken, geen kleur-chaos. Streep bovenin als actieve indicator.
 */
export default function WorkspaceToolbar() {
  const { openModule, openChat, openVoice, setPendingMessage } = usePanel();
  const { active, start, stop, captured, clear } = useContextCapture();
  const location = useLocation();
  const stayCollapsed = location.pathname === "/life/personal-admin" || location.pathname === "/Pagina-Ontwerp";
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState(getActiveBoard());
  const [custom, setCustom] = useState(loadCustomBoards());
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [note, setNote] = useState("");
  const [savingCtx, setSavingCtx] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const collapseTimer = useRef(null);
  const enterTimer = useRef(null);

  // kalme, sensitievere hover — hij wacht 450ms voor hij opent (blijft dus
  // even dicht bij een snelle muisbeweging) en blijft na verlaten ±6s open.
  const expand = () => {
    if (stayCollapsed) return;
    clearTimeout(collapseTimer.current);
    clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => setExpanded(true), 1000);
  };
  const scheduleCollapse = (ms = 6000) => {
    if (stayCollapsed) return;
    clearTimeout(collapseTimer.current);
    clearTimeout(enterTimer.current);
    collapseTimer.current = setTimeout(() => setExpanded(false), ms);
  };
  useEffect(() => {
    if (stayCollapsed) { setExpanded(false); return; }
    setExpanded(true); scheduleCollapse(6000);
    return () => { clearTimeout(collapseTimer.current); clearTimeout(enterTimer.current); };
  }, [stayCollapsed]);

  useEffect(() => { if (captured) setNote(""); }, [captured]);
  useEffect(() => {
    const h = () => setLauncherOpen(true);
    window.addEventListener("giulia:open-launcher", h);
    return () => window.removeEventListener("giulia:open-launcher", h);
  }, []);

  // Houd het actieve board in sync met swipes / andere componenten.
  useEffect(() => {
    const h = (e) => { setBoard(e.detail); setCustom(loadCustomBoards()); };
    window.addEventListener("giulia:board-change", h);
    return () => window.removeEventListener("giulia:board-change", h);
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
    setEditingBoardId(id);
    setEditingLabel("Nieuw");
  };
  const startEdit = (b) => { setEditingBoardId(b.id); setEditingLabel(b.label); };
  const commitEdit = () => {
    const label = (editingLabel || "").trim() || "Dashboard";
    if (editingBoardId) { renameCustomBoard(editingBoardId, label); setCustom(loadCustomBoards()); }
    setEditingBoardId(null);
  };
  const removeBoard = (id) => {
    deleteCustomBoard(id);
    setCustom(loadCustomBoards());
    if (board === id) selectBoard(DEFAULT_BOARDS[0].id);
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
          expanded ? "w-[calc(100vw-5.5rem)] lg:w-[calc(100vw-7.5rem)]" : "w-[224px]"
        )}
        onMouseEnter={expand}
        onMouseLeave={() => scheduleCollapse(8000)}
      >
        <div
          className="relative flex items-center h-11 rounded-full overflow-hidden w-full"
          style={{
            background: "rgba(120,122,128,0.10)",
            backdropFilter: "blur(30px) saturate(1.4)",
            WebkitBackdropFilter: "blur(30px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 18px 40px -16px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.18)",
          }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: accent, opacity: 0.06 }} />
          {expanded ? (
            <>
              {/* Dashboard tabs (left) */}
              <div className="flex items-center gap-0.5 overflow-x-auto shrink-0 max-w-[46%] lg:max-w-[54%] pl-2.5 lg:pl-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {all.map((b) => {
                  const on = board === b.id;
                  const customBoard = !isDefaultBoard(b.id);
                  if (editingBoardId === b.id) {
                    return (
                      <input
                        key={b.id}
                        autoFocus
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingBoardId(null); }}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] bg-foreground/15 text-foreground rounded outline-none w-[92px]"
                      />
                    );
                  }
                  return (
                    <span key={b.id} className="inline-flex items-center shrink-0">
                      <button
                        onClick={() => selectBoard(b.id)}
                        onDoubleClick={() => customBoard && startEdit(b)}
                        title={customBoard ? "Dubbelklik om te hernoemen" : b.label}
                        className={cn(
                          "px-2.5 lg:px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-colors",
                          on ? "text-foreground" : "text-foreground/55 hover:text-foreground/85"
                        )}
                      >
                        {b.label}
                      </button>
                      {on && customBoard && (
                        <button onClick={() => removeBoard(b.id)} title="Dashboard sluiten" className="ml-0.5 h-4 w-4 flex items-center justify-center text-foreground/45 hover:text-foreground transition">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
                <button onClick={addBoard} title="Dashboard toevoegen" className="shrink-0 h-7 w-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"><Plus className="h-3.5 w-3.5" /></button>
              </div>

              {/* spacer */}
              <div className="flex-1" />

              {/* Giulia input */}
              <form onSubmit={submit} className="hidden sm:flex items-center gap-2.5 w-[30%] lg:w-[22%]">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-pulse-soft shrink-0" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask Giulia anything…" className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-foreground/55 focus:outline-none text-right" />
              </form>
            </>
          ) : (
            <button
              onClick={() => { if (!stayCollapsed) setExpanded(true); }}
              className="ml-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap text-foreground shrink-0"
            >
              {all.find((b) => b.id === board)?.label || "GIULIA"}
            </button>
          )}

          {/* Actions — altijd zichtbaar; bij ingeklapt alleen de belangrijkste (bellen + chat) */}
          <div className={cn("ml-auto flex items-center gap-0.5 shrink-0", expanded ? "px-1.5 lg:px-2" : "pr-2")}>
            {expanded && (
              <>
                <button onClick={() => { expand(); active ? stop() : start(); }} aria-label="Context toevoegen" className={cn(actionBtn, active && "text-foreground")}><BrainCircuit className="h-4 w-4" /></button>
                </>
                )}
                <button onClick={() => { expand(); if (stayCollapsed) window.dispatchEvent(new CustomEvent("giulia:ontwerp-stage", { detail: "voice" })); else openVoice(); }} aria-label="Bel Giulia" className={actionBtn}><Phone className="h-4 w-4" /></button>
                <button onClick={() => { expand(); if (stayCollapsed) window.dispatchEvent(new CustomEvent("giulia:ontwerp-stage", { detail: "chat" })); else openChat(); }} aria-label="Chat met Giulia" className={actionBtn}><MessageSquare className="h-4 w-4" /></button>
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

      {/* QuickLauncher — eigen rondje rechts, altijd toegankelijk (zelfde glas als de toolbar) */}
      <button
        onClick={() => setLauncherOpen(true)}
        aria-label="QuickLauncher"
        className="fixed bottom-4 lg:bottom-6 right-4 lg:right-6 z-30 h-11 w-11 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        style={{
          background: "rgba(120,122,128,0.10)",
          backdropFilter: "blur(30px) saturate(1.4)",
          WebkitBackdropFilter: "blur(30px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 18px 40px -16px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.18)",
        }}
      >
        <Plus className="h-4 w-4 text-white" />
      </button>

      <QuickLauncher open={launcherOpen} onClose={() => setLauncherOpen(false)} />
    </>
  );
}