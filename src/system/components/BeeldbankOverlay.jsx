import React, { useState } from "react";
import { useBeeldbank } from "@/lib/BeeldbankContext";
import { IMAGES } from "@/lib/images";
import { Image } from "@/components/ui/image";
import { X, Upload, Search, Camera } from "lucide-react";

/**
 * BeeldbankOverlay — de zwevende modus-balk + de full-screen fotokiezer.
 * Wordt enkel getoond als de beeldbank-modus aan staat of de kiezer open is.
 */
export default function BeeldbankOverlay() {
  const { mode, toggleMode, assets, picker, pick, closePicker, upload, uploading } = useBeeldbank();
  const [q, setQ] = useState("");

  return (
    <>
      {/* Modus-balk */}
      {mode && !picker.open && (
        <div data-no-capture className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] glass-2 rounded-full pl-5 pr-2 py-2 flex items-center gap-3 shadow-lg">
          <Camera className="h-4 w-4 text-ivory" />
          <span className="text-xs text-ivory font-medium hidden sm:inline">Beeldbank modus — klik een foto om hem te wisselen</span>
          <span className="text-xs text-ivory font-medium sm:hidden">Klik een foto</span>
          <button
            onClick={toggleMode}
            className="ml-1 h-8 px-3 rounded-full bg-ivory/15 hover:bg-ivory/25 text-ivory text-xs font-semibold flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" /> Afsluiten
          </button>
        </div>
      )}

      {/* Kiezer */}
      {picker.open && (
        <div data-no-capture className="fixed inset-0 z-[70] bg-charcoal/75 backdrop-blur-xl flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ivory/10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-ivory font-display font-semibold shrink-0">Wissel foto</span>
              <span className="text-[11px] text-ivory/50 truncate max-w-[40vw]">{picker.originalUrl}</span>
            </div>
            <button onClick={closePicker} className="h-9 w-9 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory flex items-center justify-center shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-6 py-3 flex items-center gap-3 border-b border-ivory/10">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-ivory/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek foto's…"
                className="bg-transparent text-sm text-ivory placeholder:text-ivory/40 focus:outline-none flex-1"
              />
            </div>
            <label className="h-9 px-3 rounded-full bg-ivory/15 hover:bg-ivory/25 text-ivory text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) await upload(f); e.target.value = ""; }}
              />
            </label>
          </div>
          <PickerGrid q={q} assets={assets} onPick={pick} uploading={uploading} />
        </div>
      )}
    </>
  );
}

function PickerGrid({ q, assets, onPick, uploading }) {
  const website = Object.entries(IMAGES);
  const ql = q.toLowerCase();
  const filtered = q ? website.filter(([k]) => k.toLowerCase().includes(ql)) : website;
  const uploaded = (assets || []).filter((a) => !q || (a.label || "").toLowerCase().includes(ql));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {uploading && <div className="text-ivory/60 text-xs mb-3">Uploaden…</div>}
      {uploaded.length > 0 && (
        <>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-2">Geüpload · {uploaded.length}</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 mb-5">
            {uploaded.map((a) => (
              <button
                key={a.id}
                onClick={() => onPick(a.url)}
                className="group relative aspect-square rounded-xl overflow-hidden ring-1 ring-ivory/10 hover:ring-2 hover:ring-ivory/70"
              >
                <Image src={a.url} className="h-full w-full" fittingType="fill" />
              </button>
            ))}
          </div>
        </>
      )}
      <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-2">Website · {filtered.length}</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
        {filtered.map(([k, url]) => (
          <button
            key={k}
            onClick={() => onPick(url)}
            className="group relative aspect-square rounded-xl overflow-hidden ring-1 ring-ivory/10 hover:ring-2 hover:ring-ivory/70"
          >
            <Image src={url} className="h-full w-full" fittingType="fill" />
            <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-1 text-[9px] text-ivory/90 truncate opacity-0 group-hover:opacity-100 text-left">
              {k}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}