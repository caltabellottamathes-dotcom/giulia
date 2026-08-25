import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import StatusBadge from "@/system/components/glass/StatusBadge";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import PageHero from "@/system/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { haptic } from "@/lib/nativeBridge";
import {
  Check, X, Edit3, MessageCircle, FileText,
  ClipboardCheck, AlertCircle, CheckCheck, Sparkles,
} from "lucide-react";

const categories = ["All", "urgent", "communication", "projects", "intern", "proactive"];
const categoryMeta = {
  urgent: { label: "Urgent", color: "hsl(10 60% 50%)", icon: AlertCircle },
  communication: { label: "Communicatie", color: "hsl(var(--sand))", icon: MessageCircle },
  projects: { label: "Projecten", color: "hsl(var(--olive))", icon: FileText },
  intern: { label: "Intern", color: "hsl(var(--steel))", icon: ClipboardCheck },
  proactive: { label: "Proactief", color: "hsl(var(--ridge))", icon: Sparkles },
};
const statuses = ["pending", "approved", "executed", "edited", "already_done", "rejected", "discarded", "all"];
const statusLabel = { pending: "Wachtend", approved: "Goedgekeurd", executed: "Uitgevoerd", edited: "Bewerkt", already_done: "Al gebeurd", rejected: "Verworpen", discarded: "Verworpen (oud)", all: "Alles" };

