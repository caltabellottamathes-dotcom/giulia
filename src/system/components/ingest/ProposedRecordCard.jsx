import React from "react";
import { motion } from "framer-motion";
import { Check, Link2, X, AlertTriangle, Sparkles } from "lucide-react";

const FIELD_LABELS = {
  name: "Naam", project_name: "Project", deadline: "Deadline", date: "Datum", start: "Start", end: "Eind",
  amount: "Bedrag", currency: "Valuta", recurring: "Terugkerend", frequency: "Frequentie", category: "Categorie",
  financial_kind: "Soort", payment_date: "Betaaldatum", start_date: "Startdatum", end_date: "Einddatum",
  account_source: "Rekening", email: "Email", phone: "Telefoon", company: "Bedrijf", role: "Rol",
  relationship_type: "Relatie", priority: "Prioriteit", status: "Status", location: "Locatie",
  notes: "Notities", content: "Inhoud", decision: "Beslissing", url: "URL", description: "Omschrijving",
  beneficiary: "Begunstigde", account_number: "Rekeningnr", reference: "Referentie",
  recurrence: "Frequentie", obligation_type: "Type last"
};

const CONF_DOT = { certain: "bg-olive", highly_likely: "bg-olive/70", probable: "bg-sand-deep", uncertain: "bg-urgent/60", unresolved: "bg-muted-foreground/40" };

export default function ProposedRecordCard({ record, onChange }) {
  const f = record.fields || {};
  const action = record.action || "create";

  const setField = (k, v) => onChange({ fields: { ...f, [k]: v } });
  const entries = Object.entries(f).filter(([, v]) => v !== undefined && v !== null && v !== "");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass-1 p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-olive/15 text-olive">{record.entity_class}</span>
        {record.theme_title && <span className="text-[9px] uppercase tracking-wider px-2 py-1 rounded-full bg-olive/10 text-olive/80">↳ {record.theme_title}</span>}
        <span className={`h-2 w-2 rounded-full ${CONF_DOT[record.confidence] || "bg-muted-foreground/40"}`} title={record.confidence} />
        {record.explicit ? (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">explicit</span>
        ) : (
          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-olive/10 text-olive"><Sparkles className="w-2.5 h-2.5" />afgeleid</span>
        )}
        {record.decision === "CONFLICT" && <span className="text-[9px] uppercase tracking-wider font-bold text-urgent">conflict</span>}
        <div className="ml-auto flex gap-1">
          {["create", "update", "link", "skip"].map((a) => (
            <button key={a} onClick={() => onChange({ action: a })}
              className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full transition inline-flex items-center ${action === a ? (a === "create" ? "bg-olive text-white" : a === "update" ? "bg-urgent text-charcoal" : a === "link" ? "bg-sand-deep text-white" : "bg-muted-foreground/30 text-muted-foreground") : "glass-1 text-muted-foreground"}`}>
              {a === "create" ? <Check className="w-3 h-3 mr-0.5" /> : a === "link" ? <Link2 className="w-3 h-3 mr-0.5" /> : a === "update" ? <AlertTriangle className="w-3 h-3 mr-0.5" /> : <X className="w-3 h-3 mr-0.5" />}
              {a === "create" ? "Maak" : a === "update" ? "Update" : a === "link" ? "Koppel" : "Skip"}
            </button>
          ))}
        </div>
      </div>

      {record.validation && record.validation.errors && record.validation.errors.length > 0 && (
        <div className="mb-2 rounded-md bg-urgent/10 px-2.5 py-1.5">
          {record.validation.errors.map((e, i) => <p key={i} className="text-[10px] text-urgent leading-snug">⚠ {e}</p>)}
        </div>
      )}

      <input value={record.title || ""} onChange={(e) => onChange({ title: e.target.value })} placeholder="Titel"
        className="w-full rounded-lg glass-1 px-3 py-2 text-sm font-medium outline-none mb-2" />

      {record.reasoning && <p className="text-[11px] text-muted-foreground italic mb-2 leading-relaxed">“{record.reasoning}”</p>}

      {action === "link" && record.existing_title && (
        <div className="text-[11px] text-sand-deep mb-2 flex items-center gap-1"><Link2 className="w-3 h-3" /> Koppel aan bestaande: {record.existing_title}</div>
      )}

      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {entries.map(([k, v]) => (
            <label key={k} className="block">
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{FIELD_LABELS[k] || k}</span>
              {typeof v === "boolean" ? (
                <button type="button" onClick={() => setField(k, !v)} className={`text-[11px] mt-0.5 px-2 py-1 rounded-md ${v ? "bg-olive/20 text-olive" : "glass-1 text-muted-foreground"}`}>{v ? "ja" : "nee"}</button>
              ) : (
                <input value={String(v)} onChange={(e) => setField(k, typeof v === "number" ? Number(e.target.value) : e.target.value)} type={typeof v === "number" ? "number" : "text"} className="w-full mt-0.5 rounded-md glass-1 px-2 py-1 text-xs outline-none" />
              )}
            </label>
          ))}
        </div>
      )}

      {record.source_span && <p className="text-[10px] text-muted-foreground/70 mt-2 italic border-l-2 border-border/40 pl-2">“{record.source_span}”</p>}
    </motion.div>
  );
}