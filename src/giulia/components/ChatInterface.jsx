import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useGiuliaChat } from "@/lib/useGiuliaChat";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { useActiveDomain } from "@/lib/useActiveDomain";
import { Send, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

const GIULIA_AVATAR = IMAGES.giuliaConcierge;

/**
 * ChatInterface — Giulia chat via useGiuliaChat (→ chatWithGiulia backend,
 * BYOK Gemini). Eén gedeeld gesprek (thread "giulia"), realtime antwoord,
 * géén dubbele persist (chatWithGiulia slaat zelf op). Reused by the
 * full-screen Chat page and the Giulia concierge widget.
 *
 * Let op: threadId prop wordt genegeerd — useGiuliaChat gebruikt altijd
 * thread "giulia" (zelfde gesprek als /chat en de chat-panelen).
 */
export default function ChatInterface({ suggestions = [], className }) {
  const { messages, send, sending, ready } = useGiuliaChat();
  const [input, setInput] = useState("");
  const [initials, setInitials] = useState("SC");
  const { accent, bubbleText } = useActiveDomain();
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.full_name) {
        const parts = u.full_name.split(" ").filter(Boolean);
        const inits = (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
        if (inits) setInitials(inits.toUpperCase());
      }
    }).catch(() => {});
  }, []);

  const scrollToBottom = () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, sending]);

  const submit = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    try { await send(content); } catch { /* hook toont de fout in het gesprek */ }
  };

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 space-y-3">
        {!ready ? (
          <div className="space-y-3 p-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-8 rounded-lg shimmer" style={{ width: `${60 + i * 10}%` }} />)}
          </div>
        ) : messages.length === 0 && !sending ? (
          <div className="flex flex-col items-center text-center py-6 px-3">
            <img src={GIULIA_AVATAR} alt="Giulia" className="h-12 w-12 rounded-full object-cover mb-3 border border-foreground/10" />
            <p className="text-sm font-semibold text-foreground mb-1">Hier is Giulia</p>
            <p className="text-xs text-foreground/55 max-w-xs">Je digitale assistent. Vraag me anything.</p>
          </div>
        ) : (
          messages.map((m) => <Bubble key={m.id} m={m} initials={initials} accent={accent} bubbleText={bubbleText} />)
        )}

        {sending && (
          <div className="flex items-center gap-2 text-foreground/50 text-xs ml-1">
            <img src={GIULIA_AVATAR} alt="" className="h-6 w-6 rounded-full object-cover" />
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-pulse-soft" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
            </span>
          </div>
        )}
      </div>

      {messages.length === 0 && ready && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => submit(s)} className="rounded-full bg-foreground/5 border border-foreground/10 px-2.5 py-1 text-[11px] text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Vraag Giulia anything…"
          className="flex-1 min-w-0 rounded-2xl bg-foreground/5 border border-foreground/10 px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-olive/40"
        />
        <button onClick={() => submit()} disabled={!input.trim() || sending} className="h-10 w-10 rounded-2xl bg-charcoal text-ivory flex items-center justify-center hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100 shrink-0" aria-label="Verstuur">
          {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Bubble({ m, initials, accent, bubbleText }) {
  const isUser = m.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end gap-2 items-end">
        <div className={cn("max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap", bubbleText)} style={{ background: accent }}>{m.content}</div>
        <span className="h-7 w-7 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-semibold text-foreground/70 shrink-0">{initials}</span>
      </div>
    );
  }
  return (
    <div className="flex justify-start gap-2 items-end">
      <img src={GIULIA_AVATAR} alt="Giulia" className="h-7 w-7 rounded-full object-cover shrink-0" />
      <div className="max-w-[85%] rounded-2xl rounded-bl-md glass-1 px-3.5 py-2.5 text-sm text-foreground leading-relaxed">
        <ReactMarkdown>{m.content}</ReactMarkdown>
      </div>
    </div>
  );
}