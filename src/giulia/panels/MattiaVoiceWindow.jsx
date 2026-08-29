import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";

const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const INK = "#2a2c30";

/** MattiaVoiceWindow — Whipped Pistachio glas-paneel, voice-stijl. Spraak via
 *  de browser (Web Speech API nl-NL); antwoorden van de Mattia-agent worden
 *  voorgelezen (SpeechSynthesis). */
export default function MattiaVoiceWindow({ onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    let conv = null;
    try { conv = base44.agents.createConversation({ agent_name: "mattia", metadata: { name: "Mattia Voice" } }); } catch { conv = null; }
    if (!conv) return;
    setConversation(conv);
    setMessages(conv.messages || []);
    let unsub = () => {};
    try {
      unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        const msgs = data.messages || [];
        setMessages(msgs);
        const last = msgs[msgs.length - 1];
        if (last && last.role === "assistant" && last.content) speak(last.content);
      });
    } catch {}
    return () => { try { unsub && unsub(); } catch {}; try { recRef.current && recRef.current.stop(); } catch {}; try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {} };
  }, []);

  const speak = (text) => {
    try {
      const u = new SpeechSynthesisUtterance(String(text).replace(/[#*_>`]/g, ""));
      u.lang = "nl-NL"; u.rate = 1.02;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch {}
  };

  const toggleListen = () => {
    if (listening) { try { recRef.current && recRef.current.stop(); } catch {} setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !conversation) { alert("Spraakherkenning wordt niet ondersteund in deze browser."); return; }
    const rec = new SR(); rec.lang = "nl-NL"; rec.interim = false; rec.continuous = false;
    rec.onresult = (e) => { const t = e.results[0][0].transcript; send(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  };

  const send = async (text) => {
    if (!text.trim() || !conversation || busy) return;
    setBusy(true);
    try { await base44.agents.addMessage(conversation, { role: "user", content: text.trim() }); } catch {}
    setBusy(false);
  };

  const last = messages[messages.length - 1];

  return (
    <div className="flex flex-col h-full" style={{ color: INK }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: OLIVE }}>Mattia · voice</p>
        <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5" style={{ background: "rgba(0,0,0,0.06)" }}><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-5 p-5">
        <button onClick={toggleListen} className="relative h-28 w-28 rounded-full flex items-center justify-center transition" style={{ background: listening ? OLIVE : PISTACHIO, color: INK, boxShadow: listening ? "0 0 0 10px rgba(148,146,93,0.22), 0 12px 30px -10px rgba(0,0,0,0.35)" : "0 12px 30px -10px rgba(0,0,0,0.3)" }}>
          {listening ? <MicOff className="w-9 h-9" style={{ color: PISTACHIO }} /> : <Mic className="w-9 h-9" />}
          {listening && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(148,146,93,0.3)" }} />}
        </button>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: OLIVE }}>{listening ? "luistert…" : busy ? "denkt…" : "tik om te praten"}</p>
        <div className="max-w-[92%] text-center min-h-[64px]">
          {last && last.role === "assistant"
            ? <ReactMarkdown className="text-sm">{last.content}</ReactMarkdown>
            : <p className="text-sm italic opacity-50">Praat tegen Mattia…</p>}
        </div>
      </div>
      <div className="px-4 pb-3 text-center text-[8px] uppercase tracking-[0.18em] opacity-40">browser-stem · nl-NL</div>
    </div>
  );
}