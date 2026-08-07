import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { mockChatMessages, mockProjects, mockTasks, mockEvents } from "@/lib/mockData";
import {
  Sparkles, Send, Calendar, CheckSquare, FileText, Users,
  Briefcase, Mic,
} from "lucide-react";

const suggestedPrompts = [
  "Wat staat er vandaag op de agenda?",
  "Bereid een email voor aan Sarah",
  "Is er een agendabotsing deze week?",
  "Samenvatting van het marktanalyse project",
];

export default function Chat() {
  const [messages, setMessages] = useState(mockChatMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: `msg${Date.now()}`, role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const giuliaMsg = {
        id: `msg${Date.now() + 1}`,
        role: "giulia",
        content: "Ik werk eraan. Ik kan je helpen met afspraken, onderzoek, informatie-retrieval, en taakbeheer. Wat specifiek heb je nodig?",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, giuliaMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-7rem)] grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
      {/* Chat area */}
      <div className="lg:col-span-2 flex flex-col min-h-0">
        <div className="mb-4">
          <h1 className="text-2xl font-heading font-light tracking-tight">Chat met Giulia</h1>
          <p className="text-sm text-muted-foreground mt-1">Je persoonlijke assistent, altijd klaar</p>
        </div>

        <GlassPanel level={2} className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                {msg.role === "giulia" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-foreground/70" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-foreground/8 text-foreground"
                    : "glass-1"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-foreground/70" />
                </div>
                <div className="glass-1 rounded-2xl px-4 py-3 flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length <= 2 && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="glass-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {prompt}
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
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Vraag Giulia iets..."
                className="flex-1 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30"
              />
              <GlassButton variant="primary" size="icon" onClick={() => sendMessage(input)}>
                <Send className="h-4 w-4" />
              </GlassButton>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Context sidebar */}
      <div className="space-y-4 overflow-y-auto">
        <div>
          <h2 className="text-sm font-heading font-medium mb-3">Context</h2>
          <p className="text-xs text-muted-foreground mb-3">Giulia gebruikt deze context zonder dat je het hoeft uit te leggen.</p>
        </div>

        <GlassPanel level={1} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Actief project</h3>
          </div>
          <p className="text-sm font-medium">{mockProjects[0].title}</p>
          <p className="text-xs text-muted-foreground mt-1">{mockProjects[0].progress}% voltooid</p>
        </GlassPanel>

        <GlassPanel level={1} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Agenda vandaag</h3>
          </div>
          <div className="space-y-2">
            {mockEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="text-xs">
                <p className="font-medium">{event.title}</p>
                <p className="text-muted-foreground">{new Date(event.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel level={1} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Actieve taken</h3>
          </div>
          <div className="space-y-1.5">
            {mockTasks.filter((t) => t.status === "today").slice(0, 3).map((task) => (
              <p key={task.id} className="text-xs text-muted-foreground">· {task.title}</p>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel level={1} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Relevante contacten</h3>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs">Sarah Lindeman — Nordic Studio</p>
            <p className="text-xs">Thomas Verbeek — Verbeek Consulting</p>
          </div>
        </GlassPanel>

        <GlassButton variant="glass" size="md" className="w-full" onClick={() => window.location.href = "/voice"}>
          <Mic className="h-4 w-4" /> Schakel naar voice
        </GlassButton>
      </div>
    </div>
  );
}