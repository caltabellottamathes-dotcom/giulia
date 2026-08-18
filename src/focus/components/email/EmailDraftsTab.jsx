import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X, Edit, Send, Mail, Loader2 } from "lucide-react";
import GlassButton from "@/system/components/glass/GlassButton";

/**
 * EmailDraftsTab — toont alle concept-antwoorden die Giulia heeft geschreven
 * als mooie kaarten. Elke kaart toont de originele email + het concept, met
 * knoppen om goed te keuren, te bewerken of te verwerpen.
 */
export default function EmailDraftsTab({ drafts, onApprove, onEdit, onReject, sending }) {
  if (!drafts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative inline-flex mb-4">
          <Sparkles className="h-10 w-10 text-olive/30" />
        </div>
        <p className="text-lg font-display font-medium text-muted-foreground">Giulia heeft geen concepten voor je</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Kom later terug of vraag Giulia om een email te beantwoorden.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <AnimatePresence initial={false}>
        {drafts.map((draft, i) => (
          <motion.div
            key={draft.id}
            layout
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
            className="glass-1 rounded-3xl p-5 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-olive/15 text-olive text-[10px] font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Door Giulia
              </span>
              {draft.timestamp && <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{new Date(draft.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
            </div>

            {/* Original email context */}
            {draft.context && (
              <div className="glass rounded-2xl p-3 mb-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Origineel van {draft.sender || "onbekend"}</p>
                <p className="text-xs text-foreground/70 line-clamp-2">{draft.context}</p>
              </div>
            )}

            {/* Draft content */}
            <div className="flex-1 min-h-0 mb-4">
              <p className="text-sm font-display font-semibold mb-1">{draft.subject || "(geen onderwerp)"}</p>
              <p className="text-xs text-foreground/80 line-clamp-5 leading-relaxed whitespace-pre-wrap">{draft.body || "(geen inhoud)"}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <GlassButton variant="primary" size="sm" className="flex-1" onClick={() => onApprove(draft)} disabled={sending}>
                {sending === draft.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Verstuur
              </GlassButton>
              <GlassButton variant="outline" size="sm" onClick={() => onEdit(draft)}><Edit className="h-4 w-4" /></GlassButton>
              <GlassButton variant="ghost" size="sm" onClick={() => onReject(draft)} className="text-destructive hover:text-destructive"><X className="h-4 w-4" /></GlassButton>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}