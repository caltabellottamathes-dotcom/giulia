import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import ProposedRecordCard from "./ProposedRecordCard";
import IngestStructure from "./IngestStructure";
import { Sparkles, Loader2, RefreshCw, HelpCircle, Check, Layers, ListChecks, FolderInput } from "lucide-react";

export default function IngestReview({ source, onApproved, onReprocess }) {
  const [view, setView] = useState("changes"); // changes | structure
  const [records, setRecords] = useState(() =>
    (source.proposed_records || []).map((r) => ({
      ...r,
      action: mapAction(r.plan_action, r.decision)
    }))
  );
  const [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState([]);
  const [targetProjectId, setTargetProjectId] = useState(source.detected_project_id || "");
  const gaps = source.gaps || [];

  useEffect(() => {
    base44.entities.Project.list("title", 200).then(setProjects).catch(() => setProjects([]));
  }, []);

  const update = (i, patch) => setRecords((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const included = records.filter((r) => r.action !== "skip");

  const approve = async () => {
    setBusy(true);
    try {
      const payload = records.map((r) => ({
        index: r.index, entity_class: r.entity_class, title: r.title, description: r.description,
        fields: r.fields, action: r.action, existing_id: r.existing_id, theme_title: r.theme_title
      }));
      await base44.functions.invoke("approveIngestion", { source_id: source.id, records: payload, target_project_id: targetProjectId || null }).catch(() => null);
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
            {source.detected_project_match_reason && (
              <p className="text-xs text-olive/80 mt-1.5">↳ {source.detected_project_match_reason}</p>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wide text-olive border border-olive/30 rounded-full px-2.5 py-1 shrink-0">{source.confidence || "—"}</span>
        </div>
        <p className="text-xs text-muted-foreground">Niets wordt toegevoegd tot je goedkeurt. Pas titels en velden aan, of kies Skip voor wat niet klopt.</p>
      </GlassPanel>

      {/* Target project — prominent, editable. Giulia stelt voor, jij bevestigt of corrigeert. */}
      <GlassPanel level={2} className="p-5 border-olive/30">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-2xl bg-olive/15 ring-1 ring-olive/30 flex items-center justify-center shrink-0">
            <FolderInput className="w-5 h-5 text-olive" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-0.5">Doelproject — Giulia stelt voor</p>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full rounded-xl glass-1 px-3 py-2.5 text-sm font-display font-semibold outline-none focus:border-olive cursor-pointer"
            >
              <option value="">— Geen project (globaal / Knowledge / LIFE) —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
        {targetProjectId && (
          <p className="text-[11px] text-muted-foreground mt-2.5 pl-[3.25rem]">Alle goedgekeurde records worden gekoppeld aan dit project.</p>
        )}
      </GlassPanel>

      {/* View toggle: Structure | Changes */}
      <div className="flex gap-2">
        <ViewTab active={view === "structure"} onClick={() => setView("structure")} icon={Layers} label="Structuur" />
        <ViewTab active={view === "changes"} onClick={() => setView("changes")} icon={ListChecks} label={`Wijzigingen · ${included.length}`} />
      </div>

      {view === "structure" ? (
        <IngestStructure source={source} />
      ) : (
        <>
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
        </>
      )}
    </motion.div>
  );
}

function mapAction(planAction, decision) {
  if (planAction === "CREATE") return "create";
  if (planAction === "UPDATE") return "update";
  if (planAction === "LINK" || planAction === "MERGE") return "link";
  if (planAction === "KEEP" || planAction === "IGNORE" || planAction === "ASK") return "skip";
  // fallback on decision
  if (decision === "EXISTING" || decision === "POSSIBLE_MATCH") return "link";
  if (decision === "CONFLICT") return "update";
  return "create";
}

function ViewTab({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${active ? "bg-olive text-white float-shadow" : "glass-1 text-muted-foreground hover:text-foreground"}`}>
      <Icon className="w-3.5 h-3.5" />{label}
    </button>
  );
}