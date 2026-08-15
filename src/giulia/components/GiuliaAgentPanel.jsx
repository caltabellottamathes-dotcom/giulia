import React, { useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useGiuliaAgent } from "@/lib/GiuliaAgentContext";
import { X, ArrowUp, Loader2, Sparkles } from "lucide-react";
import ChatMarkdown from "@/system/components/glass/ChatMarkdown";

/**
 * GiuliaAgentPanel — het agent-paneel. Loopt volledig via de eigen BYOK
 * Gemini-sleutels (chatWithGiulia), NIET via de platform-agent-runtime
 * (Core.InvokeLLM). Giulia's redeneer-loop draait server-side op eigen
 * sleutels, dus het paneel werkt ook buiten integration-credits.
 */
const SUGGESTIONS = [
  "Wat staan er vandaag voor taken?",
  "Geef een overzicht van lopende projecten",
  "Maak een idee aan voor een nieuwe samenwerking",
  "Wie zijn mijn belangrijkste contacten?",
];

export default function GiuliaAgentPanel() {
  const { open, closePanel } = useGiuliaAgent();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.Message.list("-created_date", 200);
      const inApp = (list || []).filter((m) => m.channel === "in-app");
      setMessages(inApp.reverse());
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (open) { setLoading(true); load(); } }, [open, load]);

  useEffect(() => {
    if (document && open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && open) closePanel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closePanel]);

  useEffect(() => {
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    );
  }, [messages, sending]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    const temp = { id: "tmp" + Date.now(), role: "user", content, created_date: new Date().toISOString() };
    setMessages((prev) => [...prev, temp]);
    try {
      // Rechtstreeks naar GIULIA-CONNECT (chatWithGiulia) — BYOK Gemini.
      await base44.functions.invoke("chatWithGiulia", { message: content, source: "chat", persist: true });
      await load();
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/15 animate-fade-in" onClick={closePanel} />

      <div className="fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 z-50 w-[calc(100%-2rem)] lg:w-[480px] animate-slide-right">
        <div className="refraction-panel h-full flex flex-col">
          <button
            onClick={closePanel}
            className="absolute top-4 left-4 z-20 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="shrink-0 px-7 pt-7 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 ml-12">
              <span className="h-2.5 w-2.5 rounded-full bg-olive animate-pulse-soft" />
              <div>
                <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">
                  Giulia Agent
                </p>
                <p className="text-[11px] text-ivory/50 mt-1.5 tracking-wide">
                  Eigen Gemini · direct op je data
                </p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-ivory/60" />
          </div>

          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-7 py-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="h-5 w-5 animate-spin text-ivory/40" />
              </div>
            ) : messages.length === 0 && !sending ? (
              <div className="flex flex-col items-center text-center py-14 px-4">
                <p className="font-display font-semibold text-2xl text-ivory mb-3 tracking-[-0.01em]">
                  Hier is Giulia.
                </p>
                <p className="text-[13px] text-ivory/55 max-w-[18rem] leading-relaxed">
                  Je persoonlijke agent met directe toegang tot je projecten, taken,
                  agenda en contacten. Vraag me anything — ik pak het zelf op.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === "user";
                return isUser ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-[20px] rounded-br-md px-[18px] py-3 text-sm leading-relaxed text-background tracking-[-0.01em]" style={{ background: "rgba(45, 45, 35, 0.92)" }}>
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[88%] chat-bubble px-[18px] py-3 text-sm text-ivory leading-relaxed">
                      <ChatMarkdown className="prose prose-sm max-w-none prose-invert">{m.content}</ChatMarkdown>
                    </div>
                  </div>
                );
              })
            )}
            {sending && (
              <div className="flex items-center gap-2 text-ivory/50 text-xs ml-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Giulia werkt eraan…
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="px-7 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="chat-bubble px-4 py-2 text-[12px] text-ivory/70 hover:text-ivory transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

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
                disabled={!input.trim() || sending}
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