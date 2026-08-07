import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { mockEmails, mockProjects, mockContacts } from "@/lib/mockData";
import {
  Inbox, Star, Send, FileText, Archive, Sparkles,
  Search, Mail, Check, Edit3, X, ArrowRight,
} from "lucide-react";

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "important", label: "Important", icon: Star },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "archived", label: "Archived", icon: Archive },
  { id: "giulia_drafts", label: "Prepared by Giulia", icon: Sparkles },
];

export default function Email() {
  const [folder, setFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showDraftPanel, setShowDraftPanel] = useState(false);

  const emails = mockEmails.filter((m) => m.folder === folder);
  const giuliaDrafts = mockEmails.filter((m) => m.folder === "giulia_drafts");

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">Email</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw inbox, met Giulia's hulp</p>
        </div>
        <GlassButton variant="primary" size="md">
          <Mail className="h-4 w-4" /> Opstellen
        </GlassButton>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Folder nav */}
        <div className="lg:col-span-2 space-y-1">
          {folders.map((f) => {
            const count = mockEmails.filter((m) => m.folder === f.id && (f.id === "inbox" ? m.status === "unread" : true)).length;
            return (
              <button
                key={f.id}
                onClick={() => { setFolder(f.id); setSelectedEmail(null); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                  folder === f.id
                    ? "glass-1 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                )}
              >
                <f.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{f.label}</span>
                {count > 0 && f.id !== "giulia_drafts" && (
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                )}
                {f.id === "giulia_drafts" && giuliaDrafts.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-olive/20 text-olive">{giuliaDrafts.length}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Email list */}
        <div className="lg:col-span-4 min-h-0">
          <GlassPanel level={2} className="h-full flex flex-col">
            <div className="p-4 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Zoek email..."
                  className="w-full glass-1 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {emails.map((email) => {
                const contact = mockContacts.find((c) => c.id === email.contact_id);
                return (
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
                      <span className={cn("text-sm", email.status === "unread" ? "font-medium" : "text-muted-foreground")}>
                        {email.sender}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(email.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", email.status === "unread" ? "text-foreground" : "text-muted-foreground")}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{email.body}</p>
                    {email.giulia_draft && (
                      <StatusBadge variant="draft" className="mt-2">
                        <Sparkles className="h-2.5 w-2.5" /> Prepared by Giulia
                      </StatusBadge>
                    )}
                  </button>
                );
              })}
              {emails.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">Geen emails</div>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Email detail */}
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
                  <h2 className="text-lg font-heading font-medium mb-3">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-stone/40 flex items-center justify-center text-sm font-medium">
                      {selectedEmail.sender.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedEmail.sender}</p>
                      <p className="text-xs text-muted-foreground">{selectedEmail.sender_email}</p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(selectedEmail.timestamp).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {selectedEmail.giulia_draft && (
                  <div className="glass-1 rounded-xl p-4 border-olive/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-olive" />
                      <p className="text-xs font-medium uppercase tracking-wider text-olive">Prepared by Giulia</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{selectedEmail.context}</p>
                  </div>
                )}

                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>

                {selectedEmail.project_id && (() => {
                  const project = mockProjects.find((p) => p.id === selectedEmail.project_id);
                  return project ? (
                    <div className="glass-1 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Gekoppeld project</p>
                      <p className="text-sm font-medium">{project.title}</p>
                    </div>
                  ) : null;
                })()}

                <div className="flex gap-2 pt-2 border-t border-border/40">
                  {selectedEmail.giulia_draft ? (
                    <>
                      <GlassButton variant="primary" size="sm" onClick={() => setShowDraftPanel(true)}>
                        <Check className="h-4 w-4" /> Goedkeuren & Versturen
                      </GlassButton>
                      <GlassButton variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" /> Bewerk
                      </GlassButton>
                      <GlassButton variant="ghost" size="sm">Vraag Giulia te herzien</GlassButton>
                      <GlassButton variant="ghost" size="sm">Afwijzen</GlassButton>
                    </>
                  ) : (
                    <>
                      <GlassButton variant="primary" size="sm"><ArrowRight className="h-4 w-4" /> Beantwoord</GlassButton>
                      <GlassButton variant="outline" size="sm"><Sparkles className="h-4 w-4" /> Giulia stelt reactie voor</GlassButton>
                    </>
                  )}
                </div>
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* Giulia draft approval floating panel */}
      <FloatingPanel open={showDraftPanel} onClose={() => setShowDraftPanel(false)} position="right">
        {selectedEmail && (
          <div className="space-y-5">
            <div>
              <StatusBadge variant="draft"><Sparkles className="h-2.5 w-2.5" /> Giulia concept</StatusBadge>
              <h2 className="text-xl font-heading font-medium mt-3">Email goedkeuren</h2>
            </div>
            <div className="glass-1 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Aan</p>
                <p className="text-sm">{selectedEmail.sender} ({selectedEmail.sender_email})</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Onderwerp</p>
                <p className="text-sm">{selectedEmail.subject}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Bericht</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedEmail.body}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <GlassButton variant="primary" size="md" className="flex-1" onClick={() => setShowDraftPanel(false)}>
                <Check className="h-4 w-4" /> Goedkeuren & Versturen
              </GlassButton>
              <GlassButton variant="outline" size="md" onClick={() => setShowDraftPanel(false)}>
                <X className="h-4 w-4" /> Annuleer
              </GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}