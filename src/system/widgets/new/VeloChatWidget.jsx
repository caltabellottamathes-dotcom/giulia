import React, { useState, useRef, useEffect } from "react";
import { useVeloChat } from "@/lib/useVeloChat";
import { usePanel } from "@/lib/PanelContext";
import VeloMessageBubble from "@/system/components/VeloMessageBubble";
import { ArrowUp, Wrench } from "lucide-react";

/** VeloChatWidget — compacte SYSTEM-chatwidget voor het dashboard. Deelt
 *  dezelfde draad als het Velo-paneel. Klik op de header opent het paneel. */
export default function VeloChatWidget() {
  const { openModule } = usePanel();
  const { messages, send, sending, ready } = useVeloChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const recent = messages.slice(-5);

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
    <div className="relative w-full h-[260px] rounded-[28px] overflow-hidden flex flex-col" style={{ background: "rgba(48,50,55,0.18)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)", color: "hsl(var(--ivory))" }}>
      <div className="shrink-0 px-4 pt-3.5 pb-2 flex items-center justify-between cursor-pointer" onClick={() => openModule("velochat")}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full animate-pulse-soft bg-olive" />
          <span className="text-[10px] uppercase tracking-[0.28em] font-bold">VELO · SYSTEM</span>
        </div>
        <Wrench className="h-3.5 w-3.5 text-ivory/50" />
      </div>
      <div className="mx-4 h-px bg-ivory/10" />
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
        {!ready ? (
          <div className="flex items-center justify-center py-8"><div className="h-4 w-4 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
        ) : messages.length === 0 ? (
          <p className="text-[12px] text-ivory/50 text-center py-8 leading-relaxed">Velo luistert. Geef een systeem- of ontwerpverandering door — hij voert hem uit of legt hem vast.</p>
        ) : (
          recent.map((m) => <VeloMessageBubble key={m.id || m.created_date + m.content} message={m} />)
        )}
        {sending && <div className="flex items-center gap-1.5 text-ivory/50 text-[11px] ml-1"><span className="h-1 w-1 rounded-full bg-ivory/50 animate-pulse" /><span>Velo typt…</span></div>}
      </div>
      <div className="shrink-0 p-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
          placeholder="Systeem of ontwerp doorgeven…"
          rows={1}
          className="flex-1 chat-bubble px-3.5 py-2.5 text-[13px] text-ivory placeholder:text-ivory/40 focus:outline-none resize-none max-h-24"
          style={{ minHeight: "40px" }}
        />
        <button onClick={() => doSend()} disabled={!input.trim() || sending} className="h-10 w-10 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100" aria-label="Verstuur">
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}