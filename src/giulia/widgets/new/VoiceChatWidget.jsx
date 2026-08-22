import React, { useRef, useState, useEffect } from "react";
import { useGiuliaChat } from "@/lib/useGiuliaChat";
import { usePanel } from "@/lib/PanelContext";
import { ArrowUp, Loader2, X } from "lucide-react";
import ChatMarkdown from "@/system/components/glass/ChatMarkdown";

/**
 * VoiceChatWidget — compact chat-window dat naast het voice-paneel zweeft
 * (op de plek van de oude Hotline2Widget). Deelt hetzelfde gesprek als de
 * /chat-pagina via useGiuliaChat.
 */
export default function VoiceChatWidget() {
  const { messages, send, sending, ready } = useGiuliaChat();
  const { closeVoice } = usePanel();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const doSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    try { await send(content, {}); } catch { /* ignore */ }
  };

  return (
    <div className="w-[560px] max-w-[calc(100vw-3rem)] h-[440px] rounded-[24px] refraction-panel flex flex-col overflow-hidden animate-fade-up">
      {/* header */}
      <div className="shrink-0 px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-olive animate-pulse-soft" />
          <div>
            <p className="font-display font-semibold tracking-[0.22em] text-[12px] uppercase text-ivory leading-none">GIULIA · CHAT</p>
            <p className="text-[10px] text-ivory/50 mt-1 tracking-wide">Typ je vraag · zelfde gesprek</p>
          </div>
        </div>
        <button
          onClick={closeVoice}
          aria-label="Sluiten"
          className="h-7 w-7 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/60 hover:text-ivory transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 space-y-3">
        {messages.length === 0 && !sending && ready && (
          <p className="text-[12px] text-ivory/55 text-center py-10">Stel je vraag aan Giulia…</p>
        )}
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
              {isUser ? (
                <div className="max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2 text-[13px] leading-relaxed text-background" style={{ background: "rgba(45,45,35,0.92)" }}>
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[85%] chat-bubble px-3.5 py-2 text-[13px] text-ivory leading-relaxed">
                  <ChatMarkdown>{m.content}</ChatMarkdown>
                </div>
              )}
            </div>
          );
        })}
        {sending && (
          <div className="flex items-center gap-2 text-ivory/50 text-xs ml-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Giulia denkt na…
          </div>
        )}
      </div>

      {/* input */}
      <div className="shrink-0 px-5 pb-5 pt-3">
        <div className="flex items-end gap-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); doSend(); } }}
            placeholder="Vraag Giulia anything…  (⌘/Ctrl+Enter = verstuur)"
            rows={1}
            className="flex-1 chat-bubble px-4 py-3 text-[13px] text-ivory placeholder:text-ivory/40 focus:outline-none resize-none max-h-28"
            style={{ minHeight: "44px" }}
          />
          <button
            onClick={() => doSend()}
            disabled={!input.trim() || sending}
            className="h-11 w-11 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Verstuur"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}