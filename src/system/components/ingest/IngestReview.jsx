import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import ProposedRecordCard from "./ProposedRecordCard";
import { Sparkles, Loader2, RefreshCw, HelpCircle, Check } from "lucide-react";

export default function IngestReview({ source, onApproved, onReprocess }) {
  const [records, setRecords] = useState(() =>
    (source.proposed_records || []).map((r) => ({
      ...r,
      action: r.decision === "EXISTING" || r.decision === "POSSIBLE_MATCH" || r.decision === "CONFLICT" ? "link" : "create"
    }))
  );
  const [busy, setBusy] = useState(false);
  const gaps = source.gaps || [];

  const update = (i, patch) => setRecords((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const included = records.filter((r) => r.action !== "skip");

  const approve = async () => {
    setBusy(true);
    try {
      const payload = records.map((r) => ({
        index: r.index, entity_class: r.entity_class, title: r.title, description: r.description,
        fields: r.fields, action: r.action, existing_id: r.existing_id
      }));
      await base44.functions.invoke("approveIngestion", { source_id: source.id, records: payload }).catch(() => null);
      await onApproved?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-5 pb-24">
      <GlassPanel level={3} className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-olive mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">GIULIA stelt voor — controleer vóór goedkeuring</p>
            <h2 className="font-display font-semibold text-lg leading-tight">{source.overall_subject || source.original_filename || "Ingested source"}</h2>
            {source.purpose && <p className="text-sm text-foreground/75 mt-1 leading-relaxed">{source.purpose}</p>}
          </div>
          <span className="text-[10px] uppercase tracking-wide text-olive border border-olive/30 rounded-full px-2.5 py-1 shrink-0">{source.confidence || "—"}</span>
        </div>
        <p className="text-xs text-muted-foreground">Niets wordt toegevoegd tot je goedkeurt. Pas titels en velden aan, of kies Skip voor wat niet klopt.</p>
      </GlassPanel>

      <div className="space-y-3">
        {records.map((r, i) => (
          <ProposedRecordCard key={r.index} record={r} onChange={(patch) => update(i, patch)} />
        ))}
      </div>

      {gaps.length > 0 && (
        <GlassPanel level={2} className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-olive" />
            <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">Open vragen → Wants to Know (bij goedkeuring)</h3>
          </div>
          {gaps.map((g, i) => (
            <p key={i} className="text-sm text-foreground/80 py-0.5">{g.description}</p>
          ))}
        </GlassPanel>
      )}

      <div className="flex items-center gap-3 sticky bottom-4 z-10">
        <GlassButton variant="primary" size="sm" disabled={busy || included.length === 0} onClick={approve}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
          {busy ? "Toevoegen…" : `Goedkeuren · ${included.length} item${included.length === 1 ? "" : "s"}`}
        </GlassButton>
        <GlassButton variant="glass" size="sm" onClick={onReprocess}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Opnieuw</GlassButton>
      </div>
    </motion.div>
  );
}