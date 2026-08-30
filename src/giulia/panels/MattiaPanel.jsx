import React, { useState } from "react";
import { MessageSquare, Phone } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";

const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";

/** MattiaPanel — transparante shell binnen de project-slide-over. De
 *  Chat/Voice-toggle opent nu de globale full-screen MATTIA'S HOTLINE windows
 *  (gemount in Layout) en sluit de slide-over. */
export default function MattiaPanel({ onClose }) {
  const { openMattiaChat, openMattiaVoice } = usePanel();
  const [mode, setMode] = useState("chat");

  const choose = (m) => {
    setMode(m);
    if (m === "voice") openMattiaVoice();
    else openMattiaChat();
    onClose?.();
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ color: "#2a2c30" }}>
      <div className="flex items-center gap-1.5 px-3 pt-12 pb-2 border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        {[{ k: "chat", l: "Chat", I: MessageSquare }, { k: "voice", l: "Voice", I: Phone }].map((t) => (
          <button key={t.k} onClick={() => choose(t.k)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition" style={mode === t.k ? { background: OLIVE, color: PISTACHIO } : { color: OLIVE, background: "rgba(0,0,0,0.05)" }}>
            <t.I className="w-3.5 h-3.5" />{t.l}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm" style={{ color: OLIVE }}>Mattia opent in zijn eigen hotline-window.</p>
        <p className="text-xs opacity-60">Kies Chat of Voice hierboven om te starten.</p>
      </div>
    </div>
  );
}