import React, { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import StatusBadge from "@/system/components/glass/StatusBadge";
import PanelForm from "@/system/components/glass/PanelForm";
import PageHero from "@/system/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { syncInbox } from "@/lib/emailSync";
import CategoryBadge from "@/focus/components/email/CategoryBadge";
import EmailActivityChart from "@/focus/components/email/EmailActivityChart";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Star, Send, FileText, Archive, Sparkles,
  Search, Mail, Check, X, RefreshCw, Trash2, Loader2, AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const categoryChips = [
  { id: "all", label: "Alle" },
  { id: "important", label: "Belangrijk" },
  { id: "advertising", label: "Reclame" },
  { id: "newsletter", label: "Nieuwsbrief" },
  { id: "junk", label: "Onbelangrijk" },
  { id: "spam", label: "Spam" },
];

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "important", label: "Belangrijk", icon: Star },
  { id: "sent", label: "Verzonden", icon: Send },
  { id: "drafts", label: "Concepten", icon: FileText },
  { id: "archived", label: "Gearchiveerd", icon: Archive },
  { id: "giulia_drafts", label: "Door Giulia", icon: Sparkles },
];

// ── Live clock hook — geeft de pagina een "levend" gevoel ──
function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  return time;
}

export default function Email() {
  const [folder, setFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ to: "", subject: "", body: "" });
  const [sendingCompose, setSendingCompose] = useState(false);
  const [draftBody, setDraftBody] = useState("");
  const [triaging, setTriaging] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [bodyError, setBodyError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const clock = useClock();
  const lastFetchId = useRef(null);
  const { toast } = useToast();

  const { data: rawEmails, loading, reload } = useEntityList("Email");
  const emails = useMemo(() => (rawEmails || []).filter((e) => !e.deleted), [rawEmails]);

  const sync = async () => {
    setSyncing(true);
    try {
      const { created } = await syncInbox({ limit: 30 });
      reload();
      if (created) toast({ title: `${created} nieuwe email${created === 1 ? "" : "s"} opgehaald` });
    } catch (e) {
      toast({ title: "Sync mislukt", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const triage = async () => {
    setTriaging(true);
    try {
      const res = await base44.functions.invoke("triageEmails", {});
      reload();
      const n = res?.triaged || 0;
      toast({ title: n > 0 ? `${n} email${n === 1 ? "" : "s"} gesorteerd door Giulia` : "Inbox gesorteerd" });
    } catch (e) {
      toast({ title: "Sorteren mislukt", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setTriaging(false);
    }
  };

  useEffect(() => { sync(); /* eslint-disable-next-line */ }, []);

  const folderEmails = useMemo(() => {
    let list;
    if (activeCategory !== "all") {
      list = emails.filter((m) => m.category === activeCategory);
    } else {
      list = emails.filter((m) => m.folder === folder);
    }
    if (folder === "giulia_drafts" && activeCategory === "all") {
      list = emails.filter((m) => m.folder === "giulia_drafts" || m.giulia_draft);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) =>
        (m.subject || "").toLowerCase().includes(q) ||
        (m.sender || "").toLowerCase().includes(q) ||
        (m.body || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.timestamp || b.created_date || 0) - new Date(a.timestamp || a.created_date || 0));
  }, [emails, folder, activeCategory, searchQuery]);

  const giuliaDrafts = emails.filter((m) => m.folder === "giulia_drafts" || m.giulia_draft);
  const unreadCount = emails.filter((m) => m.folder === "inbox" && m.status === "unread").length;

  const draftReply = async () => {
    if (!selectedEmail) return;
    setDrafting(true);
    try {
      const res = await base44.functions.invoke("draftEmailReply", { email_id: selectedEmail.id });
      if (res?.ok) {
        await reload();
        setFolder("giulia_drafts"); setSelectedEmail(null);
        toast({ title: "Giulia heeft een concept geschreven" });
      } else { toast({ title: "Concept mislukt", variant: "destructive" }); }
    } catch (e) {
      toast({ title: "Concept mislukt", description: String(e?.message || e), variant: "destructive" });
    } finally { setDrafting(false); }
  };

  const approveAndSend = async () => {
    if (!selectedEmail) return;
    setSending(true);
    try {
      await base44.functions.invoke("sendPrivateEmail", {
        to: selectedEmail.sender_email, subject: selectedEmail.subject, message: draftBody || selectedEmail.body,
      });
      await base44.entities.Email.update(selectedEmail.id, { body: draftBody || selectedEmail.body, status: "sent", folder: "sent" });
      setShowDraftPanel(false); reload();
      toast({ title: "Verzonden" });
    } catch (e) {
      toast({ title: "Versturen mislukt", description: "Controleer de email-bridge op Render.", variant: "destructive" });
    } finally { setSending(false); }
  };

  const openCompose = () => { setCompose({ to: "", subject: "", body: "" }); setShowCompose(true); };
  const openReply = () => {
    if (!selectedEmail) return;
    setCompose({ to: selectedEmail.sender_email || "", subject: selectedEmail.subject || "", body: "" });
    setShowCompose(true);
  };
  const saveComposeDraft = async () => {
    if (!compose.subject.trim() && !compose.body.trim()) return;
    await base44.entities.Email.create({
      subject: compose.subject || "(geen onderwerp)", body: compose.body,
      sender: "Jij", sender_email: "mail@salvatorecaltabellotta.com",
      recipients: compose.to ? [compose.to] : [], status: "draft", folder: "drafts",
    });
    setCompose({ to: "", subject: "", body: "" }); setShowCompose(false); reload();
  };
  const sendCompose = async () => {
    if (!compose.to.trim()) { toast({ title: "Vul een geadresseerde in" }); return; }
    setSendingCompose(true);
    try {
      await base44.functions.invoke("sendPrivateEmail", { to: compose.to, subject: compose.subject, message: compose.body });
      await base44.entities.Email.create({
        subject: compose.subject || "(geen onderwerp)", body: compose.body,
        sender: "Jij", sender_email: "mail@salvatorecaltabellotta.com",
        recipients: [compose.to], status: "sent", folder: "sent",
      });
      setCompose({ to: "", subject: "", body: "" }); setShowCompose(false); reload();
      toast({ title: "Verzonden" });
    } catch (e) {
      toast({ title: "Versturen mislukt", description: "Controleer de email-bridge op Render.", variant: "destructive" });
    } finally { setSendingCompose(false); }
  };

  const delEmail = async () => {
    if (!selectedEmail) return;
    if (!window.confirm("Email verwijderen?")) return;
    await base44.entities.Email.update(selectedEmail.id, { deleted: true });
    setSelectedEmail(null); reload();
    toast({ title: "Email verwijderd" });
  };

  const bulkDeleteFolder = async () => {
    const target = activeCategory !== "all"
      ? emails.filter((m) => m.category === activeCategory)
      : emails.filter((m) => m.folder === folder);
    if (!target.length) return;
    if (!window.confirm(`${target.length} email${target.length === 1 ? "" : "s"} definitief verwijderen?`)) return;
    setBulkDeleting(true);
    try {
      await base44.entities.Email.updateMany(
        activeCategory !== "all" ? { category: activeCategory } : { folder },
        { $set: { deleted: true } }
      );
      reload();
      toast({ title: `${target.length} email${target.length === 1 ? "" : "s"} verwijderd` });
    } catch (e) {
      toast({ title: "Verwijderen mislukt", variant: "destructive" });
    } finally { setBulkDeleting(false); }
  };

  const toggleRead = async () => {
    if (!selectedEmail) return;
    const status = selectedEmail.status === "unread" ? "read" : "unread";
    await base44.entities.Email.update(selectedEmail.id, { status });
    setSelectedEmail({ ...selectedEmail, status }); reload();
  };

  const selectEmail = async (email) => {
    const fetchId = email.id + Date.now();
    lastFetchId.current = fetchId;
    setSelectedEmail(email);
    setBodyError(false);
    const needsBody = !email.body || email.body === "(geen inhoud)";
    if (needsBody && email.gmail_message_id) {
      setBodyLoading(true);
      try {
        const body = await base44.functions.invoke("fetchPrivateEmailBody", { uid: email.gmail_message_id });
        // Negeer als de gebruiker intussen een andere email opende
        if (lastFetchId.current !== fetchId) return;
        const text = body?.text || body?.html || "(geen inhoud)";
        if (text && text !== "(geen inhoud)") {
          setSelectedEmail({ ...email, body: text });
          await base44.entities.Email.update(email.id, { body: text }).catch(() => {});
        } else {
          setBodyError(true);
        }
      } catch (e) {
        if (lastFetchId.current !== fetchId) return;
        setBodyError(true);
      } finally {
        if (lastFetchId.current === fetchId) setBodyLoading(false);
      }
    }
  };

  const activeLabel = activeCategory !== "all"
    ? categoryChips.find((c) => c.id === activeCategory)?.label
    : folders.find((f) => f.id === folder)?.label;

  return (
    <div className="h-[calc(100svh-11.5rem)] min-h-0 flex flex-col overflow-hidden">
      <PageHero
        page="email"
        icon={Mail}
        eyebrow="Communicatie"
        title="Email"
        subtitle="mail@salvatorecaltabellotta.com · met Giulia's hulp"
        actions={<>
          <GlassButton variant="outline" size="sm" onClick={triage} disabled={triaging}>
            <Sparkles className="h-4 w-4" /> {triaging ? "Sorteert..." : "Sorteer"}
          </GlassButton>
          <GlassButton variant="outline" size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> {syncing ? "Sync..." : "Sync"}
          </GlassButton>
          <GlassButton variant="primary" size="md" onClick={openCompose}><Mail className="h-4 w-4" /> Opstellen</GlassButton>
        </>}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Folder sidebar */}
        <div className="hidden lg:flex lg:col-span-2 flex-col min-h-0 gap-1">
          <div className="flex items-center gap-2 px-3 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {clock.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {unreadCount > 0 && <span className="text-[10px] text-olive font-medium">{unreadCount} ongelezen</span>}
          </div>
          {folders.map((f) => {
            const count = f.id === "inbox"
              ? emails.filter((m) => m.folder === f.id && m.status === "unread").length
              : emails.filter((m) => m.folder === f.id).length;
            const on = folder === f.id && activeCategory === "all";
            return (
              <button
                key={f.id}
                onClick={() => { setFolder(f.id); setSelectedEmail(null); setActiveCategory("all"); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all rounded-xl",
                  on ? "bg-foreground/[0.05] text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02]"
                )}
              >
                <f.icon className={cn("h-4 w-4 shrink-0", on && "text-olive")} />
                <span className="flex-1 text-left truncate">{f.label}</span>
                {f.id === "giulia_drafts" && giuliaDrafts.length > 0 ? (
                  <span className="px-1.5 py-0.5 text-[9px] bg-olive/20 text-olive rounded-full">{giuliaDrafts.length}</span>
                ) : count > 0 ? (
                  <span className="text-[10px] text-muted-foreground tabular-nums">{count}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Email list */}
        <div className="lg:col-span-4 min-h-0 flex flex-col">
          <GlassPanel level={2} className="h-full flex flex-col overflow-hidden rounded-3xl">
            {/* Header: search + chart + chips */}
            <div className="p-4 border-b border-border/40 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-semibold text-foreground">{activeLabel}</h3>
                <span className="text-[10px] text-muted-foreground tabular-nums">{folderEmails.length}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek email..."
                  className="w-full glass-1 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
                />
              </div>
              <EmailActivityChart emails={emails} />
              <div className="flex flex-wrap gap-1.5">
                {categoryChips.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={cn(
                      "relative px-3 py-1 text-[11px] font-medium transition-colors rounded-full",
                      activeCategory === c.id
                        ? "text-ivory"
                        : "glass-1 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {activeCategory === c.id && (
                      <motion.span
                        layoutId="catActive"
                        className="absolute inset-0 bg-charcoal rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{c.label}</span>
                  </button>
                ))}
              </div>
              {activeCategory !== "all" && (
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-muted-foreground">{folderEmails.length} in "{activeLabel}"</span>
                  <button
                    onClick={bulkDeleteFolder}
                    disabled={bulkDeleting || !folderEmails.length}
                    className="inline-flex items-center gap-1 text-[10px] text-destructive hover:text-destructive/80 disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" /> {bulkDeleting ? "Verwijderen..." : "Verwijder alles"}
                  </button>
                </div>
              )}
            </div>
            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && [0, 1, 2].map((i) => <div key={i} className="h-20 border-b border-border/30 shimmer" />)}
              <AnimatePresence initial={false}>
                {!loading && folderEmails.map((email, i) => (
                  <motion.button
                    key={email.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.15), ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => selectEmail(email)}
                    className={cn(
                      "w-full text-left p-3.5 border-b border-border/30 transition-colors relative",
                      selectedEmail?.id === email.id ? "bg-foreground/[0.05]" : "hover:bg-foreground/[0.02]"
                    )}
                  >
                    {email.status === "unread" && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-olive" />
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-sm truncate", email.status === "unread" ? "font-semibold text-foreground" : "text-muted-foreground")}>{email.sender}</span>
                      {email.timestamp && <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-2">{new Date(email.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className={cn("text-xs truncate flex-1", email.status === "unread" ? "text-foreground/90" : "text-muted-foreground")}>{email.subject}</p>
                      {email.category && email.category !== "important" && <CategoryBadge category={email.category} />}
                      {email.project_id && <span title="Aan project gekoppeld" className="text-[10px] text-olive shrink-0">◆</span>}
                    </div>
                    {email.body && email.body !== "(geen inhoud)" && <p className="text-xs text-muted-foreground/60 truncate mt-1">{email.body.slice(0, 120)}</p>}
                    {(email.giulia_draft || email.folder === "giulia_drafts") && (
                      <StatusBadge variant="draft" className="mt-2"><Sparkles className="h-2.5 w-2.5" /> Door Giulia</StatusBadge>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
              {!loading && folderEmails.length === 0 && (
                <div className="p-12 text-center">
                  <Mail className="h-6 w-6 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {folder === "inbox" && activeCategory === "all" ? "Geen emails — druk op Sync om je inbox in te laden." : "Geen emails in deze categorie."}
                  </p>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Email detail */}
        <div className="lg:col-span-6 min-h-0">
          <GlassPanel level={2} className="h-full overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait">
              {!selectedEmail ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="relative inline-flex mb-4">
                      <Mail className="h-10 w-10 text-muted-foreground/30" />
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-olive animate-pulse-soft" />
                    </div>
                    <p className="text-sm text-muted-foreground">Selecteer een email om te lezen</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedEmail.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full flex flex-col"
                >
                  {/* Detail header */}
                  <div className="p-5 border-b border-border/40 shrink-0">
                    <h2 className="text-lg font-display font-semibold mb-3">{selectedEmail.subject}</h2>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-stone/40 flex items-center justify-center text-sm font-semibold">{(selectedEmail.sender || "?").charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedEmail.sender}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedEmail.sender_email}</p>
                      </div>
                      {selectedEmail.timestamp && <span className="ml-auto text-xs text-muted-foreground shrink-0">{new Date(selectedEmail.timestamp).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                    </div>
                  </div>

                  {/* Detail body */}
                  <div className="flex-1 overflow-y-auto p-5">
                    {(selectedEmail.giulia_draft || selectedEmail.folder === "giulia_drafts") && selectedEmail.context && (
                      <div className="glass-1 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-olive" /><p className="text-xs font-medium uppercase tracking-wider text-olive">Door Giulia</p></div>
                        <p className="text-xs text-muted-foreground">{selectedEmail.context}</p>
                      </div>
                    )}
                    {bodyLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                        <Loader2 className="h-4 w-4 animate-spin text-olive" /> Inhoud laden…
                      </div>
                    ) : bodyError ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-5 w-5 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">Inhoud kon niet geladen worden.</p>
                        <button onClick={() => selectEmail(selectedEmail)} className="mt-2 text-xs text-olive hover:underline">Opnieuw proberen</button>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{selectedEmail.body || "(geen inhoud)"}</div>
                    )}
                  </div>

                  {/* Detail actions */}
                  <div className="p-4 border-t border-border/40 shrink-0">
                    <div className="flex flex-wrap gap-2">
                      {(selectedEmail.giulia_draft || selectedEmail.folder === "giulia_drafts") ? (
                        <GlassButton variant="primary" size="sm" onClick={() => { setDraftBody(selectedEmail.body || ""); setShowDraftPanel(true); }}><Check className="h-4 w-4" /> Goedkeuren & Versturen</GlassButton>
                      ) : (
                        <>
                          <GlassButton variant="outline" size="sm" onClick={draftReply} disabled={drafting}>
                            <Sparkles className="h-4 w-4" /> {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Giulia antwoordt"}
                          </GlassButton>
                          <GlassButton variant="primary" size="sm" onClick={openReply}>Beantwoord</GlassButton>
                          <GlassButton variant="outline" size="sm" onClick={toggleRead}>{selectedEmail.status === "unread" ? "Gelezen" : "Ongelezen"}</GlassButton>
                        </>
                      )}
                      <GlassButton variant="ghost" size="sm" onClick={delEmail} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></GlassButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassPanel>
        </div>
      </div>

      <PanelForm
        open={showDraftPanel}
        onClose={() => setShowDraftPanel(false)}
        title="Email goedkeuren & versturen"
        eyebrow="Giulia concept"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={approveAndSend} disabled={sending}>
            <Check className="h-4 w-4" /> {sending ? "Versturen..." : "Goedkeuren & Versturen"}
          </GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setShowDraftPanel(false)}><X className="h-4 w-4" /> Annuleer</GlassButton>
        </>}
      >
        {selectedEmail && (
          <div className="glass-1 rounded-xl p-4 space-y-3">
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Aan</p><p className="text-sm">{selectedEmail.sender} ({selectedEmail.sender_email})</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Onderwerp</p><p className="text-sm">{selectedEmail.subject}</p></div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Bericht (bewerkbaar)</p>
              <textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} className="w-full glass-1 rounded-xl px-3 py-2 text-sm focus:outline-none min-h-[160px] resize-none" />
            </div>
          </div>
        )}
      </PanelForm>

      <PanelForm
        open={showCompose}
        onClose={() => setShowCompose(false)}
        title="Nieuwe email"
        eyebrow="Email · Opstellen"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={sendCompose} disabled={sendingCompose}>{sendingCompose ? "Versturen…" : "Verstuur"}</GlassButton>
          <GlassButton variant="outline" size="md" onClick={saveComposeDraft}>Concept</GlassButton>
          <GlassButton variant="ghost" size="md" onClick={() => setShowCompose(false)}>Annuleer</GlassButton>
        </>}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Aan</label>
          <input value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="naam@voorbeeld.com" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Onderwerp</label>
          <input value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bericht</label>
          <textarea value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[160px] resize-none" />
        </div>
      </PanelForm>
    </div>
  );
}