import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import FloatingPanel from "@/components/glass/FloatingPanel";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import {
  Check, X, Edit3, Mail, MessageCircle, Calendar, CheckSquare,
  FileText, Sparkles, ClipboardCheck, AlertCircle,
} from "lucide-react";

const categories = ["All", "email", "whatsapp", "calendar", "tasks", "projects", "documents", "other"];
const categoryLabel = { email: "Email", whatsapp: "WhatsApp", calendar: "Calendar", tasks: "Tasks", projects: "Projects", documents: "Documents", other: "Other" };

const categoryIcons = {
  email: Mail, whatsapp: MessageCircle, calendar: Calendar,
  tasks: CheckSquare, projects: FileText, documents: FileText, other: AlertCircle,
};

export default function Approvals() {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [editText, setEditText] = useState("");

  const { toast } = useToast();
  const { data: approvals, loading, reload } = useEntityList("Approval", { realtime: true });
  const { data: projects } = useEntityList("Project");
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const filtered = approvals.filter((a) => category === "All" || a.category === category);
  const pending = filtered.filter((a) => a.status === "pending");

  // Voert de goedgekeurde/verworpen actie écht uit via de executeApproval-functie.
  const decide = async (approval, action, edit) => {
    try {
      const res = await base44.functions.invoke("executeApproval", {
        approval_id: approval.id,
        action,
        edit: edit || null,
      });
      if (res?.ok) {
        toast({ title: action === "reject" ? "Verworpen" : "Uitgevoerd", description: res.detail || "" });
      } else {
        toast({
          title: "Gedeeltelijk",
          description: res?.detail || res?.error || "Actie kon niet volledig worden uitgevoerd.",
          variant: "destructive",
        });
      }
    } catch (e) {
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
        title="Ter goedkeuring"
        subtitle="Centrale AI-controlekamer"
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
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all",
              category === cat ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground"
            )}
          >
            {cat === "All" ? "Alles" : categoryLabel[cat] || cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && [0, 1].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        {!loading && pending.map((approval) => {
          const Icon = categoryIcons[approval.category] || categoryIcons[approval.type] || AlertCircle;
          return (
            <GlassPanel key={approval.id} level={2} className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-olive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge variant="urgent">{approval.type || approval.category}</StatusBadge>
                    {approval.action_type && <StatusBadge variant="muted">{approval.action_type.replace(/_/g, " ")}</StatusBadge>}
                    {approval.assignee && (
                      <StatusBadge variant={approval.assignee === "giulia" ? "waiting" : "active"}>
                        {approval.assignee === "giulia" ? "Voor Giulia" : "Voor jou"}
                      </StatusBadge>
                    )}
                  </div>
                  <h3 className="text-sm font-display font-semibold">{approval.description}</h3>
                  {approval.proposed_action && <p className="text-xs text-muted-foreground mt-1">{approval.proposed_action}</p>}
                  {approval.content && (
                    <div className="glass-1 rounded-lg p-3 mt-3 whitespace-pre-wrap text-xs text-muted-foreground">{approval.content}</div>
                  )}
                  {approval.context && (
                    <div className="glass-1 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3 w-3 text-olive" />
                        <p className="text-[10px] uppercase tracking-wider text-olive">Waarom</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{approval.context}</p>
                    </div>
                  )}
                  {approval.project_id && projTitle(approval.project_id) && (
                    <p className="text-[10px] text-olive mt-2">Gekoppeld: {projTitle(approval.project_id)}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                <GlassButton variant="primary" size="sm" onClick={() => decide(approval, "approve")}><Check className="h-4 w-4" /> Goedkeuren</GlassButton>
                <GlassButton variant="outline" size="sm" onClick={() => { setSelected(approval); setEditText(approval.content || approval.proposed_action || ""); }}><Edit3 className="h-4 w-4" /> Bewerk</GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => decide(approval, "reject")}><X className="h-4 w-4" /> Verwerpen</GlassButton>
              </div>
            </GlassPanel>
          );
        })}

        {!loading && pending.length === 0 && (
          <GlassPanel level={2} className="p-12 text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Geen acties wachten op goedkeuring</p>
            <p className="text-xs text-muted-foreground mt-1">Giulia werkt autonoom verder</p>
          </GlassPanel>
        )}
      </div>

      <FloatingPanel open={!!selected} onClose={() => setSelected(null)} position="right">
        {selected && (
          <div className="space-y-5">
            <div>
              <StatusBadge variant="urgent">{selected.category}</StatusBadge>
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