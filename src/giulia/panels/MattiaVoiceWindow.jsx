import React, { useMemo, useRef, useEffect, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { Mic, MicOff, Loader2 } from "lucide-react";

const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const INK = "#2a2c30";
const AGENT_ID = "agent_0301m14xfjxhfnh86pd8m19mdgvb";

/** MattiaVoiceWindow — Whipped Pistachio glas-paneel. Verbindt met de
 *  ElevenLabs Conversational AI-agent "Mattia" (agent_0301...). Registreert
 *  ALLE client-tools (buildVoiceClientTools) — navigatie, taken, notities,
 *  geheugen, agenda, journal, check-ins, approvals, delegate — zodat Mattia
 *  dezelfde directe uitvoeringskracht heeft als Giulia's stem-agent. */
export default function MattiaVoiceWindow({ onClose }) {
  const navigate = useNavigate();
  const panel = usePanel() || {};
  const openModule = panel.openModule;
  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

  const [messages, setMessages] = useState([]);
  const processedRef = useRef(new Set());

  const { startSession, endSession, status, isSpeaking } = useConversation({
    agentId: AGENT_ID,
    clientTools,
    onMessage: (payload) => {
      const text = String(payload?.message || "").trim();
      if (!text || processedRef.current.has(text)) return;
      processedRef.current.add(text);
      setMessages((m) => [...m, { role: payload?.source === "ai" ? "ai" : "user", text }]);
    },
  });

  const active = status === "connected";
  const connecting = status === "connecting";

  useEffect(() => {
    return () => { try { endSession(); } catch {} };
  }, [endSession]);

  const toggle = async () => {
    try {
      if (active) { await endSession(); return; }
      setMessages([]);
      processedRef.current.clear();
      await startSession();
    } catch {}
  };

  return (
    <div className="flex flex-col h-full" style={{ color: INK }}>
      <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: OLIVE }}>Mattia · voice</p>
        <span className="ml-auto text-[9px] uppercase tracking-[0.18em] opacity-50">{active ? "live" : "klaar"}</span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-5 p-5">
        <button onClick={toggle} className="relative h-28 w-28 rounded-full flex items-center justify-center transition" style={{ background: active ? OLIVE : PISTACHIO, color: INK, boxShadow: active && isSpeaking ? "0 0 0 12px rgba(148,146,93,0.22), 0 12px 30px -10px rgba(0,0,0,0.35)" : "0 12px 30px -10px rgba(0,0,0,0.3)" }}>
          {connecting ? <Loader2 className="w-9 h-9 animate-spin" /> : active ? <MicOff className="w-9 h-9" style={{ color: PISTACHIO }} /> : <Mic className="w-9 h-9" />}
          {active && isSpeaking && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(148,146,93,0.3)" }} />}
        </button>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: OLIVE }}>{connecting ? "verbinden…" : active ? (isSpeaking ? "mattia praat…" : "luistert") : "tik om te starten"}</p>
        <div className="max-w-[92%] w-full min-h-[60px] space-y-1.5">
          {messages.length === 0
            ? <p className="text-sm italic opacity-50 text-center">Mattia staat klaar — tik de microfoon.</p>
            : messages.slice(-4).map((m, i) => (
              <p key={i} className={"text-sm leading-snug " + (m.role === "ai" ? "" : "opacity-60 text-right")}>{m?.text || ""}</p>
            ))}
        </div>
      </div>
      <div className="px-4 pb-3 text-center text-[8px] uppercase tracking-[0.18em] opacity-40">ElevenLabs · Mattia · alle client-tools actief</div>
    </div>
  );
}