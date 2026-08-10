import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Link as LinkIcon } from "lucide-react";

/**
 * ImageInput — kies een afbeelding door te uploaden (Core.UploadFile) of een
 * URL te plakken. Werkt voor project-covers en contact-avatars.
 */
export default function ImageInput({ value, onChange, label = "Afbeelding", className }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [showUrl, setShowUrl] = useState(false);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setErr("");
    try {
      const res = await base44.integrations.Core.UploadFile({ file: f });
      onChange(res.file_url);
    } catch (e2) {
      setErr("Upload mislukt — plak een URL als fallback.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="h-16 w-16 rounded-xl overflow-hidden glass-1 shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground">geen</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="inline-flex items-center gap-2 rounded-full glass-1 px-3 py-2 text-xs cursor-pointer hover:bg-foreground/5 transition">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploaden…" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
          </label>
          <button
            type="button"
            onClick={() => setShowUrl((s) => !s)}
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <LinkIcon className="h-3 w-3" /> of plak URL
          </button>
          {showUrl && (
            <input
              type="url"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              className="w-full glass-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
          )}
          {err && <p className="text-[11px] text-destructive">{err}</p>}
        </div>
      </div>
    </div>
  );
}