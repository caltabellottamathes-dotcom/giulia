import React, { useState } from "react";
import { useGiuliaVoice } from "@/lib/GiuliaVoiceContext";
import { ArrowUp } from "lucide-react";

const SUGGESTIONS = [
  "Wat staat er vandaag op de agenda?",
  "Maak een taak aan",
  "Zijn er nieuwe emails?",
  "Vat mijn dag samen",
];

/**
 * ConciergePanel — refraction-material panel above the concierge avatar.
 * Outlined-pill text input + dynamic suggestion pills; shows live
 * transcript/reply state from the voice state machine.
 */
export default function ConciergePanel() {
  const { state, transcript, reply, error, sendText } = useGiuliaVoice();
  const [input, setInput] = useState("");

  const submit = () => {
    if (!input.trim()) return;
    sendText(input.trim());
    setInput("");
  };

  return (
    <div className="refraction-panel w-[300px] lg:w-[340px] p-4 animate-scale-in">
      <div className="relative min-h-[36px] mb-3">
        {error ? (
          <p className="text-xs text-red-300">{error}</p>
        ) : state === "listening" ? (
          <p className="text-xs text-ivory/70">Ik luister…</p>
        ) : state === "thinking" ? (
          <p className="text-xs text-ivory/70">Giulia denkt na…</p>
        ) : reply ? (
          <p className="text-sm text-ivory leading-relaxed">{reply}</p>
        ) : transcript ? (
          <p className="text-xs text-ivory/50 italic">"{transcript}"</p>
        ) : (
          <p className="text-xs text-ivory/50">Houd de avatar ingedrukt om te praten, of typ hieronder.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => sendText(s)}
            className="rounded-full bg-ivory/10 border border-ivory/15 px-2.5 py-1 text-[11px] text-ivory/75 hover:bg-ivory/15 transition"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/5 px-3.5 py-2 focus-within:border-olive/50 transition-colors">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Vraag Giulia anything…"
          className="flex-1 min-w-0 bg-transparent text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={!input.trim()}
          className="h-7 w-7 rounded-full bg-olive flex items-center justify-center text-ivory disabled:opacity-40 transition shrink-0"
          aria-label="Verstuur"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}