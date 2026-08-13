import React, { useRef, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { X, ArrowUp, Loader2, Phone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatMarkdown from "@/components/glass/ChatMarkdown";
import ChatVoiceCall from "@/components/panels/ChatVoiceCall";

/**
 * ChatWindow — Giulia's conversation panel. Slides in from the right edge
 * as a full-height refraction-glass panel. All traffic flows through the
 * backend function `chatWithGiulia`.
 */
const SUGGESTIONS = [
  "Wat staat er vandaag op de agenda?",
  "Bereid een email voor aan Sarah",
  "Zijn er agendabotsingen deze week?",
  "Maak een taak aan: review concurrenten",
];

export default function ChatWindow() {
  const { chatOpen, closeChat, openModule, pendingMessage, setPendingMessage } = usePanel();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [superagent, setSuperagent] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (chatOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [chatOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && chatOpen) closeChat(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [chatOpen, closeChat]);

  const scrollToBottom = (behavior = "smooth") =>
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.Message.list("-created_date", 200);
      const inApp = (list || []).filter((m) => m.channel === "in-app");
      setMessages(inApp.reverse().slice(-120));
    } catch { setMessages([]); }
  }, []);

  // Bij openen altijd het laatst verstuurde bericht meteen tonen — niet het
  // allereerste. Spring direct (geen smooth) naar de bodem zodra de berichten
  // geladen zijn, en opnieuw ná de slide-in animatie (0.4s), zodat de laatste
  // bubble altijd boven de invoer staat — op elke pagina.
  useEffect(() => {
    if (!chatOpen) return;
    const timers = [];
    load().then(() => {
      timers.push(setTimeout(() => scrollToBottom("auto"), 40));
      timers.push(setTimeout(() => scrollToBottom("auto"), 220));
      timers.push(setTimeout(() => scrollToBottom("auto"), 460));
    });
    return () => timers.forEach(clearTimeout);
  }, [chatOpen, load]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, role: "user", content }]);
    setThinking(true);
    scrollToBottom();
    try {
      await base44.functions.invoke("chatWithGiulia", { message: content });
      await load();
    } catch (e) {
      setMessages((prev) => [...prev, { id: `e${Date.now()}`, role: "giulia", content: "Er ging iets mis bij het bereiken van Giulia. Probeer het opnieuw." }]);
    } finally {
      setThinking(false);
      requestAnimationFrame(() => scrollToBottom("auto"));
      setTimeout(() => scrollToBottom("smooth"), 120);
    }
  };

  // Messages entered in the interaction bar are handed off here on open.
  useEffect(() => {
    if (chatOpen && pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      send(msg);
    }
  }, [chatOpen, pendingMessage, setPendingMessage]);

  if (!chatOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/15 animate-fade-in" onClick={closeChat} />

      <div className="fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 z-50 w-[calc(100%-2rem)] lg:w-[460px] animate-slide-right">
        <div className="refraction-panel h-full flex flex-col">
          {/* Close — top-left */}
          <button
            onClick={closeChat}
            className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Inline voice call — direct spraakgesprek met GIULIA-GIULIA (of Superagent) */}
          {callActive && (
            <ChatVoiceCall superagent={superagent} onEnd={() => setCallActive(false)} />
          )}

          {/* Header */}
          <div className="shrink-0 px-7 pt-7 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 ml-12">
              <span className="h-2.5 w-2.5 rounded-full bg-olive animate-pulse-soft" />
              <div>
                <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">
                  Giulia
                </p>
                <p className="text-[11px] text-ivory/50 mt-1.5 tracking-wide">Actief · vraag me anything</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSuperagent((s) => !s)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold border transition-all",
                  superagent
                    ? "bg-olive text-ivory border-olive"
                    : "bg-ivory/10 border-ivory/15 text-ivory/60 hover:text-ivory"
                )}
                title="Superagent GIULIA — vollere redenering met tools"
              >
                <Sparkles className="h-3 w-3" /> Super
              </button>
              <button
                onClick={() => setCallActive(true)}
                className="flex items-center gap-2 rounded-full pl-3 pr-4 py-2 bg-ivory/10 border border-ivory/15 text-ivory/80 text-[12px] font-medium hover:bg-ivory/15 transition-all"
              >
                <Phone className="h-3.5 w-3.5" /> Bel
              </button>
            </div>
          </div>

          {/* Messages — generous whitespace, bubbles breathe */}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-7 py-4 space-y-4">
            {messages.length === 0 && !thinking && (
              <div className="flex flex-col items-center text-center py-14 px-4">
                <p className="font-display font-semibold text-2xl text-ivory mb-3 tracking-[-0.01em]">
                  Hier is Giulia.
                </p>
                <p className="text-[13px] text-ivory/55 max-w-[18rem] leading-relaxed">
                  Je digitale assistent. Ik beheer je agenda, taken, mail en meer — vraag me anything.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-ivory/50 text-xs ml-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Giulia denkt na…
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="px-7 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="chat-bubble px-4 py-2 text-[12px] text-ivory/70 hover:text-ivory transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input — spacious */}
          <div className="shrink-0 px-7 pb-7 pt-4">
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Vraag Giulia anything…"
                className="flex-1 chat-bubble px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || thinking}
                className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Verstuur"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-[20px] rounded-br-md px-[18px] py-3 text-sm leading-relaxed text-background tracking-[-0.01em]"
          style={{ background: "rgba(45, 45, 35, 0.92)" }}
        >
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] chat-bubble px-[18px] py-3 text-sm text-ivory leading-relaxed">
        <ChatMarkdown>{message.content}</ChatMarkdown>
      </div>
    </div>
  );
}