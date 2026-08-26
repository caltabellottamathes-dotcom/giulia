import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

export default function IngestDropzone({ onSubmitted }) {
  const [mode, setMode] = useState("file");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const start = async (sourceType, payload) => {
    setBusy(true);
    try {
      const rec = await base44.entities.IngestionSource.create({ source_type: sourceType, status: "received", ...payload });
      await base44.functions.invoke("ingestSource", { source_id: rec.id }).catch(() => null);
      onSubmitted(rec);
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const sourceType = isImage ? "image" : "pdf";
    setBusy(true);
    try {
      const up = await base44.integrations.Core.UploadFile({ file });
      const rec = await base44.entities.IngestionSource.create({ source_type: sourceType, original_filename: file.name, file_url: up.file_url, status: "received" });
      await base44.functions.invoke("ingestSource", { source_id: rec.id }).catch(() => null);
      onSubmitted(rec);
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex gap-2 justify-center">
        <GlassButton variant={mode === "file" ? "primary" : "glass"} size="sm" onClick={() => setMode("file")}><FileText className="w-3.5 h-3.5 mr-1.5" />Bestand</GlassButton>
        <GlassButton variant={mode === "text" ? "primary" : "glass"} size="sm" onClick={() => setMode("text")}><Upload className="w-3.5 h-3.5 mr-1.5" />Tekst plakken</GlassButton>
      </div>

      {mode === "file" ? (
        <GlassPanel level={2} className="p-10">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center py-16 text-center ${dragOver ? "border-olive bg-olive/5" : "border-border hover:border-olive/50"}`}
          >
            <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            {busy ? <Loader2 className="w-7 h-7 text-olive animate-spin mb-3" /> : <Upload className="w-7 h-7 text-olive mb-3" />}
            <p className="font-display font-medium text-foreground/90">{busy ? "Bezig met uploaden…" : "Sleep een bestand hierheen"}</p>
            <p className="text-xs text-muted-foreground mt-1">PDF of afbeelding · GIULIA begrijpt de inhoud</p>
          </div>
        </GlassPanel>
      ) : (
        <GlassPanel level={2} className="p-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Plak hier willekeurige tekst — een notitie, een offerte, een verslag, een mail… GIULIA begrijpt het, haalt er entiteiten uit en verspreidt ze door het OS."
            rows={10}
            className="w-full rounded-xl bg-white/40 backdrop-blur-md border border-white/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-olive/40 resize-y"
          />
          <div className="flex justify-end">
            <GlassButton variant="primary" size="sm" disabled={busy || !text.trim()} onClick={() => start("text", { pasted_text: text.trim() })}>
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verwerk met GIULIA"}
            </GlassButton>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}