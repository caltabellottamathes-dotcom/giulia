import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import {
  Inbox, Star, Send, FileText, Archive, Sparkles,
  Search, Mail, Check, Edit3, X, RefreshCw,
} from "lucide-react";

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "important", label: "Belangrijk", icon: Star },
  { id: "sent", label: "Verzonden", icon: Send },
  { id: "drafts", label: "Concepten", icon: FileText },
  { id: "archived", label: "Gearchiveerd", icon: Archive },
  { id: "giulia_drafts", label: "Door Giulia", icon: Sparkles },
];

export default function Email() {
  const [folder, setFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);

  const { data: emails, loading, reload } = useEntityList("Email");

  const sync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke("syncGmail", {});
      reload();
    } catch (e) {
      /* ignore */
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const folderEmails = emails.filter((m) => m.folder === folder);
  const giuliaDrafts = emails.filter((m) => m.folder === "giulia_drafts" || m.giulia_draft);

  const approveAndSend = async () => {
    if (!selectedEmail) return;
    setSending(true);
    try {
      await base44.functions.invoke("sendGmail", {
        to: selectedEmail.sender_email,
        subject: selectedEmail.subject,
        message: selectedEmail.body,
      });
      await base44.entities.Email.update(selectedEmail.id, { status: "sent", folder: "sent" });
      setShowDraftPanel(false);
      reload();
    } catch (e) {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Email</h1>
          <p className="text-sm text-muted-foreground mt-1">mail@salvatorecaltabellotta.com · met Giulia's hulp</p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="outline" size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> {syncing ? "Synchroniseert..." : "Sync"}
          </GlassButton>
          <GlassButton variant="primary" size="md"><Mail className="h-4 w-4" /> Opstellen</GlassButton>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        <div className="lg:col-span-2 space-y-1">
          {folders.map((f) => {
            const count = f.id === "inbox"
              ? emails.filter((m) => m.folder === f.id && m.status === "unread").length
              : emails.filter((m) => m.folder === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => { setFolder(f.id); setSelectedEmail(null); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                  folder === f.id ? "glass-1 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                )}
              >
                <f.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{f.label}</span>
                {f.id === "giulia_drafts" && giuliaDrafts.length > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-olive/20 text-olive">{giuliaDrafts.length}</span>
                ) : count > 0 ? (
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-4 min-h-0">
          <GlassPanel level={2} className="h-full flex flex-col">
            <div className="p-4 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input placeholder="Zoek email..." className="w-full glass-1 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && [0, 1, 2].map((i) => <div key={i} className="h-20 border-b border-border/30 shimmer" />)}
              {!loading && folderEmails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={cn(
                    "w-full text-left p-4 border-b border-border/30 transition-colors hover:bg-foreground/[0.02]",
                    selectedEmail?.id === email.id && "bg-foreground/[0.04]",
                    email.status === "unread" && "border-l-2 border-l-olive"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-sm", email.status === "unread" ? "font-semibold" : "text-muted-foreground")}>{email.sender}</span>
                    {email.timestamp && <span className="text-[10px] text-muted-foreground">{new Date(email.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
                  </div>
                  <p className={cn("text-xs truncate", email.status === "unread" ? "text-foreground" : "text-muted-foreground")}>{email.subject}</p>
                  {email.body && <p className="text-xs text-muted-foreground truncate mt-1">{email.body}</p>}
                  {(email.giulia_draft || email.folder === "giulia_drafts") && (
                    <StatusBadge variant="draft" className="mt-2"><Sparkles className="h-2.5 w-2.5" /> Door Giulia</StatusBadge>
                  )}
                </button>
              ))}
              {!loading && folderEmails.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {folder === "inbox" ? "Geen emails — druk op Sync om je inbox in te laden." : "Geen emails"}
                </div>
              )}
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-6 min-h-0">
          <GlassPanel level={2} className="h-full overflow-y-auto">
            {!selectedEmail ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Mail className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Selecteer een email om te lezen</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-display font-semibold mb-3">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-stone/40 flex items-center justify-center text-sm font-semibold">{(selectedEmail.sender || "?").charAt(0)}</div>
                    <div>
                      <p className="text-sm font-medium">{selectedEmail.sender}</p>
                      <p className="text-xs text-muted-foreground">{selectedEmail.sender_email}</p>
                    </div>
                    {selectedEmail.timestamp && <span className="ml-auto text-xs text-muted-foreground">{new Date(selectedEmail.timestamp).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                </div>

                {(selectedEmail.giulia_draft || selectedEmail.folder === "giulia_drafts") && selectedEmail.context && (
                  <div className="glass-1 rounded-xl p-4 border-olive/20">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-olive" /><p className="text-xs font-medium uppercase tracking-wider text-olive">Door Giulia</p></div>
                    <p className="text-xs text-muted-foreground">{selectedEmail.context}</p>
                  </div>
                )}

                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{selectedEmail.body || "(geen inhoud)"}</div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                  {(selectedEmail.giulia_draft || selectedEmail.folder === "giulia_drafts") ? (
                    <>
                      <GlassButton variant="primary" size="sm" onClick={() => setShowDraftPanel(true)}><Check className="h-4 w-4" /> Goedkeuren & Versturen</GlassButton>
                      <GlassButton variant="outline" size="sm"><Edit3 className="h-4 w-4" /> Bewerk</GlassButton>
                    </>
                  ) : (
                    <>
                      <GlassButton variant="primary" size="sm"><Send className="h-4 w-4" /> Beantwoord</GlassButton>
                      <GlassButton variant="outline" size="sm"><Sparkles className="h-4 w-4" /> Giulia stelt reactie voor</GlassButton>
                    </>
                  )}
                </div>
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      <FloatingPanel open={showDraftPanel} onClose={() => setShowDraftPanel(false)} position="right">
        {selectedEmail && (
          <div className="space-y-5">
            <div>
              <StatusBadge variant="draft"><Sparkles className="h-2.5 w-2.5" /> Giulia concept</StatusBadge>
              <h2 className="text-xl font-display font-semibold mt-3">Email goedkeuren & versturen</h2>
            </div>
            <div className="glass-1 rounded-xl p-4 space-y-3">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Aan</p><p className="text-sm">{selectedEmail.sender} ({selectedEmail.sender_email})</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Onderwerp</p><p className="text-sm">{selectedEmail.subject}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Bericht</p><p className="text-sm text-muted-foreground leading-relaxed">{selectedEmail.body}</p></div>
            </div>
            <div className="flex gap-2">
              <GlassButton variant="primary" size="md" className="flex-1" onClick={approveAndSend} disabled={sending}>
                <Check className="h-4 w-4" /> {sending ? "Versturen..." : "Goedkeuren & Versturen"}
              </GlassButton>
              <GlassButton variant="outline" size="md" onClick={() => setShowDraftPanel(false)}><X className="h-4 w-4" /> Annuleer</GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}