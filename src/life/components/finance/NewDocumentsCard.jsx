import React, { useMemo } from "react";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { FileText, Film, Music, Image as ImageIcon, Folder } from "lucide-react";

function KindIcon({ kind, className }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "music") return <Music className={className} />;
  if (kind === "image") return <ImageIcon className={className} />;
  return <FileText className={className} />;
}

/**
 * NewDocumentsCard — witte kaart die alle bestanden én mappen uit de mediatheek
 * toont, gegroepeerd per map. Scrollbaar (scrollbalken OS-breed verborgen).
 * Tik op een bestand opent het in de MediaStage.
 */
export default function NewDocumentsCard() {
  const { items, loading } = useMediaLibrary();

  const groups = useMemo(() => {
    const map = new Map();
    for (const it of items || []) {
      const f = (it.folder || "").trim() || "Losse bestanden";
      if (!map.has(f)) map.set(f, []);
      map.get(f).push(it);
    }
    return Array.from(map.entries());
  }, [items]);

  const open = (item) => {
    const detail = { name: item.filename, url: item.file_url, type: kindOfUpload(item) };
    window.__giuliaPendingMedia = detail;
    window.dispatchEvent(new CustomEvent("giulia:open-media", { detail }));
    window.dispatchEvent(new CustomEvent("giulia:ontwerp-stage", { detail: "media" }));
  };

  return (
    <div className="w-full h-full rounded-[18px] flex flex-col p-4 overflow-hidden" style={{ background: "#f5f5f4" }}>
      <div className="flex items-center justify-between shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">Documents & Folders</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40">{items?.length || 0}</p>
      </div>
      <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
        {loading && (!items || items.length === 0) && <p className="text-[11px] text-foreground/40">Laden…</p>}
        {!loading && (!items || items.length === 0) && <p className="text-[11px] text-foreground/40">Nog geen bestanden. Upload via Media.</p>}
        {groups.map(([folder, files]) => (
          <div key={folder}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Folder className="h-3 w-3 text-foreground/45 shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-foreground/60 truncate">{folder}</span>
              <span className="text-[9px] font-mono text-foreground/35 ml-auto">{files.length}</span>
            </div>
            <div className="space-y-1.5 pl-1">
              {files.map((d) => {
                const kind = kindOfUpload(d);
                return (
                  <button key={d.id} onClick={() => open(d)} className="flex items-center gap-2.5 min-w-0 w-full text-left hover:bg-foreground/[0.04] rounded-lg p-1 -m-1 transition-colors">
                    <div className="h-6 w-6 rounded-full bg-foreground/[0.06] flex items-center justify-center shrink-0">
                      <KindIcon kind={kind} className="w-3 h-3 text-foreground/55" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium truncate">{d.filename || "Bestand"}</p>
                      <p className="text-[9px] uppercase tracking-wide text-foreground/45">{kind === "music" ? "audio" : kind}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}