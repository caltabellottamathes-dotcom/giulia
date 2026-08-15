import React, { useState, useEffect } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useContextCapture } from "@/lib/ContextCaptureContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Plus, Phone, MessageSquare, BrainCircuit, X, Send, Loader2,
} from "lucide-react";
import QuickLauncher from "@/components/glass/QuickLauncher";

// Mobile: a small transparent pill with the 3 icons only.
// Desktop: the full bottom-anchored glass panel with the Giulia text input.
const actionBtn =
  "h-9 w-9 lg:h-10 lg:w-10 rounded-full flex items-center justify-center text-foreground/70 lg:text-ivory/85 hover:bg-foreground/10 lg:hover:bg-ivory/15 hover:text-foreground lg:hover:text-ivory transition-colors shrink-0";

export default function InteractionBar() {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { openModule, openChat, setPendingMessage } = usePanel();
  const { active, start, stop, captured, clear } = useContextCapture();
  const [note, setNote] = useState("");
  const [savingCtx, setSavingCtx] = useState(false);

  useEffect(() => { if (captured) setNote(""); }, [captured]);

  // "Meer" in de bottom-nav opent dezelfde launcher.
  useEffect(() => {
    const h = () => setLauncherOpen(true);
    window.addEventListener("giulia:open-launcher", h);
    return () => window.removeEventListener("giulia:open-launcher", h);
  }, []);

  const saveContext = async () => {
    if (!captured) return;
    setSavingCtx(true);
    try {
      const content = note.trim() ? `${captured.text}\n\nContext van Salvo: ${note.trim()}` : captured.text;
      await base44.entities.Memory.create({ content, category: "Important information", source: "manual_context" });
      clear();
    } finally {
      setSavingCtx(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    setQuery("");
    setPendingMessage(text);
    openChat();
  };

  return (
    <>
      <div
        data-no-capture
        className={cn(
          "fixed z-30 flex items-center gap-1.5 lg:gap-2 overflow-hidden animate-fade-up",
          "bottom-5 right-4 px-2 py-1.5",
          "lg:bottom-0 lg:right-10 lg:w-[560px] lg:px-4 lg:py-3",
          "rounded-full lg:rounded-t-[24px] lg:rounded-b-none",
          "bg-transparent border border-foreground/15 ring-1 ring-inset ring-foreground/5",
          "lg:bg-[rgba(48,50,55,0.18)] lg:backdrop-blur-[22px] lg:backdrop-saturate-[1.35] lg:border-white/15 lg:ring-white/10 lg:shadow-[0_28px_64px_-26px_rgba(0,0,0,0.42),inset_0_1px_0_0_rgba(255,255,255,0.14)]"
        )}
      >
        <span className="hidden lg:block pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: "hsl(var(--sand))" }} />
        <form onSubmit={submit} className="hidden lg:flex items-center gap-2.5 flex-1 min-w-0">
          <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vraag Giulia anything…"
            className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/45 focus:outline-none"
          />
        </form>
        <span className="hidden lg:block h-6 w-px bg-ivory/15 shrink-0" />
        <button onClick={active ? stop : start} aria-label="Context toevoegen" className={cn(actionBtn, active && "text-olive")}>
          <BrainCircuit className="h-5 w-5" />
        </button>
        <button onClick={() => setLauncherOpen(true)} aria-label="Snelle acties" className={actionBtn}>
          <Plus className="h-5 w-5" />
        </button>
        <button onClick={() => openModule("voice")} aria-label="Bel Giulia" className={actionBtn}>
          <Phone className="h-5 w-5" />
        </button>
        <button onClick={openChat} aria-label="Chat met Giulia" className={actionBtn}>
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>

      {(active || captured) && (
        <div data-no-capture className="fixed z-40 right-4 lg:right-10 bottom-20 lg:bottom-16 w-[calc(100%-2rem)] lg:w-[360px] glass-3 rounded-2xl p-4 space-y-3 animate-slide-up text-ivory">
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
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Extra context toevoegen (optioneel)…"
                className="w-full text-sm bg-ivory/5 border border-ivory/15 rounded-lg px-3 py-2 focus:outline-none text-ivory placeholder:text-ivory/40 min-h-[56px] resize-none"
              />
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