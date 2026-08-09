import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { X, ArrowUp, Loader2, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";

/**
 * ChatWindow — dedicated floating window for Giulia.
 * All app→Giulia traffic flows through the backend function `chatWithGiulia`,
 * which bridges to the external Giulia Superagent. The app is the skin;
 * Giulia is the brain.
 */
const SUGGESTIONS = [
  "Wat staat er vandaag op de agenda?",
  "Bereid een email voor aan Sarah",
  "Zijn er agendabotsingen deze week?",
  "Maak een taak aan: review concurrenten",
];

export default function ChatWindow() {
  const { chatOpen, closeChat, openModule } = usePanel();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () =>
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || thinking) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `u${Date.now()}`, role: "user", content },
    ]);
    setThinking(true);
    scrollToBottom();
    try {
      const res = await base44.functions.invoke("chatWithGiulia", {
        message: content,
        ...(conversationId ? { conversation_id: conversationId } : {}),
      });
      const data = res?.data ?? res ?? {};
      if (data.conversation_id) setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `g${Date.now()}`,
          role: "giulia",
          content: data.response || "(geen antwoord)",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e${Date.now()}`,
          role: "giulia",
          content: "Er ging iets mis bij het bereiken van Giulia. Probeer het opnieuw.",
        },
      ]);
    } finally {
      setThinking(false);
      requestAnimationFrame(scrollToBottom);
    }
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 lg:right-7 lg:bottom-7 z-[60] w-[calc(100%-2rem)] sm:w-[440px] h-[min(680px,calc(100vh-3rem))] flex flex-col refraction-panel rounded-[32px] overflow-hidden animate-scale-in">
      <button
        onClick={closeChat}
        className="absolute top-3 left-3 z-20 h-8 w-8 rounded-lg bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
        aria-label="Sluiten"
      >
        <X className="h-4 w-4" />
      </button>
      {/* Header with editorial fashion image */}
      <div className="relative shrink-0 h-28 overflow-hidden">
        <img
          src={IMAGES.sittingChairs}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/90 via-charcoal/60 to-charcoal/30" />
        <div className="relative h-full flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-ivory">
              <span className="h-2.5 w-2.5 rounded-sm bg-ivory" />
              <span className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase">
                Giulia
              </span>
            </div>
            {/* close button moved to top-left of window */}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-ivory text-sm font-medium leading-none">Je assistent</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
                <span className="text-[11px] text-ivory/60">Actief · vraag me anything</span>
              </div>
            </div>
            <button
              onClick={() => openModule("voice")}
              className="flex items-center gap-2 rounded-full pl-3 pr-4 py-2 bg-olive/20 border border-olive/40 text-olive text-[12px] font-medium hover:bg-olive/30 transition-all"
            >
              <Phone className="h-3.5 w-3.5" /> Bel
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3.5">
        {messages.length === 0 && !thinking && (
          <div className="flex flex-col items-center text-center py-10">
            <p className="font-display font-semibold text-xl text-foreground mb-2">
              Hier is Giulia.
            </p>
            <p className="text-[13px] text-foreground/55 max-w-[16rem]">
              Je digitale assistent. Ik beheer je agenda, taken, mail en meer —
              vraag me anything.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-foreground/50 text-xs ml-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Giulia denkt na…
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="glass-1 rounded-full px-3 py-1.5 text-[11px] text-foreground/70 hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Vraag Giulia anything…"
            className="flex-1 glass-1 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-olive/30"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || thinking}
            className="h-11 w-11 rounded-2xl bg-charcoal text-ivory flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Verstuur"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-charcoal text-ivory px-3.5 py-2.5 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md glass-1 px-3.5 py-2.5 text-sm text-foreground leading-relaxed">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}