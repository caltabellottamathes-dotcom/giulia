import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { mockApprovals, mockProjects } from "@/lib/mockData";
import {
  Check, X, Edit3, Mail, MessageCircle, Calendar, CheckSquare,
  FileText, Sparkles, ClipboardCheck, AlertCircle,
} from "lucide-react";

const categories = ["All", "Email", "WhatsApp", "Calendar", "Tasks", "Projects", "Documents", "Other"];

const categoryIcons = {
  email: Mail, whatsapp: MessageCircle, calendar: Calendar,
  tasks: CheckSquare, projects: FileText, documents: FileText, other: AlertCircle,
};

export default function Approvals() {
  const [category, setCategory] = useState("All");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvals, setApprovals] = useState(mockApprovals);

  const filtered = approvals.filter((a) => category === "All" || a.category === category.toLowerCase());

  const handleApprove = (id) => {
    setApprovals(approvals.map((a) => (a.id === id ? { ...a, status: "approved" } : a)));
    setSelectedApproval(null);
  };

  const handleReject = (id) => {
    setApprovals(approvals.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)));
    setSelectedApproval(null);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-heading font-light tracking-tight">Needs your approval</h1>
        <p className="text-sm text-muted-foreground mt-1">Centrale AI-controlekamer</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Wachtend", count: approvals.filter((a) => a.status === "pending").length, variant: "urgent" },
          { label: "Goedgekeurd", count: approvals.filter((a) => a.status === "approved").length, variant: "completed" },
          { label: "Afgewezen", count: approvals.filter((a) => a.status === "rejected").length, variant: "muted" },
          { label: "Uitgevoerd", count: approvals.filter((a) => a.status === "executed").length, variant: "active" },
        ].map((stat) => (
          <GlassPanel key={stat.label} level={1} className="p-4">
            <p className="text-2xl font-heading font-light">{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </GlassPanel>
        ))}
      </div>

      {/* Category filters */}
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
            {cat}
          </button>
        ))}
      </div>

      {/* Approval list */}
      <div className="space-y-3">
        {filtered.filter((a) => a.status === "pending").map((approval) => {
          const Icon = categoryIcons[approval.category] || AlertCircle;
          const project = mockProjects.find((p) => p.id === approval.project_id);
          return (
            <GlassPanel key={approval.id} level={2} className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-olive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge variant="urgent">{approval.category}</StatusBadge>
                    <StatusBadge variant="muted">{approval.action_type.replace("_", " ")}</StatusBadge>
                  </div>
                  <h3 className="text-sm font-heading font-medium">{approval.description}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{approval.proposed_action}</p>
                  {approval.context && (
                    <div className="glass-1 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3 w-3 text-olive" />
                        <p className="text-[10px] uppercase tracking-wider text-olive">Waarom</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{approval.context}</p>
                    </div>
                  )}
                  {project && (
                    <p className="text-[10px] text-olive mt-2">Gekoppeld: {project.title}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                <GlassButton variant="primary" size="sm" onClick={() => handleApprove(approval.id)}>
                  <Check className="h-4 w-4" /> Goedkeuren
                </GlassButton>
                <GlassButton variant="outline" size="sm" onClick={() => setSelectedApproval(approval)}>
                  <Edit3 className="h-4 w-4" /> Bewerk
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => handleReject(approval.id)}>
                  <X className="h-4 w-4" /> Afwijzen
                </GlassButton>
              </div>
            </GlassPanel>
          );
        })}

        {filtered.filter((a) => a.status === "pending").length === 0 && (
          <GlassPanel level={2} className="p-12 text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Geen acties wachten op goedkeuring</p>
            <p className="text-xs text-muted-foreground mt-1">Giulia werkt autonoom verder</p>
          </GlassPanel>
        )}
      </div>

      {/* Edit floating panel */}
      <FloatingPanel open={!!selectedApproval} onClose={() => setSelectedApproval(null)} position="right">
        {selectedApproval && (
          <div className="space-y-5">
            <div>
              <StatusBadge variant="urgent">{selectedApproval.category}</StatusBadge>
              <h2 className="text-xl font-heading font-medium mt-3">Actie bewerken</h2>
              <p className="text-sm text-muted-foreground mt-1">{selectedApproval.description}</p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Voorgestelde actie</label>
              <textarea
                defaultValue={selectedApproval.proposed_action}
                className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[100px] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <GlassButton variant="primary" size="md" className="flex-1" onClick={() => handleApprove(selectedApproval.id)}>
                <Check className="h-4 w-4" /> Goedkeuren & Uitvoeren
              </GlassButton>
              <GlassButton variant="outline" size="md" onClick={() => setSelectedApproval(null)}>Annuleer</GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}