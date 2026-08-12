import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrainCircuit, X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useContextCapture } from "@/lib/ContextCaptureContext";

// Generic "card-like" containers used throughout the app — clicking anywhere
// inside one of these captures that whole element's text, not just a word.
const CONTAINER_SELECTOR =
  "[data-context], .glass-card, .glass-card-2, .chat-bubble, .glass-1, .glass-2, .glass-3, .refraction-panel, .rounded-2xl, .rounded-xl";

/**
 * ContextCaptureLayer — floating toggle (bottom-left) that puts the whole app
 * into "click to remember" mode. While active, clicking ANY element captures
 * its visible text; a small popup then lets Salvo add extra notes before
 * saving it to Giulia's Memory. Works on every page/panel, not just chat.
 */
export default function ContextCaptureLayer() {
  const { active, start, stop, captured, capture, clear } = useContextCapture();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!active) return;
    document.body.style.cursor = "crosshair";
    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.target.closest(CONTAINER_SELECTOR) || e.target;
      const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 500);
      capture(text, e.clientX, e.clientY);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("click", onClick, true);
    };
  }, [active, capture]);

  useEffect(() => { if (captured) setNote(""); }, [captured]);

  const save = async () => {
    if (!captured) return;
    setSaving(true);
    try {
      const content = note.trim() ? `${captured.text}\n\nContext van Salvo: ${note.trim()}` : captured.text;
      await base44.entities.Memory.create({ content, category: "Important information", source: "manual_context" });
      clear();
    } finally {
      setSaving(false);
    }
  };

  const popupStyle = (() => {
    if (!captured) return null;
    const w = 320;
    const left = Math.min(Math.max(captured.x - w / 2, 12), window.innerWidth - w - 12);
    const top = Math.min(captured.y + 12, window.innerHeight - 260);
    return { left, top, width: w };
  })();

  return createPortal(
    <>
      <button
        onClick={active ? stop : start}
        title={active ? "Klikmodus annuleren" : "Voeg context toe aan Giulia's geheugen"}
        className={`fixed bottom-24 left-5 z-[70] h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
          active ? "bg-olive text-ivory scale-110" : "glass-2 text-foreground hover:scale-105"
        }`}
      >
        <BrainCircuit className="h-5 w-5" />
      </button>

      {active && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] glass-2 rounded-full px-4 py-2 text-xs font-medium text-foreground animate-fade-up">
          Klik op iets in de app om het aan Giulia's geheugen toe te voegen
        </div>
      )}

      {captured && popupStyle && (
        <div className="fixed z-[80] glass-3 rounded-2xl p-4 space-y-2.5 animate-scale-in" style={popupStyle}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Onthouden</p>
            <button onClick={clear} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 bg-foreground/5 rounded-lg p-2">
            {captured.text || "(geen tekst gevonden)"}
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Extra context toevoegen (optioneel)…"
            className="w-full text-sm bg-transparent border border-border/50 rounded-lg px-2.5 py-2 focus:outline-none min-h-[56px] resize-none"
          />
          <button
            onClick={save}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-olive text-ivory px-3 py-2 text-xs font-semibold disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Onthoud dit
          </button>
        </div>
      )}
    </>,
    document.body
  );
}