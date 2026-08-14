import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { Send, Mic, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import PageHero from "@/components/glass/PageHero";
import ChatMarkdown from "@/components/glass/ChatMarkdown";

const GIULIA_AVATAR = IMAGES.giuliaConcierge;
const PILLS = ["Wat staat er vandaag?", "Openstaande taken?", "Check mijn email", "Wat is veranderd?"];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.Message.list("-created_date", 200);
      // Alleen de GIULIA-GIULIA-conversatie — achtergrondbriefingen zijn verstoken.
      const inApp = (list || []).filter((m) => m.channel === "in-app");
      setMessages(inApp.reverse());
    } catch (e) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const didInit = useRef(false);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: didInit.current ? "smooth" : "auto" });
    if (messages.length) didInit.current = true;
  }, [messages, sending]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    const temp = { id: "tmp" + Date.now(), role: "user", content: msg, created_date: new Date().toISOString() };
    setMessages((prev) => [...prev, temp]);
    try {
      // Rechtstreeks naar GIULIA-CONNECT (chatWithGiulia) — geen tussenlaag.
      await base44.functions.invoke("chatWithGiulia", { message: msg, persist: true });
      await load();
    } catch (e) {
      toast({ title: "Bericht niet verzonden", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // Auto-send a question passed via ?ask= (used by the Briefing "Leg uit" action)
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current) return;
    const ask = new URLSearchParams(window.location.search).get("ask");
    if (ask) { asked.current = true; send(ask); }
  }, [send]);

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
        {/* Messages */}
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
            messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                  {isUser ? (
                    <div className="h-8 w-8 rounded-full bg-charcoal flex items-center justify-center shrink-0 text-[10px] font-semibold text-ivory">SC</div>
                  ) : (
                    <img src={GIULIA_AVATAR} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                  )}
                  <div className={cn("max-w-[78%]", isUser ? "items-end" : "items-start", "flex flex-col")}>
                    {!isUser && m.agent_source && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 px-1">
                        <Sparkles className="h-3 w-3" /> {m.agent_source}
                      </span>
                    )}
                    <div className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      isUser ? "bg-foreground/8 text-foreground" : "glass-1 text-foreground"
                    )}>
                      {isUser ? m.content : <ChatMarkdown className="prose prose-sm max-w-none">{m.content}</ChatMarkdown>}
                    </div>
                  </div>
                </div>
              );
            })
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

        {/* Pills */}
        {messages.length <= 2 && (
          <div className="px-5 lg:px-7 pb-3 flex flex-wrap gap-2">
            {PILLS.map((p) => (
              <button key={p} onClick={() => send(p)} className="glass-1 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
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