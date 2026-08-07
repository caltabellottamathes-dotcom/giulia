import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { X, ArrowUp, Loader2, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";

/**
 * ChatWindow — a dedicated, refined floating window for the Giulia agent.
 * Distinct from the module panels: floats bottom-right, coexists with other
 * panels, and runs the in-app "giulia" agent via the Base44 agents SDK.
 */
const SUGGESTIONS = [
  "Wat staat er vandaag op de agenda?",
  "Bereid een email voor aan Sarah",
  "Zijn er agendabotsingen deze week?",
  "Maak een taak aan: review concurrenten",
];

export default function ChatWindow() {
  const { chatOpen, closeChat, openModule } = usePanel();
  const [conversation, setConversation] = useState(null);
  const [mesolives, setMesolives] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

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
        setMesolives(conv.mesolives || []);
      } catch (e) {
        /* agent not yet configured — empty state will show */
      }
    })();
    return () => {
      active = false;
    };
  }, [chatOpen]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMesolives(data.mesolives || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mesolives]);

  const last = mesolives[mesolives.length - 1];
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
      await base44.agents.addMesolive(conversation, { role: "user", content });
    } catch (e) {
      /* ignore */
    }
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 lg:right-7 lg:bottom-7 z-[60] w-[calc(100%-2rem)] sm:w-[440px] h-[min(680px,calc(100vh-3rem))] flex flex-col glass-4 float-shadow rounded-[28px] overflow-hidden animate-scale-in">
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
            <button
              onClick={closeChat}
              className="h-8 w-8 rounded-lg bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
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

      {/* Mesolives */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3.5">
        {mesolives.length === 0 && !thinking && (
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
        {mesolives.map((m) => (
          <MesoliveBubble key={m.id} mesolive={m} />
        ))}
        {thinking && last?.role === "user" && (
          <div className="flex items-center gap-2 text-foreground/50 text-xs ml-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Giulia denkt na…
          </div>
        )}
      </div>

      {/* Suggestions */}
      {mesolives.length <= 1 && (
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

function MesoliveBubble({ mesolive }) {
  const isUser = mesolive.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-charcoal text-ivory px-3.5 py-2.5 text-sm leading-relaxed">
          {mesolive.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2">
        {mesolive.content && (
          <div className="rounded-2xl rounded-bl-md glass-1 px-3.5 py-2.5 text-sm text-foreground leading-relaxed">
            <ReactMarkdown>{mesolive.content}</ReactMarkdown>
          </div>
        )}
        {(mesolive.tool_calls || []).map((tc, i) => (
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
          failed ? "bg-red-500" : running ? "bg-olive animate-pulse-soft" : "bg-olive"
        }`}
      />
      <span className="font-medium">{label}</span>
      <span className="text-foreground/40">
        {failed ? "mislukt" : running ? "loopt" : "klaar"}
      </span>
    </div>
  );
}