import React, { useState, useEffect } from "react";
import { Film, FileText, X } from "lucide-react";

/**
 * MediaStage — universele viewer in het Pagina-Ontwerp paneel. Luistert naar
 * `giulia:open-media` en toont het aangeklikte bestand ongeacht het type:
 * afbeelding (img), video (video), audio (audio) of pdf/document (iframe).
 */
function kindOf(doc) {
  if (doc?.type) return doc.type;
  const u = String(doc?.url || doc?.name || "").toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg|heic)$/i.test(u)) return "image";
  if (/\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(u)) return "video";
  if (/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(u)) return "music";
  if (/\.(pdf)$/i.test(u)) return "doc";
  return "doc";
}

export default function MediaStage() {
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const h = (e) => setDoc(e.detail || null);
    window.addEventListener("giulia:open-media", h);
    return () => window.removeEventListener("giulia:open-media", h);
  }, []);

  const kind = doc ? kindOf(doc) : null;
  const url = doc?.url;

  return (
    <div className="refraction-panel h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-ivory/10 shrink-0">
        <div className="flex items-center gap-2 text-ivory min-w-0">
          <FileText className="h-4 w-4 text-ivory/70 shrink-0" />
          <span className="text-sm font-display font-semibold truncate">{doc ? doc.name || "Document" : "Media"}</span>
        </div>
        {doc && (
          <button onClick={() => setDoc(null)} className="text-ivory/60 hover:text-ivory transition-colors shrink-0" aria-label="Sluiten">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 p-4">
        {!doc ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-ivory/10 border border-ivory/15 flex items-center justify-center mb-5">
              <Film className="h-6 w-6 text-ivory/70" />
            </div>
            <p className="font-display font-semibold text-xl tracking-[-0.01em] text-ivory">Media</p>
            <p className="text-[13px] text-ivory/55 mt-2 max-w-[16rem] leading-relaxed">
              Klik een document aan om het hier te openen — beeld, video, audio of pdf.
            </p>
          </div>
        ) : kind === "image" ? (
          <img src={url} alt={doc.name || ""} className="w-full h-full object-contain rounded-xl bg-ivory/5" />
        ) : kind === "video" ? (
          <video src={url} controls className="w-full h-full rounded-xl bg-black" />
        ) : kind === "music" ? (
          <div className="h-full flex flex-col items-center justify-center gap-5 text-ivory">
            <div className="h-20 w-20 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center">
              <Film className="h-8 w-8 text-ivory/70" />
            </div>
            <p className="text-sm font-medium">{doc.name}</p>
            <audio src={url} controls className="w-full max-w-md" />
          </div>
        ) : url ? (
          <iframe src={url} title={doc.name || "document"} className="w-full h-full rounded-xl bg-white" />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-ivory">
            <FileText className="h-8 w-8 text-ivory/50 mb-3" />
            <p className="text-sm font-medium">{doc.name || "Document"}</p>
            <p className="text-[11px] text-ivory/40 mt-3">Geen bestands-URL gekoppeld.</p>
          </div>
        )}
      </div>
    </div>
  );
}