import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import Avatar from "@/components/glass/Avatar";
import { mockWhatsApp, mockContacts, mockProjects } from "@/lib/mockData";
import {
  Search, Send, Sparkles, Check, Edit3, RefreshCw, X, Phone, Video,
} from "lucide-react";

export default function WhatsApp() {
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [showGiuliaSuggestion, setShowGiuliaSuggestion] = useState(true);

  const conversations = mockContacts.filter((c) =>
    mockWhatsApp.some((m) => m.contact_id === c.id)
  );

  const messages = mockWhatsApp.filter((m) => m.contact_id === selectedContact?.id);
  const project = mockProjects.find((p) => p.id === messages[0]?.project_id);

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">WhatsApp</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw berichten, met Giulia's hulp</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Conversation list */}
        <div className="lg:col-span-3 min-h-0">
          <GlassPanel level={2} className="h-full flex flex-col">
            <div className="p-4 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input placeholder="Zoek gesprek..." className="w-full glass-1 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((contact) => {
                const contactMessages = mockWhatsApp.filter((m) => m.contact_id === contact.id);
                const lastMessage = contactMessages[contactMessages.length - 1];
                const hasUnread = contactMessages.some((m) => m.direction === "received" && m.status === "unread");
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 border-b border-border/30 transition-colors hover:bg-foreground/[0.02] text-left",
                      selectedContact?.id === contact.id && "bg-foreground/[0.04]"
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

        {/* Conversation */}
        <div className="lg:col-span-6 min-h-0">
          <GlassPanel level={2} className="h-full flex flex-col">
            {/* Contact header */}
            <div className="flex items-center gap-3 p-4 border-b border-border/40">
              <Avatar src={selectedContact?.avatar} name={selectedContact?.name} size="md" />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedContact?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedContact?.company}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"><Phone className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"><Video className="h-4 w-4" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.direction === "sent" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.direction === "sent"
                      ? "bg-olive/15 border border-olive/20"
                      : "glass-1"
                  )}>
                    <p>{msg.message}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Giulia suggestion */}
              {showGiuliaSuggestion && selectedContact?.id === "c1" && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] glass-1 rounded-2xl border-olive/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-olive" />
                      <p className="text-[10px] font-medium uppercase tracking-wider text-olive">Prepared by Giulia</p>
                    </div>
                    <p className="text-sm text-foreground/80 mb-3">Ja, dat werkt. Ik bel je morgen om 10:00 om het door te nemen.</p>
                    <div className="flex gap-2">
                      <GlassButton variant="primary" size="sm" onClick={() => setShowGiuliaSuggestion(false)}>
                        <Send className="h-3.5 w-3.5" /> Verstuur
                      </GlassButton>
                      <GlassButton variant="outline" size="sm"><Edit3 className="h-3.5 w-3.5" /> Bewerk</GlassButton>
                      <GlassButton variant="ghost" size="sm"><RefreshCw className="h-3.5 w-3.5" /> Herformuleer</GlassButton>
                      <GlassButton variant="ghost" size="sm" onClick={() => setShowGiuliaSuggestion(false)}>
                        <X className="h-3.5 w-3.5" /> Afwijzen
                      </GlassButton>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/40">
              <div className="flex items-center gap-2">
                <input
                  placeholder="Typ een bericht..."
                  className="flex-1 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
                <GlassButton variant="primary" size="icon"><Send className="h-4 w-4" /></GlassButton>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Context sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Contact context</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Bedrijf:</span> {selectedContact?.company}</p>
              <p><span className="text-muted-foreground">Functie:</span> {selectedContact?.role}</p>
              <p><span className="text-muted-foreground">Email:</span> {selectedContact?.email}</p>
            </div>
          </GlassPanel>

          {project && (
            <GlassPanel level={1} className="p-5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Gekoppeld project</h3>
              <p className="text-sm font-medium">{project.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{project.category}</p>
            </GlassPanel>
          )}

          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-olive" />
              <h3 className="text-sm font-heading font-medium">Giulia suggestie</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedContact?.name} heeft een onbeantwoord bericht. Wil je dat ik een reactie voorbereid?
            </p>
            <GlassButton variant="glass" size="sm" className="w-full mt-3">
              <Sparkles className="h-3.5 w-3.5" /> Bereid reactie voor
            </GlassButton>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}