export default function Approvals() {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [editText, setEditText] = useState("");

  const { toast } = useToast();
  const { data: approvals, loading, reload } = useEntityList("Approval", { realtime: true });
  const { data: projects } = useEntityList("Project");
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const filtered = approvals.filter((a) => category === "All" || a.category === category);
  const pending = filtered.filter((a) => status === "all" || a.status === status);

  // Deep-link — chat-notificaties kunnen naar /approvals?open=<id> linken.
  useEffect(() => {
    const openId = new URLSearchParams(window.location.search).get("open");
    if (!openId || !approvals.length) return;
    const a = approvals.find((x) => x.id === openId);
    if (a) {
      setStatus("all");
      setSelected(a);
      setEditText(a.content || a.proposed_action || "");
    }
  }, [approvals]);

  // Voert de goedgekeurde/verworpen actie écht uit via de executeApproval-functie.
  const decide = async (approval, action, edit) => {
    try {
      const res = await base44.functions.invoke("executeApproval", {
        approval_id: approval.id,
        action,
        edit: edit || null,
      });
      const r = res?.data ?? res;
      if (r?.ok) {
        haptic(action === "reject" ? "warning" : "success");
        const title = action === "reject" ? "Verworpen" : action === "already_done" ? "Al gebeurd" : "Uitgevoerd";
        toast({ title, description: r.detail || "" });
      } else {
        haptic("warning");
        toast({
          title: "Niet verzonden",
          description: r?.detail || r?.error || "Verzenden mislukt — pas aan of probeer opnieuw.",
          variant: "destructive",
        });
      }
    } catch (e) {
      haptic("error");
      toast({ title: "Mislukt", description: String(e.message || e), variant: "destructive" });
    }
    setSelected(null);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="approvals"
        icon={ClipboardCheck}
        eyebrow="Controle"
        title="Waiting on You."
        subtitle="Enkel externe acties die op jouw ja wachten"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Wachtend", count: approvals.filter((a) => a.status === "pending").length },
          { label: "Goedgekeurd", count: approvals.filter((a) => a.status === "approved").length },
          { label: "Verwerpen", count: approvals.filter((a) => a.status === "discarded").length },
          { label: "Bewerkt", count: approvals.filter((a) => a.status === "edited").length },
        ].map((stat) => (
          <GlassPanel key={stat.label} level={1} className="p-4">
            <p className="text-2xl font-display font-semibold">{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all",
              status === s ? "bg-olive text-ivory font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
            )}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const meta = categoryMeta[cat];
          const count = cat === "All" ? approvals.length : approvals.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all flex items-center gap-2",
                category === cat ? "text-white font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
              )}
              style={category === cat ? { background: meta ? meta.color : "hsl(var(--foreground))" } : undefined}
            >
              {meta && <meta.icon className="h-3 w-3" />}
              {cat === "All" ? "Alles" : meta?.label || cat}
              {count > 0 && <span className={cn("px-1.5 py-0.5 rounded-full text-[9px]", category === cat ? "bg-white/20" : "bg-foreground/10")}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {loading && [0, 1].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        {!loading && pending.map((approval) => {
          const meta = categoryMeta[approval.category] || categoryMeta.intern;
          const Icon = meta.icon;
          const isMessage = approval.type === "email" || approval.type === "whatsapp";
          return (
            <GlassPanel
              key={approval.id}
              level={2}
              className="p-5 cursor-pointer"
              style={{ borderLeft: `3px solid ${meta.color}` }}
              onClick={() => { setSelected(approval); setEditText(approval.content || approval.proposed_action || ""); }}
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge variant="muted" style={{ color: meta.color, borderColor: meta.color }}>{meta.label}</StatusBadge>
                    <StatusBadge variant="muted">{statusLabel[approval.status] || approval.status}</StatusBadge>
                    {approval.type && <StatusBadge variant="muted">{approval.type}</StatusBadge>}
                    {approval.assignee && (
                      <StatusBadge variant={approval.assignee === "giulia" ? "waiting" : "active"}>
                        {approval.assignee === "giulia" ? "Voor Giulia" : "Voor jou"}
                      </StatusBadge>
                    )}
                  </div>
                  <h3 className="text-sm font-display font-semibold">{approval.description}</h3>
                  {approval.context && (
                    <div className="glass-1 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3 w-3 text-olive" />
                        <p className="text-[10px] uppercase tracking-wider text-olive">Waarom</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{approval.context}</p>
                    </div>
                  )}
                  {approval.content && (
                    <div className="glass-1 rounded-lg p-3 mt-3">
                      <p className="text-[10px] uppercase tracking-wider text-olive mb-1">
                        {isMessage ? "Voorgesteld bericht" : "Details"}
                      </p>
                      <p className="whitespace-pre-wrap text-xs text-muted-foreground">{approval.content}</p>
                    </div>
                  )}
                  {approval.project_id && projTitle(approval.project_id) && (
                    <p className="text-[10px] text-olive mt-2">Gekoppeld: {projTitle(approval.project_id)}</p>
                  )}
                </div>
              </div>
              {approval.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                  <GlassButton variant="primary" size="sm" onClick={() => decide(approval, "approve")}><Check className="h-4 w-4" /> Goedkeuren</GlassButton>
                  <GlassButton variant="outline" size="sm" onClick={() => { setSelected(approval); setEditText(approval.content || approval.proposed_action || ""); }}><Edit3 className="h-4 w-4" /> Bewerk</GlassButton>
                  <GlassButton variant="outline" size="sm" onClick={() => decide(approval, "already_done")}><CheckCheck className="h-4 w-4" /> Al gebeurd</GlassButton>
                  <GlassButton variant="ghost" size="sm" onClick={() => decide(approval, "reject")}><X className="h-4 w-4" /> Verwerpen</GlassButton>
                </div>
              )}
            </GlassPanel>
          );
        })}

        {!loading && pending.length === 0 && (
          <GlassPanel level={2} className="p-12 text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {status === "pending" ? "Geen acties wachten op goedkeuring" : `Niets met status "${statusLabel[status]}"`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Giulia werkt autonoom verder</p>
          </GlassPanel>
        )}
      </div>

      <FloatingPanel open={!!selected} onClose={() => setSelected(null)} position="right">
        {selected && (
          <div className="space-y-5">
            <div>
              <StatusBadge variant="urgent">{categoryMeta[selected.category]?.label || selected.category}</StatusBadge>
              <h2 className="text-xl font-display font-semibold mt-3">Actie bewerken</h2>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Concept</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[100px] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <GlassButton variant="primary" size="md" className="flex-1" onClick={() => decide(selected, "edit", { body: editText })}>
                <Check className="h-4 w-4" /> Goedkeuren & Uitvoeren
              </GlassButton>
              <GlassButton variant="outline" size="md" onClick={() => setSelected(null)}>Annuleer</GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}