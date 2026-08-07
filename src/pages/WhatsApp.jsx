import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import Avatar from "@/components/glass/Avatar";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import {
  Search, Send, Sparkles, Check, Edit3, RefreshCw, X, Phone, Video,
} from "lucide-react";

export default function WhatsApp() {
  const { data: contacts, loading: contactsLoading } = useEntityList("Contact");
  const { data: messages, loading: messagesLoading, reload } = useEntityList("WhatsAppMessage", { sort: "timestamp" });

  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const [giuliaSuggestion, setGiuliaSuggestion] = useState("");
  const [giuliaLoading, setGiuliaLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!selectedId && contacts.length > 0) setSelectedId(contacts[0].id);
  }, [contacts, selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedContact = contacts.find((c) => c.id === selectedId);
  const conversationMessages = messages
    .filter((m) => m.contact_id === selectedId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const conversations = contacts.filter((c) =>
    messages.some((m) => m.contact_id === c.id)
  );

  const sendMessage = async (text) => {
    if (!text.trim() || !selectedId) return;
    await base44.entities.WhatsAppMessage.create({
      contact_id: selectedId,
      message: text.trim(),
      direction: "sent",
      timestamp: new Date().toISOString(),
      status: "delivered",
    });
    setDraft("");
    setGiuliaSuggestion("");
    reload();
  };

  const askGiulia = async () => {
    if (!selectedContact) return;
    setGiuliaLoading(true);
    try {
      const last = [...conversationMessages].reverse().find((m) => m.direction === "received");
      const prompt = `Bereid een kort, naturel WhatsApp-antwoord voor aan ${selectedContact.name}. Laatste binnenkomend bericht: "${last?.message || "(nog geen)"}". Geef alleen het bericht, geen uitleg.`;
      const res = await base44.functions.invoke("chatWithGiulia", { message: prompt });
      setGiuliaSuggestion(res?.data?.response || "");
    } catch (e) {
      /* ignore */
    } finally {
      setGiuliaLoading(false);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">WhatsApp</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw berichten, met Giulia's hulp</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        <div className="lg:col-span-3 min-h-0">
          <GlassPanel level={2} className="h-full flex flex-col">
            <div className="p-4 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input placeholder="Zoek gesprek..." className="w-full glass-1 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contactsLoading && [0, 1].map((i) => <div key={i} className="h-16 border-b border-border/30 shimmer" />)}
              {!contactsLoading && conversations.length === 0 && (
                <p className="p-6 text-sm text-muted-foreground text-center">Nog geen gesprekken. Voeg contacten toe via Mensen.</p>
              )}
              {conversations.map((contact) => {
                const contactMessages = messages.filter((m) => m.contact_id === contact.id);
                const lastMessage = [...contactMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                const hasUnread = contactMessages.some((m) => m.direction === "received" && m.status === "unread");
                return (
                  <button
                    key={contact.id}
                    onClick={() => { setSelectedId(contact.id); setGiuliaSuggestion(""); }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 border-b border-border/30 transition-colors hover:bg-foreground/[0.02] text-left",
                      selectedId === contact.id && "bg-foreground/[0.04]"
                    )}
                  >
                    <Avatar src={contact.avatar} name={contact.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        {hasUnread && <span className="h-2 w-2 rounded-full bg-olive shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lastMessage?.message}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-6 min-h-0">
          <GlassPanel level={2} className="h-full flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-border/40">
              <Avatar src={selectedContact?.avatar} name={selectedContact?.name} size="md" />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedContact?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedContact?.company}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"><Phone className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"><Video className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading && <div className="h-16 rounded-2xl shimmer" />}
              {!messagesLoading && conversationMessages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Start het gesprek — typ hieronder.</p>
              )}
              {conversationMessages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.direction === "sent" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5 text-sm", msg.direction === "sent" ? "bg-olive/15 border border-olive/20" : "glass-1")}>
                    <p>{msg.message}</p>
                    {msg.timestamp && <p className="text-[9px] text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>}
                  </div>
                </div>
              ))}

              {giuliaSuggestion && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] glass-1 rounded-2xl border-olive/30 p-4">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="h-3.5 w-3.5 text-olive" /><p className="text-[10px] font-medium uppercase tracking-wider text-olive">Door Giulia</p></div>
                    <p className="text-sm text-foreground/80 mb-3">{giuliaSuggestion}</p>
                    <div className="flex gap-2">
                      <GlassButton variant="primary" size="sm" onClick={() => sendMessage(giuliaSuggestion)}><Send className="h-3.5 w-3.5" /> Verstuur</GlassButton>
                      <GlassButton variant="outline" size="sm" onClick={() => setDraft(giuliaSuggestion)}><Edit3 className="h-3.5 w-3.5" /> Bewerk</GlassButton>
                      <GlassButton variant="ghost" size="sm" onClick={() => setGiuliaSuggestion("")}><X className="h-3.5 w-3.5" /></GlassButton>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-4 border-t border-border/40 space-y-2">
              <button onClick={askGiulia} disabled={giuliaLoading || !selectedContact} className="text-[11px] text-olive hover:underline flex items-center gap-1.5 disabled:opacity-50">
                <Sparkles className="h-3.5 w-3.5" /> {giuliaLoading ? "Giulia denkt na..." : "Laat Giulia een reactie voorstellen"}
              </button>
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(draft)}
                  placeholder="Typ een bericht..."
                  className="flex-1 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
                <GlassButton variant="primary" size="icon" onClick={() => sendMessage(draft)}><Send className="h-4 w-4" /></GlassButton>
              </div>
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Contact context</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Bedrijf:</span> {selectedContact?.company || "—"}</p>
              <p><span className="text-muted-foreground">Functie:</span> {selectedContact?.role || "—"}</p>
              <p><span className="text-muted-foreground">Email:</span> {selectedContact?.email || "—"}</p>
            </div>
          </GlassPanel>

          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-olive" /><h3 className="text-sm font-display font-semibold">Giulia</h3></div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Laat Giulia een reactie voorbereiden op basis van het gesprek. Je keurt altijd goed voordat het verstuurd wordt.
            </p>
            <GlassButton variant="glass" size="sm" className="w-full" onClick={askGiulia} disabled={giuliaLoading}>
              <RefreshCw className={cn("h-3.5 w-3.5", giuliaLoading && "animate-spin")} /> Bereid reactie voor
            </GlassButton>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}