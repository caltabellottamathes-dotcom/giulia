import React from "react";
import { useConversation } from "@elevenlabs/react";
import { Mic, MicOff, X, Loader2 } from "lucide-react";

const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const INK = "#2a2c30";
const AGENT_ID = "agent_0301m14xfjxhfnh86pd8m19mdgvb";

/** MattiaVoiceWindow — Whipped Pistachio glas-paneel. Verbindt met de
 *  ElevenLabs Conversational AI-agent "mattia" (agent_0301m14xfjxhfnh86pd8m19mdgvb).
 *  Client-tool navigate_to stuurt Salvo real-time door de app. */
export default function MattiaVoiceWindow({ onClose }) {
  const conversation = useConversation();
  const status = conversation?.status || "disconnected";
  const isSpeaking = conversation?.isSpeaking;
  const messages = conversation?.messages || [];
  const active = status === "connected" || status === "connecting";

  const toggle = async () => {
    try {
      if (active) { await conversation.endSession(); return; }
      await conversation.startSession({
        agentId: AGENT_ID,
        clientTools: {
          navigate_to: async ({ route }) => {
            try { if (route) window.location.assign(String(route).startsWith("/") ? route : "/" + route); } catch {}
            return { success: true };
          },
        },
      });
    } catch {}
  };

  return (
    <div className="flex flex-col h-full" style={{ color: INK }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: OLIVE }}>Mattia · voice</p>
        <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5" style={{ background: "rgba(0,0,0,0.06)" }}><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-5 p-5">
        <button onClick={toggle} className="relative h-28 w-28 rounded-full flex items-center justify-center transition" style={{ background: active ? OLIVE : PISTACHIO, color: INK, boxShadow: active && isSpeaking ? "0 0 0 12px rgba(148,146,93,0.22), 0 12px 30px -10px rgba(0,0,0,0.35)" : "0 12px 30px -10px rgba(0,0,0,0.3)" }}>
          {status === "connecting" ? <Loader2 className="w-9 h-9 animate-spin" /> : active ? <MicOff className="w-9 h-9" style={{ color: PISTACHIO }} /> : <Mic className="w-9 h-9" />}
          {active && isSpeaking && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(148,146,93,0.3)" }} />}
        </button>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: OLIVE }}>{status === "connecting" ? "verbinden…" : active ? (isSpeaking ? "mattia praat…" : "luistert") : "tik om te starten"}</p>
        <div className="max-w-[92%] text-center min-h-[60px] space-y-1">
          {messages.length === 0
            ? <p className="text-sm italic opacity-50">Mattia staat klaar — tik de microfoon.</p>
            : messages.slice(-3).map((m, i) => (<p key={i} className="text-sm leading-snug">{m?.message || ""}</p>))}
        </div>
      </div>
      <div className="px-4 pb-3 text-center text-[8px] uppercase tracking-[0.18em] opacity-40">ElevenLabs Conversational AI</div>
    </div>
  );
}