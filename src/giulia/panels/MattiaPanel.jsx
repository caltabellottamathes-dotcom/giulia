import React, { useState } from "react";
import { MessageSquare, Phone } from "lucide-react";
import MattiaChatWindow from "./MattiaChatWindow";
import MattiaVoiceWindow from "./MattiaVoiceWindow";

const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";

/** MattiaPanel — Whipped Pistachio glas-paneel met Chat/Voice tabs. Bevat de
 *  Mattia ChatWindow en VoiceWindow. Past bij het OS. */
export default function MattiaPanel({ onClose }) {
  const [mode, setMode] = useState("chat");
  return (
    <div className="absolute inset-0 z-50 rounded-[20px] overflow-hidden flex flex-col" style={{ background: "rgba(216,218,179,0.55)", backdropFilter: "blur(28px) saturate(1.45)", WebkitBackdropFilter: "blur(28px) saturate(1.45)", border: "1px solid rgba(255,255,255,0.45)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.4)" }}>
      <div className="flex items-center gap-1.5 p-2 border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        {[{ k: "chat", l: "Chat", I: MessageSquare }, { k: "voice", l: "Voice", I: Phone }].map((t) => (
          <button key={t.k} onClick={() => setMode(t.k)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition" style={mode === t.k ? { background: OLIVE, color: PISTACHIO } : { color: OLIVE, background: "rgba(0,0,0,0.05)" }}>
            <t.I className="w-3.5 h-3.5" />{t.l}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">{mode === "chat" ? <MattiaChatWindow onClose={onClose} /> : <MattiaVoiceWindow onClose={onClose} />}</div>
    </div>
  );
}