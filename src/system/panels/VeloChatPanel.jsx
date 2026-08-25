import React, { useState, useRef, useEffect } from "react";
import { useVeloChat } from "@/lib/useVeloChat";
import VeloMessageBubble from "@/system/components/VeloMessageBubble";
import { ArrowUp, Wrench } from "lucide-react";

const SUGGESTIONS = [
  "Voeg een widget toe aan het FOCUS-dashboard",
  "Verwissel de achtergrondfoto van LIFE",
  "Wat staat er in het SYSTEM-dashboard?",
  "Leg een ontwerpverandering vast voor de builder",
];

/** VeloChatPanel — full-bleed SYSTEM-chatpaneel (module). Deelt dezelfde
 *  draad als de widget. FloatingPanel levert de sluitknop linksboven. */
export default function VeloChatPanel() {
  const { messages, send, sending, ready } = useVeloChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const doSend = (text) => {
    const c = (text ?? input).trim();
    if (!c || sending) return;
    setInput("");
    send(c);
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ background: "rgba(10,12,16,0.34)" }}>
      <div className="shrink-0 px-7 pt-7 pb-4">
        <div className="flex items-center gap-3 ml-12">
          <span className="h-2.5 w-2.5 rounded-full animate-pulse-soft bg-olive" />
          <div>
            <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">VELO · SYSTEM</p>
            <p className="text-[11px] text-ivory/50 mt-1.5 tracking-wide">System Agent · voert systeem- en ontwerpveranderingen uit</p>
          </div>
        </div>
      </div>
      <div className="px-7 pb-1"><div className="h-px bg-olive/60" /></div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden px-7 py-4 space-y-4">
        {!ready ? (
          <div className="flex items-center justify-center py-20"><div className="h-5 w-5 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 px-4">
            <Wrench className="h-6 w-6 text-olive mb-3" />
            <p className="font-display font-semibold text-2xl text-ivory mb-3 tracking-[-0.01em]">Hier is Velo.</p>
            <p className="text-[13px] text-ivory/55 max-w-[20rem] leading-relaxed">De System Agent van GIULIA OS. Geef systeem- of ontwerpveranderingen door — hij voert ze uit of legt ze vast.</p>
          </div>
        ) : (
          messages.map((m) => <VeloMessageBubble key={m.id || m.created_date + m.content} message={m} />)
        )}
        {sending && (
          <div className="flex items-center gap-2 text-ivory/60 text-xs ml-1">
            <span className="inline-flex items-center gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-ivory/60 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </span>
            <span>Velo typt…</span>
          </div>
        )}
      </div>

      {messages.length === 0 && ready && (
        <div className="px-7 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => <button key={s} onClick={() => doSend(s)} className="chat-bubble px-4 py-2 text-[12px] text-ivory/70 hover:text-ivory transition-colors">{s}</button>)}
        </div>
      )}

      <div className="shrink-0 px-7 pb-7 pt-3">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
            placeholder="Systeem- of ontwerpverandering doorgeven…  (Enter = verstuur)"
            rows={1}
            className="flex-1 chat-bubble px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none resize-none max-h-40"
            style={{ minHeight: "48px" }}
          />
          <button onClick={() => doSend()} disabled={!input.trim() || sending} className="h-12 w-12 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100" aria-label="Verstuur">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}