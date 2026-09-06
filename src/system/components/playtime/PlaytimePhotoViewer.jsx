import React, { useEffect } from "react";

const VID_EXTS = ["mp4", "mov", "webm", "m4v", "mkv"];
// kind-veld is leidend (reddit/twitter-video's hebben niet altijd een extensie)
const isVideoItem = (it) => it?.kind === "video" || VID_EXTS.includes(String(it?.image_url || "").split("?")[0].split(".").pop().toLowerCase());

/** PlaytimePhotoViewer — fullscreen lightbox om door de foto's van een
 *  categorie te bladeren: ‹ › of ← → om te navigeren, Esc of buitenklik
 *  sluit, "Verwijderen" wist de getoonde foto. Sluitknop linksboven. */
export default function PlaytimePhotoViewer({ items, index, onIndex, onClose, onDelete, busy }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && index < items.length - 1) onIndex(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  const it = items[index];
  if (!it) return null;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col animate-fade-in" style={{ background: "rgba(18,18,20,0.94)" }} onClick={onClose}>
      <div className="flex items-center justify-between gap-3 p-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} title="Sluiten (Esc)"
          className="w-9 h-9 rounded-full border border-white/25 text-white text-[16px] leading-none flex items-center justify-center hover:bg-white/10 transition">×</button>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.6)" }}>
          {it.category} · {index + 1} / {items.length}
        </span>
        <button onClick={() => onDelete(it.id)} disabled={busy} title="Verwijder deze foto"
          className="font-mono text-[10px] uppercase tracking-[0.18em] transition disabled:opacity-30"
          style={{ color: "#e88a7d" }}>Verwijderen</button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center gap-4 px-4 pb-6" onClick={(e) => e.stopPropagation()}>
        {index > 0 && (
          <button onClick={() => onIndex(index - 1)} title="Vorige (←)"
            className="w-10 h-10 shrink-0 rounded-full border border-white/25 text-white text-[18px] leading-none flex items-center justify-center hover:bg-white/10 transition">‹</button>
        )}
        {isVideoItem(it) ? (
          <video src={it.image_url} controls autoPlay muted loop playsInline className="max-w-[82vw] max-h-[74vh] rounded-md border border-white/15 bg-black" />
        ) : (
          <img src={it.image_url} alt={it.category}
            className="max-w-[82vw] max-h-[74vh] object-contain rounded-md border border-white/15 select-none" />
        )}
        {index < items.length - 1 && (
          <button onClick={() => onIndex(index + 1)} title="Volgende (→)"
            className="w-10 h-10 shrink-0 rounded-full border border-white/25 text-white text-[18px] leading-none flex items-center justify-center hover:bg-white/10 transition">›</button>
        )}
      </div>
    </div>
  );
}