import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { Send, Mic, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/system/components/glass/PageHero";
import AgentMessageBubble from "@/giulia/components/AgentMessageBubble";

const GIULIA_AVATAR = IMAGES.giuliaConcierge;
const PILLS = ["Wat staat er vandaag?", "Openstaande taken?", "Check mijn email", "Wat is veranderd?"];

function toBubble(m) {
  return {
    id: m.id,
    role: m.role === "user" ? "user" : "assistant",
    content: m.content || "",
    tool_calls: Array.isArray(m.tool_calls) ? m.tool_calls : [],
  };
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const { toast } = useToast();

  const loadMessages = useCallback(async () => {
    const list = await base44.entities.Message.filter({ channel: "in-app" }, "-created_date", 60).catch(() => []);
    const ordered = (list || []).slice().reverse();
    setMessages(ordered.map(toBubble));
  }, []);

  useEffect(() => {
    (async () => {
      await loadMessages();
      setLoading(false);
    })();
  }, [loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    const userBubble = { id: `local-${Date.now()}`, role: "user", content: msg, tool_calls: [] };
    setMessages((prev) => [...prev, userBubble]);
    setSending(true);
    try {
      const res = await base44.functions.invoke("chatWithGiulia", { message: msg, source: "chat" });
      await loadMessages();
      if (!res?.ok) toast({ title: "Giulia reageerde niet", variant: "destructive" });
    } catch (e) {
      toast({ title: "Verzenden mislukt", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const asked = useRef(false);
  useEffect(() => {
    if (asked.current || loading) return;
    const ask = new URLSearchParams(window.location.search).get("ask");
    if (ask) { asked.current = true; send(ask); }
  }, [loading]);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-up">
      <PageHero
        page="chat"
        icon={Sparkles}
        eyebrow="GIULIA-GIULIA"
        title="GIULIA-GIULIA"
        subtitle="Hoofd van communicatie — weet alles, daagt je uit, altijd online"
        actions={
          <Link to="/voice" className="glass-button rounded-full h-9 px-3 inline-flex items-center gap-2 text-xs font-medium text-foreground/80 hover:text-foreground">
            <Mic className="h-4 w-4" /> Voice
          </Link>
        }
      />

      <div className="glass-2 rounded-3xl flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 lg:p-7 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <img src={GIULIA_AVATAR} alt="" className="h-16 w-16 rounded-full object-cover mb-3" />
              <p className="text-lg font-display font-medium">Waar kan ik je mee helpen?</p>
              <p className="text-sm text-muted-foreground mt-1">Stel een vraag of kies een suggestie hieronder.</p>
            </div>
          ) : (
            messages.map((m) => (
              <AgentMessageBubble key={m.id} message={m} isUser={m.role === "user"} avatar={GIULIA_AVATAR} />
            ))
          )}

          {sending && (
            <div className="flex gap-3">
              <img src={GIULIA_AVATAR} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
              <div className="glass-1 rounded-2xl px-4 py-3 flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-5 lg:px-7 pb-3 flex flex-wrap gap-2">
            {PILLS.map((p) => (
              <button key={p} onClick={() => send(p)} className="glass-1 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Vraag Giulia iets..."
              className="flex-1 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30"
            />
            <button
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              className="h-10 w-10 rounded-xl bg-charcoal text-ivory flex items-center justify-center disabled:opacity-40 hover:-translate-y-0.5 transition-transform"
              aria-label="Verzenden"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}