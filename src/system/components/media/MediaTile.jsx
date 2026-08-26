import React, { useEffect, useState } from "react";
import { Play, Loader2, FileText, Image as ImageIcon } from "lucide-react";

/** MediaTile — visuele voorvertoning van één bestand (cloud of lokaal).
 *  Foto's en video's tonen hun echte thumbnail (cloud direct, lokaal via
 *  een blob-URL); audio krijgt een kleurverloop, documenten een icoon. */
export default function MediaTile({ file, busy, onOpen }) {
  const isLocal = file.source === "local";
  const hasVisual = file.kind === "image" || file.kind === "video";
  const [blob, setBlob] = useState(null);

  useEffect(() => {
    if (!isLocal || !hasVisual) return;
    let alive = true;
    let made = null;
    (async () => {
      try {
        const fl = file.raw?.file || (file.raw?.handle ? await file.raw.handle.getFile() : null);
        if (!fl || !alive) return;
        const u = URL.createObjectURL(fl);
        made = u;
        if (alive) setBlob(u);
      } catch { /* negeer */ }
    })();
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [file, isLocal, hasVisual]);

  const src = isLocal ? blob : file.url;

  return (
    <button onClick={() => onOpen(file)} className="group relative aspect-square rounded-xl overflow-hidden border border-marble/15 bg-marble/5 text-left">
      {file.kind === "image" && src && <img src={src} alt={file.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
      {file.kind === "video" && src && <video src={src + (isLocal ? "" : "#t=0.5")} preload="metadata" muted playsInline className="absolute inset-0 w-full h-full object-cover" />}
      {file.kind === "music" && <div className="absolute inset-0" style={{ background: "linear-gradient(150deg, #d8dab3, #5d7388)" }} />}
      {((file.kind !== "music" && !src) || file.kind === "doc") && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: file.kind === "doc" ? "rgba(0,0,0,0.05)" : "linear-gradient(150deg, #c6d3de, #8fa3b6)" }}>
          {file.kind === "doc" ? <FileText className="h-6 w-6 text-white/80" /> : <ImageIcon className="h-6 w-6 text-white/70" />}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-2">
        <p className="text-[10px] font-medium text-white truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{file.name}</p>
        <p className="text-[8px] uppercase tracking-[0.14em] text-white/75">{file.kind === "music" ? "audio" : file.kind}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <span className="h-9 w-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-charcoal" /> : <Play className="h-4 w-4 text-charcoal translate-x-0.5" />}
        </span>
      </div>
    </button>
  );
}