import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useGiuliaAgent } from "@/lib/GiuliaAgentContext";
import { X, ArrowUp, Loader2, Sparkles, ChevronDown, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENT_NAME = "giulia_assistant";

const SUGGESTIONS = [
  "Wat staan er vandaag voor taken?",
  "Geef een overzicht van lopende projecten",
  "Maak een idee aan voor een nieuwe samenwerking",
  "Wie zijn mijn belangrijkste contacten?",
];

export default function GiuliaAgentPanel() {
  const { open, closePanel, conversationId, setConversationId } = useGiuliaAgent();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const convRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    let unsub = () => {};
    (async () => {
      try {
        let convId = conversationId;
        if (!convId) {
          const existing = await base44.agents
            .listConversations({ agent_name: AGENT_NAME })
            .catch(() => []);
          if (existing && existing.length) {
            convId = existing[0].id;
            convRef.current = existing[0];
          } else {
            const conv = await base44.agents.createConversation({
              agent_name: AGENT_NAME,
              metadata: { name: "Giulia Agent" },
            });
            convId = conv.id;
            convRef.current = conv;
          }
          setConversationId(convId);
        } else {
          convRef.current = await base44.agents.getConversation(convId).catch(() => convRef.current);
        }
        unsub = base44.agents.subscribeToConversation(convId, (data) => {
          setMessages(data.messages || []);
        });
      } catch {
        setThinking(false);
      }
    })();
    return () => unsub();
  }, [open, conversationId, setConversationId]);

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
    if (messages.length && messages[messages.length - 1].role === "assistant") {
      setThinking(false);
    }
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    );
  }, [messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !convRef.current || thinking) return;
    setInput("");
    setThinking(true);
    try {
      await base44.agents.addMessage(convRef.current, { role: "user", content });
    } catch {
      setThinking(false);
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
                  Met tool-toegang tot je data
                </p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-ivory/60" />
          </div>

          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-7 py-4 space-y-4">
            {messages.length === 0 && !thinking && (
              <div className="flex flex-col items-center text-center py-14 px-4">
                <p className="font-display font-semibold text-2xl text-ivory mb-3 tracking-[-0.01em]">
                  Hier is Giulia.
                </p>
                <p className="text-[13px] text-ivory/55 max-w-[18rem] leading-relaxed">
                  Je persoonlijke agent met directe toegang tot je projecten, taken,
                  agenda en contacten. Vraag me anything — ik pak het zelf op.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-ivory/50 text-xs ml-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Giulia werkt eraan…
              </div>
            )}
          </div>

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
      <div className="max-w-[88%] chat-bubble px-[18px] py-3 text-sm text-ivory leading-relaxed space-y-2">
        {message.content ? (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        ) : (
          <span className="text-ivory/40 italic">…</span>
        )}
        {message.tool_calls?.map((tc, i) => (
          <FunctionDisplay key={i} toolCall={tc} />
        ))}
      </div>
    </div>
  );
}

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);

  const resultsRaw = toolCall.results;
  let parsedResults = resultsRaw;
  if (typeof resultsRaw === "string") {
    try { parsedResults = JSON.parse(resultsRaw); } catch { parsedResults = resultsRaw; }
  }

  let args = toolCall.arguments_string;
  if (typeof args === "string") {
    try { args = JSON.parse(args); } catch { /* keep raw */ }
  }

  const status = toolCall.status;
  const failed = status === "failed" || status === "error";
  const label =
    status === "running" || status === "in_progress" || status === "pending"
      ? "loopt…"
      : failed
      ? "mislukt"
      : "klaar";

  const proj = toolCall.display_projection || {};
  const hide = proj.hide_details && proj.details_redacted;
  const stateLabel = failed ? proj.error_label || label : proj.label || toolCall.name || "tool";
  const activeLabel = proj.active_label || stateLabel;

  if (hide) {
    return (
      <div className="flex items-center gap-2 pt-1 text-[11px] text-ivory/55">
        <Wrench className="h-3 w-3" />
        <span>{failed ? label : activeLabel}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-ivory/10 bg-ivory/[0.04] text-[11px] text-ivory/70 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-ivory/[0.04] transition-colors"
      >
        <Wrench className={`h-3 w-3 ${failed ? "text-red-300/70" : "text-olive/70"}`} />
        <span className="font-medium text-ivory/80">{toolCall.name || "tool"}</span>
        <span className={`ml-auto ${failed ? "text-red-300/60" : "text-ivory/45"}`}>{label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {args && Object.keys(args).length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ivory/40 mb-1">Parameters</p>
              <pre className="whitespace-pre-wrap break-words text-[10px] text-ivory/60">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
          {parsedResults !== undefined && parsedResults !== null && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ivory/40 mb-1">Resultaat</p>
              <pre className="whitespace-pre-wrap break-words text-[10px] text-ivory/60 max-h-40 overflow-auto">
                {typeof parsedResults === "string"
                  ? parsedResults
                  : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}