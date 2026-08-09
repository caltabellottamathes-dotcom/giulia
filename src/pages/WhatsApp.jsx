import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import Avatar from "@/components/glass/Avatar";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Search, Send, Sparkles, Check, Edit3, RefreshCw, X, Phone, Video, MessageCircle } from "lucide-react";

/**
 * WhatsApp — Giulia has full access: unread & unanswered messages are
 * surfaced, and Giulia automatically prepares a reply (GiuliaDraft) for every
 * incoming message. Salvo approves before anything sends.
 */
export default function WhatsApp() {
  const { toast } = useToast();
  const { data: contacts, loading: contactsLoading } = useEntityList("Contact");
  const { data: messages, loading: messagesLoading, reload: reloadMsgs } = useEntityList("WhatsAppMessage", { sort: "timestamp" });
  const { data: drafts, reload: reloadDrafts } = useEntityList("GiuliaDraft", { filter: { type: "whatsapp" }, sort: "-created_date" });

  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!selectedId && contacts.length > 0) setSelectedId(contacts[0].id);
  }, [contacts, selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const selectedContact = contacts.find((c) => c.id === selectedId);
  const conversationMessages = messages
    .filter((m) => m.contact_id === selectedId)
    .sort((a, b) => new Date(a.timestamp || a.created_date) - new Date(b.timestamp || b.created_date));
  const conversationDrafts = drafts.filter((d) => d.contact_id === selectedId && d.status === "awaiting_approval");

  const conversations = contacts.filter((c) => messages.some((m) => m.contact_id === selectedId ? false : m.contact_id === c.id) || messages.some((m) => m.contact_id === c.id));

  const awaitingAll = drafts.filter((d) => d.status === "awaiting_approval");
  const draftFor = (id) => awaitingAll.some((d) => d.contact_id === id);
  const totalUnread = messages.filter((m) => m.direction === "received" && m.status === "unread").length;

  const markRead = async (contactId) => {
    const unread = messages.filter((m) => m.contact_id === contactId && m.direction === "received" && m.status === "unread");
    if (!unread.length) return;
    await Promise.all(unread.map((m) => base44.entities.WhatsAppMessage.update(m.id, { status: "read" }).catch(() => {})));
    reloadMsgs();
  };

  const openConversation = (id) => {
    setSelectedId(id);
    setDraft("");
    setEditingDraftId(null);
    markRead(id);
  };

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
    reloadMsgs();
  };

  const approveDraft = async (d) => {
    await base44.entities.WhatsAppMessage.create({
      contact_id: d.contact_id,
      message: d.content,
      direction: "sent",
      timestamp: new Date().toISOString(),
      status: "delivered",
    });
    await base44.entities.GiuliaDraft.update(d.id, { status: "sent" });
    toast({ title: "Verzonden" });
    reloadMsgs();
    reloadDrafts();
  };

  const rejectDraft = async (d) => {
    await base44.entities.GiuliaDraft.update(d.id, { status: "rejected" });
    reloadDrafts();
  };

  const editDraft = (d) => {
    setEditingDraftId(d.id);
    setDraft(d.content);
  };

  const saveEditedDraft = async () => {
    if (!editingDraftId) return;
    await base44.entities.GiuliaDraft.update(editingDraftId, { content: draft });
    setEditingDraftId(null);
    setDraft("");
    reloadDrafts();
  };

  const prepareNow = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const lastIncoming = [...conversationMessages].reverse().find((m) => m.direction === "received");
      if (!lastIncoming) {
        toast({ title: "Geen inkomend bericht om te beantwoorden" });
        setBusy(false);
        return;
      }
      const res = await base44.functions.invoke("autoDraftWhatsApp", { message_id: lastIncoming.id });
      if (res?.data?.ok || res?.data?.draft_id || res?.data?.skipped) {
        toast({ title: "Giulia heeft een reactie klaar" });
        reloadDrafts();
      } else {
        toast({ title: "Giulia kon geen concept maken", variant: "destructive" });
      }
    } catch {
      toast({ title: "Voorbereiden mislukt", variant: "destructive" });
    }
    setBusy(false);
  };

  const nameOf = (id) => contacts.find((c) => c.id === id)?.name || "Onbekend";

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <PageHero
        page="whatsapp"
        icon={MessageCircle}
        eyebrow="Communicatie"
        title="WhatsApp"
        subtitle="Giulia houdt je berichten bij — en bereidt antwoorden voor."
        actions={<>
          {totalUnread > 0 && <span className="rounded-full bg-olive/15 text-olive font-semibold px-2.5 py-1">{totalUnread} ongelezen</span>}
          {awaitingAll.length > 0 && <span className="rounded-full bg-sand/20 text-charcoal font-semibold px-2.5 py-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> {awaitingAll.length} klaar</span>}
        </>}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Conversations */}
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
                <p className="p-6 text-sm text-muted-foreground text-center">Nog geen gesprekken.</p>
              )}
              {conversations.map((contact) => {
                const contactMessages = messages.filter((m) => m.contact_id === contact.id);
                const lastMessage = [...contactMessages].sort((a, b) => new Date(b.timestamp || b.created_date) - new Date(a.timestamp || a.created_date))[0];
                const hasUnread = contactMessages.some((m) => m.direction === "received" && m.status === "unread");
                const hasDraft = draftFor(contact.id);
                const lastIsReceived = lastMessage?.direction === "received";
                const unanswered = lastIsReceived && !hasDraft;
                return (
                  <button
                    key={contact.id}
                    onClick={() => openConversation(contact.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 border-b border-border/30 transition-colors hover:bg-foreground/[0.02] text-left",
                      selectedId === contact.id && "bg-foreground/[0.04]"
                    )}
                  >
                    <Avatar src={contact.avatar} name={contact.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {hasDraft && <Sparkles className="h-3 w-3 text-sand" />}
                          {hasUnread && <span className="h-2 w-2 rounded-full bg-olive" />}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        {unanswered && <span className="text-[9px] font-bold uppercase tracking-wide text-charcoal/60">Onbeantwoord</span>}
                        {lastMessage?.message}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassPanel>
        </div>

        {/* Thread */}
        <div className="lg:col-span-6 min-h-0">
          <GlassPanel level={2} className="h-full flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-border/40">
              <Avatar src={selectedContact?.avatar} name={selectedContact?.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedContact?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedContact?.company}</p>
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

              {/* Giulia-prepared drafts */}
              {conversationDrafts.map((d) => (
                <div key={d.id} className="flex justify-end">
                  <div className="max-w-[78%] glass-1 rounded-2xl border border-olive/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-olive" />
                      <p className="text-[10px] font-medium uppercase tracking-wider text-olive">Door Giulia · klaar om te versturen</p>
                    </div>
                    <p className="text-sm text-foreground/85 mb-3 whitespace-pre-wrap">{d.content}</p>
                    <div className="flex gap-2">
                      <GlassButton variant="primary" size="sm" onClick={() => approveDraft(d)}><Send className="h-3.5 w-3.5" /> Verstuur</GlassButton>
                      <GlassButton variant="outline" size="sm" onClick={() => editDraft(d)}><Edit3 className="h-3.5 w-3.5" /> Bewerk</GlassButton>
                      <GlassButton variant="ghost" size="sm" onClick={() => rejectDraft(d)}><X className="h-3.5 w-3.5" /> Verwerp</GlassButton>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="p-4 border-t border-border/40 space-y-2">
              <button onClick={prepareNow} disabled={busy || !selectedContact} className="text-[11px] text-olive hover:underline flex items-center gap-1.5 disabled:opacity-50">
                <Sparkles className="h-3.5 w-3.5" /> {busy ? "Giulia denkt na..." : "Laat Giulia een reactie voorbereiden"}
              </button>
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !editingDraftId) sendMessage(draft); if (e.key === "Enter" && editingDraftId) saveEditedDraft(); }}
                  placeholder={editingDraftId ? "Bewerk Giulia's concept…" : "Typ een bericht..."}
                  className="flex-1 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
                {editingDraftId ? (
                  <GlassButton variant="primary" size="icon" onClick={saveEditedDraft}><Check className="h-4 w-4" /></GlassButton>
                ) : (
                  <GlassButton variant="primary" size="icon" onClick={() => sendMessage(draft)}><Send className="h-4 w-4" /></GlassButton>
                )}
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Giulia side panel */}
        <div className="lg:col-span-3 space-y-4">
          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-9 w-9 rounded-xl bg-olive text-ivory flex items-center justify-center"><Sparkles className="h-4 w-4" /></span>
              <div>
                <h3 className="text-sm font-display font-semibold leading-none">Giulia antwoordt automatisch</h3>
                <p className="text-[10px] text-muted-foreground mt-1">Concepten verschijnen hier, je keurt goed.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-center">
              <div className="glass-1 rounded-xl py-2"><p className="text-lg font-semibold text-foreground">{totalUnread}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ongelezen</p></div>
              <div className="glass-1 rounded-xl py-2"><p className="text-lg font-semibold text-foreground">{awaitingAll.length}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Klaar</p></div>
            </div>
            <GlassButton variant="glass" size="sm" className="w-full" onClick={prepareNow} disabled={busy || !selectedContact}>
              <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} /> Bereid reactie voor
            </GlassButton>
          </GlassPanel>

          {awaitingAll.length > 0 && (
            <GlassPanel level={1} className="p-5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Klaar om te versturen</h3>
              <div className="space-y-3">
                {awaitingAll.map((d) => (
                  <div key={d.id} className="glass-1 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold truncate">{nameOf(d.contact_id)}</p>
                      <button onClick={() => openConversation(d.contact_id)} className="text-[10px] text-olive hover:underline shrink-0">Open</button>
                    </div>
                    <p className="text-[11px] text-foreground/70 line-clamp-2 mb-2">{d.content}</p>
                    <button onClick={() => approveDraft(d)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-olive hover:underline"><Send className="h-3 w-3" /> Verstuur</button>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}