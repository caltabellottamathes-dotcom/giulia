import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { Sparkles, Plus, RefreshCw, ArrowUpRight, AlertTriangle, HelpCircle, Link2 } from "lucide-react";

const ROUTE = {
  Project: (id) => `/projects/${id}`,
  Task: () => `/tasks`,
  Contact: (id) => `/people/${id}`,
  CalendarEvent: () => `/agenda`,
  Document: () => `/documents`,
  Knowledge: () => `/knowledge`,
  Idea: () => `/wants-to-know`,
  Decision: () => `/projects`,
  Income: () => `/life/personal-admin`,
  RecurringExpense: () => `/life/personal-admin`,
};

export default function IngestResult({ source, onNew, onReprocess }) {
  const navigate = useNavigate();
  const gen = source.generated_records || [];
  const upd = source.updated_records || [];
  const rels = source.relationships_created || [];
  const conflicts = source.conflicts || [];
  const unresolved = source.unresolved || [];
  const gaps = source.gaps || [];

  const open = (rec) => { const r = ROUTE[rec.entity]; if (r) navigate(r(rec.id)); };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-5">
      {/* Summary header */}
      <GlassPanel level={3} className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-olive mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">GIULIA understood</p>
            <h2 className="font-display font-semibold text-lg leading-tight">{source.overall_subject || source.original_filename || "Ingested source"}</h2>
            {source.purpose && <p className="text-sm text-foreground/75 mt-1 leading-relaxed">{source.purpose}</p>}
          </div>
          <span className="text-[10px] uppercase tracking-wide text-olive border border-olive/30 rounded-full px-2.5 py-1 shrink-0">{source.confidence || "—"}</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Created" value={gen.length} tone="olive" />
          <Stat label="Updated" value={upd.length} tone="sand" />
          <Stat label="Conflicts" value={conflicts.length} tone={conflicts.length ? "urgent" : "neutral"} />
          <Stat label="Unresolved" value={unresolved.length} tone={unresolved.length ? "sand" : "neutral"} />
        </div>
        <div className="flex gap-2 mt-5">
          <GlassButton variant="primary" size="sm" onClick={onNew}><Plus className="w-3.5 h-3.5 mr-1.5" />Nieuwe invoer</GlassButton>
          <GlassButton variant="glass" size="sm" onClick={onReprocess}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Opnieuw verwerken</GlassButton>
        </div>
      </GlassPanel>

      {/* Created */}
      {gen.length > 0 && (
        <Section title="Created · new in the OS" icon={Plus}>
          {gen.map((r, i) => (
            <Row key={i} title={`${r.entity} · ${r.title || ""}`} onClick={() => open(r)} />
          ))}
        </Section>
      )}

      {/* Updated */}
      {upd.length > 0 && (
        <Section title="Updated · enriched existing" icon={ArrowUpRight}>
          {upd.map((r, i) => (
            <Row key={i} title={`${r.entity} · ${r.title || ""}`} onClick={() => open(r)} muted />
          ))}
        </Section>
      )}

      {/* Relationships */}
      {rels.length > 0 && (
        <Section title="Connections made" icon={Link2}>
          {rels.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground/80 px-3.5 py-2 rounded-xl glass-1">
              <Link2 className="w-3 h-3 text-olive" />
              <span className="text-xs font-mono">{r.from}</span><span className="text-muted-foreground text-xs">→</span><span className="text-xs font-mono">{r.to}</span>
              <span className="text-[10px] text-muted-foreground ml-auto uppercase">{r.kind}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Section title="Conflicts detected" icon={AlertTriangle} tone="urgent">
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl border border-urgent/30 bg-urgent/5">
              <AlertTriangle className="w-3.5 h-3.5 text-urgent mt-0.5 shrink-0" />
              <div><p className="text-sm font-medium">{c.entity} · {c.title}</p><p className="text-xs text-muted-foreground">{c.reason}</p></div>
            </div>
          ))}
        </Section>
      )}

      {/* Unresolved */}
      {unresolved.length > 0 && (
        <Section title="Unresolved · needs attention" icon={HelpCircle}>
          {unresolved.map((u, i) => (
            <div key={i} className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl glass-1">
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div><p className="text-sm">{u.class} · {u.title || "?"}</p><p className="text-xs text-muted-foreground">{u.reason}</p></div>
            </div>
          ))}
        </Section>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <Section title="Open questions · sent to Wants to Know" icon={HelpCircle}>
          {gaps.map((g, i) => (
            <div key={i} className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl glass-1">
              <HelpCircle className="w-3.5 h-3.5 text-olive mt-0.5 shrink-0" />
              <div><p className="text-xs uppercase tracking-wide text-olive">{g.kind}</p><p className="text-sm">{g.description}</p></div>
            </div>
          ))}
        </Section>
      )}
    </motion.div>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === "olive" ? "text-olive" : tone === "sand" ? "text-sand-deep" : tone === "urgent" ? "text-urgent" : "text-foreground/70";
  return (
    <div className="text-center">
      <div className={`font-display font-bold text-2xl tabular-nums ${color}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function Section({ title, icon: Icon, tone, children }) {
  return (
    <GlassPanel level={2} className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${tone === "urgent" ? "text-urgent" : "text-olive"}`} />
        <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">{title}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </GlassPanel>
  );
}

function Row({ title, onClick, muted }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl glass-1 hover:glass-2 transition-all text-left group">
      <span className={`text-sm ${muted ? "text-foreground/75" : "text-foreground/90"}`}>{title}</span>
      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-olive transition-colors" />
    </button>
  );
}