import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { History, Loader2, ChevronRight } from "lucide-react";

export default function IngestHistory({ onOpen }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const list = await base44.entities.IngestionSource.list("-created_date", 40); setItems(list || []); }
    catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const statusTone = (s) => s === "complete" ? "text-olive" : s === "failed" ? "text-destructive" : s === "partial" ? "text-urgent" : "text-muted-foreground";

  return (
    <GlassPanel level={2} className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-olive" />
        <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">Ingestion history · audit trail</h3>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-olive animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nog geen bronnen verwerkt.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((s) => (
            <motion.button key={s.id} whileHover={{ x: 2 }} onClick={() => onOpen(s)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl glass-1 hover:glass-2 transition-all text-left">
              <span className={`h-2 w-2 rounded-full shrink-0 ${s.status === "complete" ? "bg-olive" : s.status === "failed" ? "bg-destructive" : "bg-foreground/30"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{s.original_filename || s.overall_subject || (s.pasted_text || "").slice(0, 40) || "Ingested source"}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(s.created_date).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {(s.generated_records || []).length} created · {(s.updated_records || []).length} updated</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wide ${statusTone(s.status)}`}>{s.status}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}