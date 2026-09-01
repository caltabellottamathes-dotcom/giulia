import React, { useMemo, useState } from "react";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { Image } from "@/components/ui/image";
import { X, Folder, FolderOpen, Film, Music, FileText, ImageIcon, Loader2, Check } from "lucide-react";

const KIND_TABS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
  { key: "doc", label: "Docs" },
];

function KindIcon({ kind, className }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "music") return <Music className={className} />;
  if (kind === "doc") return <FileText className={className} />;
  return <ImageIcon className={className} />;
}

/** LibraryPicker — modale kiezer uit de FILES-bibliotheek (Upload,
 *  uploaded_for: "media"). Mappen + soort-filter; bij kiezen wordt
 *  onPick({ url, name, kind }) aangeroepen. Voor hergebruik op elke
 *  upload-plek (chat, voice, ingest, e.d.). */
export default function LibraryPicker({ open, onClose, onPick, title = "Kies uit bibliotheek" }) {
  const { items, loading } = useMediaLibrary();
  const [tab, setTab] = useState("all");
  const [folder, setFolder] = useState(null);

  const folders = useMemo(
    () => [...new Set((items || []).map((i) => i.folder).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [items]
  );
  const visible = useMemo(
    () => (items || []).filter((i) =>
      (tab === "all" || kindOfUpload(i) === tab) && (folder == null || i.folder === folder)
    ),
    [items, tab, folder]
  );

  if (!open) return null;

  const pick = (item) => {
    onPick({ url: item.file_url, name: item.filename, kind: kindOfUpload(item), folder: item.folder });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-charcoal/45" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[80vh] flex flex-col rounded-[24px] overflow-hidden bg-card border border-foreground/10 shadow-[0_32px_72px_-20px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="shrink-0 px-5 pt-5 pb-3 flex items-center gap-3 border-b border-foreground/10">
          <FolderOpen className="h-5 w-5 text-foreground/60" />
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-[15px] text-foreground tracking-[-0.01em]">{title}</p>
            <p className="text-[11px] text-foreground/50">{items.length} bestanden in bibliotheek</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-foreground/[0.05] hover:bg-foreground/10 flex items-center justify-center text-foreground/60 transition" aria-label="Sluiten">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="shrink-0 px-5 py-3 flex flex-wrap items-center gap-2 border-b border-foreground/10">
          <button onClick={() => setFolder(null)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${folder == null ? "bg-charcoal text-ivory" : "bg-foreground/[0.04] text-foreground/60 hover:text-foreground"}`}>
            <Folder className="h-3.5 w-3.5" /> Alles
          </button>
          {folders.map((f) => (
            <button key={f} onClick={() => setFolder(f)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${folder === f ? "bg-charcoal text-ivory" : "bg-foreground/[0.04] text-foreground/60 hover:text-foreground"}`}>
              <Folder className="h-3.5 w-3.5" /> {f}
            </button>
          ))}
          <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 ml-auto overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {KIND_TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${tab === t.key ? "bg-charcoal text-ivory" : "text-foreground/60 hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-foreground/40"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-foreground/45">
              <ImageIcon className="h-7 w-7 mb-3 text-foreground/30" />
              <p className="text-sm">Nog geen bestanden in deze weergave.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {visible.map((item) => {
                const kind = kindOfUpload(item);
                return (
                  <button key={item.id} onClick={() => pick(item)} className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-foreground/10 bg-foreground/[0.04] flex items-center justify-center text-left hover:ring-foreground/30 transition">
                    {kind === "image" ? (
                      <Image src={item.file_url} className="h-full w-full" fittingType="fill" />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-foreground/45">
                        <KindIcon kind={kind} className="h-7 w-7" />
                        <span className="text-[10px] text-center px-2 line-clamp-2 text-foreground/55">{item.filename}</span>
                      </div>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 group-hover:bg-charcoal/25 transition-colors">
                      <span className="h-9 w-9 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="h-4 w-4" />
                      </span>
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-medium text-ivory bg-charcoal/55 backdrop-blur px-1.5 py-0.5 rounded-full truncate">{item.filename}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}