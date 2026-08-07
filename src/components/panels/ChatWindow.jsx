import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

/**
 * ChatWindow — a dedicated, floating chat window for the Giulia agent.
 * Distinct from the module panels: it floats bottom-right, coexists with
 * other panels, and runs the in-app "giulia" agent (with entity tools) via
 * the Base44 agents SDK. Giulia can read & update the app on the user's behalf.
 */
const SUGGESTIONS = [
  "Wat staat er vandaag op de agenda?",
  "Bereid een email voor aan Sarah",
  "Zijn er agendabotsingen deze week?",
  "Maak een taak aan: review concurrenten",
];

export default function ChatWindow() {
  const { chatOpen, closeChat } = usePanel();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // Load or create a conversation with the giulia agent when the window opens
  useEffect(() => {
    if (!chatOpen) return;
    let active = true;
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: "giulia" });
        let conv = Array.isArray(list) && list.length ? list[0] : null;
        if (!conv) {
          conv = await base44.agents.createConversation({
            agent_name: "giulia",
            metadata: { name: "Giulia" },
          });
        }
        if (!active) return;
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch (e) {
        /* agent not yet configured — empty state will show */
      }
    })();
    return () => {
      active = false;
    };
  }, [chatOpen]);

  // Stream updates from the agent
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const last = messages[messages.length - 1];
  const thinking =
    !!last &&
    (last.role === "user" ||
      (last.role === "assistant" &&
        !last.content &&
        (last.tool_calls || []).some((t) =>
          ["pending", "running", "in_progress"].includes(t.status)
        )));

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation || thinking) return;
    setInput("");
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch (e) {
      /* ignore */
    }
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 lg:bottom-7 lg:right-7 z-[60] w-[calc(100%-2.5rem)] sm:w-[400px] h-[min(620px,calc(100vh-3rem))] flex flex-col glass-3 float-shadow rounded-2xl overflow-hidden animate-scale-in">
      {/* Header with editorial fashion image */}
      <div className="relative shrink-0 h-20 overflow-hidden">
        <img
          src={IMAGES.sittingChairs}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/55 to-charcoal/30" />
        <div className="relative h-full flex items-center justify-between px-5">
          <div className="flex items-center gap-2.5 text-ivory">
            <span className="h-2.5 w-2.5 rounded-sm bg-ivory" />
            <span className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase">
              Giulia
            </span>
            <span className="text-[11px] text-ivory/60 font-medium ml-1 hidden sm:inline">
              Concierge
            </span>
          </div>
          <button
            onClick={closeChat}
            className="h-8 w-8 rounded-lg bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.length === 0 && !thinking && (
          <div className="flex flex-col items-center text-center py-10">
            <p className="font-display font-semibold text-lg text-foreground mb-2">
              Hier is Giulia.
            </p>
            <p className="text-[13px] text-foreground/55 max-w-[15rem]">
              Je persoonlijke concierge. Vraag me anything — ik beheer je agenda,
              taken, mail en meer.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {thinking && last?.role === "user" && (
          <div className="flex items-center gap-2 text-foreground/50 text-xs ml-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Giulia denkt na…
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
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
            className="flex-1 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-olive/30"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || thinking}
            className="h-10 w-10 rounded-xl bg-charcoal text-ivory flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Verstuur"
          >
            <Send className="h-4 w-4" />
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
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-foreground/8 px-3.5 py-2.5 text-sm text-foreground">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2">
        {message.content && (
          <div className="rounded-2xl rounded-bl-md glass-1 px-3.5 py-2.5 text-sm text-foreground leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {(message.tool_calls || []).map((tc, i) => (
          <ToolCall key={i} toolCall={tc} />
        ))}
      </div>
    </div>
  );
}

function ToolCall({ toolCall }) {
  const status = toolCall.status;
  const resultsStr = JSON.stringify(toolCall.results || "");
  const failed = ["failed", "error"].includes(status) || /error|failed/i.test(resultsStr);
  const running = ["pending", "running", "in_progress"].includes(status);
  const label = toolCall.display_projection?.label || toolCall.name;
  return (
    <div className="flex items-center gap-2 text-[11px] text-foreground/55">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          failed ? "bg-red-500" : running ? "bg-olive animate-pulse-soft" : "bg-emerald-500"
        }`}
      />
      <span className="font-medium">{label}</span>
      <span className="text-foreground/40">
        {failed ? "mislukt" : running ? "loopt" : "klaar"}
      </span>
    </div>
  );
}