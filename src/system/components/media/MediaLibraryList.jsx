import React, { useMemo } from "react";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { FileText, Film, Music, Image as ImageIcon, Folder, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function KindIcon({ kind, className }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "music") return <Music className={className} />;
  if (kind === "image") return <ImageIcon className={className} />;
  return <FileText className={className} />;
}

/**
 * MediaLibraryList — transparante, compacte lijst van de cloud-mediatheek,
 * gegroepeerd per map. Bedoeld voor de smalle stage-panelen: geen eigen
 * achtergrond, zodat het glas van het paneel eronder zichtbaar blijft.
 * Tik op een bestand roept onPick(file) aan (standaard → previewMedia).
 */
export default function MediaLibraryList({ filter, onPick, className, emptyHint }) {
  const { items, loading } = useMediaLibrary();

  const visible = useMemo(
    () => (items || []).filter((i) => !filter || kindOfUpload(i) === filter),
    [items, filter]
  );

  const groups = useMemo(() => {
    const map = new Map();
    for (const it of visible) {
      const f = (it.folder || "").trim() || "Losse bestanden";
      if (!map.has(f)) map.set(f, []);
      map.get(f).push(it);
    }
    return Array.from(map.entries());
  }, [visible]);

  const pick = (item) => onPick?.({ name: item.filename, url: item.file_url, type: kindOfUpload(item) });

  return (
    <div className={cn("h-full w-full overflow-y-auto px-4 pb-6 pt-14", className)}>
      {loading && (!items || items.length === 0) && (
        <div className="flex items-center justify-center py-10 text-ivory/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[12px] text-ivory/55 max-w-[15rem] leading-relaxed">
            {emptyHint || "Nog geen bestanden. Upload via de Media-pagina."}
          </p>
        </div>
      )}
      {groups.map(([folder, files]) => (
        <div key={folder} className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Folder className="h-3 w-3 text-ivory/50 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ivory/60 truncate">{folder}</span>
            <span className="text-[9px] font-mono text-ivory/35 ml-auto">{files.length}</span>
          </div>
          <div className="space-y-1">
            {files.map((d) => {
              const kind = kindOfUpload(d);
              return (
                <button key={d.id} onClick={() => pick(d)} className="flex items-center gap-2.5 min-w-0 w-full text-left rounded-lg p-1.5 hover:bg-ivory/8 transition-colors">
                  <div className="h-7 w-7 rounded-full bg-ivory/8 flex items-center justify-center shrink-0">
                    <KindIcon kind={kind} className="w-3.5 h-3.5 text-ivory/65" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-ivory/90 truncate">{d.filename || "Bestand"}</p>
                    <p className="text-[9px] uppercase tracking-wide text-ivory/45">{kind === "music" ? "audio" : kind}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}