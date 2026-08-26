import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Sparkles, History } from "lucide-react";
import IngestDropzone from "@/system/components/ingest/IngestDropzone";
import PipelineStatus from "@/system/components/ingest/PipelineStatus";
import IngestResult from "@/system/components/ingest/IngestResult";
import IngestHistory from "@/system/components/ingest/IngestHistory";

const PROCESSING = ["received", "reading", "understanding", "extracting", "matching", "connecting", "updating", "distributing"];

export default function Ingest() {
  const [tab, setTab] = useState("new"); // new | history
  const [source, setSource] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = async () => {
    if (!source) return;
    const s = await base44.entities.IngestionSource.get(source.id).catch(() => null);
    if (s) setSource(s);
  };

  // Realtime subscription to the active source → live pipeline stage
  useEffect(() => {
    if (!source) return;
    let unsub;
    try { unsub = base44.entities.IngestionSource.subscribe((event) => { if (event.id === source.id) refresh(); }); } catch { /* ignore */ }
    const poll = setInterval(refresh, 2500); // safety net
    return () => { try { unsub && unsub(); } catch { /* ignore */ } clearInterval(poll); };
  }, [source?.id, refreshKey]);

  const submitNew = (rec) => { setSource(rec); setRefreshKey((k) => k + 1); setTab("new"); };
  const reset = () => { setSource(null); setRefreshKey((k) => k + 1); };
  const reprocess = async () => {
    if (!source) return;
    await base44.entities.IngestionSource.update(source.id, { status: "reading", processing_history: [] });
    await base44.functions.invoke("ingestSource", { source_id: source.id }).catch(() => null);
    setRefreshKey((k) => k + 1);
  };

  const isProcessing = source && PROCESSING.includes(source.status);
  const isDone = source && ["complete", "partial", "failed"].includes(source.status);

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 pt-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-2xl glass-2 flex items-center justify-center float-shadow">
            <Inbox className="w-5 h-5 text-olive" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl tracking-tight">Ingestion</h1>
            <p className="text-sm text-muted-foreground">Geef GIULIA informatie — zij begrijpt, verbindt en verspreidt het door het OS.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Tab active={tab === "new"} onClick={() => setTab("new")} icon={Sparkles} label="Nieuwe invoer" />
          <Tab active={tab === "history"} onClick={() => setTab("history")} icon={History} label="Geschiedenis" />
        </div>

        <AnimatePresence mode="wait">
          {tab === "new" ? (
            <motion.div key="new" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!source ? (
                <IngestDropzone onSubmitted={submitNew} />
              ) : isProcessing ? (
                <GlassPanel level={2} className="p-8">
                  <p className="text-center text-sm text-muted-foreground mb-6">GIULIA verwerkt <span className="text-foreground/90 font-medium">{source.original_filename || "je invoer"}</span></p>
                  <PipelineStatus status={source.status} history={source.processing_history} />
                </GlassPanel>
              ) : isDone ? (
                <IngestResult source={source} onNew={reset} onReprocess={reprocess} />
              ) : null}
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <IngestHistory onOpen={(s) => { setSource(s); setTab("new"); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Tab({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${active ? "bg-olive text-white float-shadow" : "glass-1 text-muted-foreground hover:text-foreground"}`}>
      <Icon className="w-3.5 h-3.5" />{label}
    </button>
  );
}