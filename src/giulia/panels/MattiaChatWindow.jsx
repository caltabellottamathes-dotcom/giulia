import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";

const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const INK = "#2a2c30";

/** MattiaChatWindow — Whipped Pistachio glas-paneel. Chat met Mattia via de
 *  BYOK chatWithMattia backend-functie (Mattia Gemini API-key). */
export default function MattiaChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("chatWithMattia", { messages: next });
      setMessages([...next, { role: "assistant", content: res?.reply || "…" }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Mattia is even stil." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ color: INK }}>
      <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: OLIVE }}>Mattia · chat</p>
          <h3 className="text-base font-display font-bold leading-tight">Mattia</h3>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
        {messages.length === 0 && <p className="text-sm italic opacity-50">Zeg hallo tegen Mattia…</p>}
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm" style={isUser ? { background: PISTACHIO, color: INK, boxShadow: "0 6px 16px -8px rgba(0,0,0,0.3)" } : { background: "rgba(255,255,255,0.62)", border: "1px solid rgba(0,0,0,0.06)", color: INK }}>
                {isUser ? <p className="whitespace-pre-wrap">{m.content}</p> : <ReactMarkdown>{m.content}</ReactMarkdown>}
              </div>
            </div>
          );
        })}
        {busy && <div className="flex justify-start"><div className="rounded-2xl px-3 py-2 text-sm opacity-60" style={{ background: "rgba(255,255,255,0.62)" }}>…</div></div>}
      </div>
      <div className="p-3 border-t flex gap-2" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Praat met Mattia…" className="flex-1 rounded-full px-4 py-2 text-sm bg-white/70 outline-none" style={{ border: "1px solid rgba(0,0,0,0.08)" }} />
        <button onClick={send} disabled={busy} className="h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-50 transition" style={{ background: OLIVE, color: PISTACHIO }}><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}