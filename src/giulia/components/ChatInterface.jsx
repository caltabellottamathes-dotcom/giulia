import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Send, AlertCircle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

const GIULIA_AVATAR = IMAGES.giuliaConcierge;

/**
 * ChatInterface — the real Giulia chat. Sends to the chatWithGiulia backend
 * function, persists every message to the Message entity (channel "in-app"),
 * renders Giulia with her portrait and the user with initials. Reused by the
 * full-screen Chat page and the Giulia concierge widget.
 */
export default function ChatInterface({ threadId = "in-app-main", suggestions = [], className }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);
  const [initials, setInitials] = useState("SC");
  const scrollRef = useRef(null);
  const lastInput = useRef("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const recs = await base44.entities.Message.filter({ channel: "in-app", thread_id: threadId });
        if (mounted) setMessages([...recs].sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0)));
      } catch {
        /* ignore */
      }
      if (mounted) setLoading(false);
    })();
    base44.auth.me().then((u) => {
      if (u?.full_name) {
        const parts = u.full_name.split(" ").filter(Boolean);
        const inits = (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
        if (inits) setInitials(inits.toUpperCase());
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, [threadId]);

  const scrollToBottom = () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, thinking]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || thinking) return;
    lastInput.current = content;
    setInput("");
    setError(null);
    const userMsg = { role: "user", content, thread_id: threadId, channel: "in-app", status: "sent" };
    let userRec = null;
    try { userRec = await base44.entities.Message.create(userMsg); } catch {}
    setMessages((prev) => [...prev, userRec ? { ...userRec } : { id: "u" + Date.now(), ...userMsg }]);
    setThinking(true);
    try {
      const res = await base44.functions.invoke("chatWithGiulia", { message: content });
      const data = res?.data ?? res ?? {};
      const reply = data.response || "(geen antwoord)";
      const gMsg = { role: "giulia", content: reply, thread_id: threadId, channel: "in-app", status: "sent" };
      let gRec = null;
      try { gRec = await base44.entities.Message.create(gMsg); } catch {}
      setMessages((prev) => [...prev, gRec ? { ...gRec } : { id: "g" + Date.now(), ...gMsg }]);
    } catch (e) {
      setError("Giulia reageert niet. Probeer het opnieuw.");
    } finally {
      setThinking(false);
    }
  };

  const retry = () => { setError(null); send(lastInput.current); };

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 space-y-3">
        {loading ? (
          <div className="space-y-3 p-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-8 rounded-lg shimmer" style={{ width: `${60 + i * 10}%` }} />)}
          </div>
        ) : messages.length === 0 && !thinking ? (
          <div className="flex flex-col items-center text-center py-6 px-3">
            <img src={GIULIA_AVATAR} alt="Giulia" className="h-12 w-12 rounded-full object-cover mb-3 border border-foreground/10" />
            <p className="text-sm font-semibold text-foreground mb-1">Hier is Giulia</p>
            <p className="text-xs text-foreground/55 max-w-xs">Je digitale assistent. Vraag me anything.</p>
          </div>
        ) : (
          messages.map((m) => <Bubble key={m.id} m={m} initials={initials} />)
        )}

        {thinking && (
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

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={retry} className="inline-flex items-center gap-1 font-semibold hover:underline"><RefreshCw className="h-3 w-3" /> Opnieuw</button>
        </div>
      )}

      {messages.length === 0 && !loading && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full bg-foreground/5 border border-foreground/10 px-2.5 py-1 text-[11px] text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Vraag Giulia anything…"
          className="flex-1 min-w-0 rounded-2xl bg-foreground/5 border border-foreground/10 px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-olive/40"
        />
        <button onClick={() => send()} disabled={!input.trim() || thinking} className="h-10 w-10 rounded-2xl bg-charcoal text-ivory flex items-center justify-center hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100 shrink-0" aria-label="Verstuur">
          {thinking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Bubble({ m, initials }) {
  const isUser = m.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end gap-2 items-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-charcoal text-ivory px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
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