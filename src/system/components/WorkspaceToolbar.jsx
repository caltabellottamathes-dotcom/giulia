import React, { useState, useEffect } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useContextCapture } from "@/lib/ContextCaptureContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { Plus, Phone, MessageSquare, BrainCircuit, X, Send, Loader2 } from "lucide-react";
import QuickLauncher from "@/system/components/glass/QuickLauncher";
import { DEFAULT_BOARDS, loadCustomBoards, createCustomBoard, getActiveBoard, setActiveBoard } from "@/lib/useDashboardBoard";

const actionBtn = "h-9 w-9 rounded-full flex items-center justify-center text-ivory/80 hover:bg-ivory/15 hover:text-ivory transition-colors shrink-0";

/**
 * WorkspaceToolbar — één volledige glazen werkbalk onderaan over de volle
 * breedte. Links de dashboard-tabs (NOW / GIULIA / FOCUS / LIFE / SELF /
 * SYSTEM), midden de "Vraag Giulia anything"-invoer, rechts de actieknoppen
 * (context, snelstart, bellen, chat). Computer-achtige, verfijnde taakbalk.
 */
export default function WorkspaceToolbar() {
  const { openModule, openChat, setPendingMessage } = usePanel();
  const { active, start, stop, captured, clear } = useContextCapture();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState(getActiveBoard());
  const [custom, setCustom] = useState(loadCustomBoards());
  const [note, setNote] = useState("");
  const [savingCtx, setSavingCtx] = useState(false);

  useEffect(() => { if (captured) setNote(""); }, [captured]);
  useEffect(() => {
    const h = () => setLauncherOpen(true);
    window.addEventListener("giulia:open-launcher", h);
    return () => window.removeEventListener("giulia:open-launcher", h);
  }, []);

  const selectBoard = (id) => {
    setActiveBoard(id);
    setBoard(id);
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
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    setQuery("");
    setPendingMessage(text);
    openChat();
  };

  const all = [...DEFAULT_BOARDS, ...custom];

  return (
    <>
      <div data-no-capture className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
        <div className="mx-auto max-w-[1700px] px-3 lg:px-6 pb-3 pointer-events-auto">
          <div className="relative w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-5 h-14 rounded-[20px] glass-4 border border-white/18 shadow-[0_28px_64px_-26px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.16)]">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[20px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--sand)), transparent)" }} />

            {/* Dashboard tabs */}
            <div className="flex items-center gap-1 overflow-x-auto shrink-0 max-w-[42%] lg:max-w-[50%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {all.map((b) => (
                <button key={b.id} onClick={() => selectBoard(b.id)} className={cn("rounded-full px-2.5 lg:px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition", board === b.id ? "bg-ivory text-charcoal" : "text-ivory/65 hover:text-ivory hover:bg-ivory/10")}>{b.label}</button>
              ))}
              <button onClick={addBoard} title="Dashboard toevoegen" className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-ivory/60 hover:text-ivory hover:bg-ivory/10 transition"><Plus className="h-3.5 w-3.5" /></button>
            </div>

            <span className="hidden lg:block h-6 w-px bg-ivory/15 shrink-0" />

            {/* Giulia input */}
            <form onSubmit={submit} className="flex-1 min-w-0 flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Vraag Giulia anything…" className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/45 focus:outline-none" />
            </form>

            <span className="hidden lg:block h-6 w-px bg-ivory/15 shrink-0" />

            {/* Actions */}
            <button onClick={active ? stop : start} aria-label="Context toevoegen" className={cn(actionBtn, active && "text-olive")}><BrainCircuit className="h-5 w-5" /></button>
            <button onClick={() => setLauncherOpen(true)} aria-label="Snelle acties" className={actionBtn}><Plus className="h-5 w-5" /></button>
            <button onClick={() => openModule("voice")} aria-label="Bel Giulia" className={actionBtn}><Phone className="h-5 w-5" /></button>
            <button onClick={openChat} aria-label="Chat met Giulia" className={actionBtn}><MessageSquare className="h-5 w-5" /></button>
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