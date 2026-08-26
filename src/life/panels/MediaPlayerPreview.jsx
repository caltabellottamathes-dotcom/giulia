import React, { useMemo, useState } from "react";
import { Cloud, HardDrive, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useLocalMedia } from "@/lib/useLocalMedia";
import MediaTile from "@/system/components/media/MediaTile";

/** MediaPlayerPreview — QuickAccess tot alle beschikbare bestanden, cloud
 *  en lokaal. Wissel tussen Cloud / Lokaal; tik een bestand → speelt af in
 *  het fullscreen MediaPlayer-window. */
export default function MediaPlayerPreview() {
  const { openMedia } = useMediaViewer();
  const cloud = useMediaLibrary();
  const local = useLocalMedia();
  const [tab, setTab] = useState("cloud");
  const [typeFilter, setTypeFilter] = useState("all");
  const [busy, setBusy] = useState(null);
  const TYPE_FILTERS = [
    { key: "all", label: "Alles" },
    { key: "image", label: "Foto" },
    { key: "video", label: "Video" },
    { key: "music", label: "Audio" },
    { key: "doc", label: "Document" },
  ];

  const cloudFiles = useMemo(
    () => (cloud.items || []).map((i) => ({ id: "c:" + i.id, name: i.filename || "bestand", kind: kindOfUpload(i), source: "cloud", url: i.file_url, raw: i })),
    [cloud.items]
  );
  const localFiles = useMemo(
    () => (local.files || []).map((f) => ({ id: "l:" + f.id, name: f.name.split("/").pop(), kind: f.kind, source: "local", raw: f })),
    [local.files]
  );

  const open = async (f) => {
    setBusy(f.id);
    try {
      if (f.source === "cloud") openMedia({ name: f.name, url: f.url, type: f.kind });
      else { const m = await local.openFile(f.raw); openMedia(m); }
    } catch { /* negeer */ } finally { setBusy(null); }
  };

  const list = (tab === "cloud" ? cloudFiles : localFiles).filter((f) => typeFilter === "all" || f.kind === typeFilter);

  return (
    <div className="flex flex-col h-full text-storm">
      <input
        id="mp-fallback"
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) local.pickFallback(e.target.files); e.target.value = ""; }}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-marble/10 border border-marble/20 rounded-full p-1 mb-4 w-fit">
        <button onClick={() => setTab("cloud")} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${tab === "cloud" ? "bg-charcoal text-ivory" : "text-storm/60 hover:text-storm"}`}>
          <Cloud className="h-3.5 w-3.5" /> Cloud <span className="opacity-50">{cloudFiles.length}</span>
        </button>
        <button onClick={() => setTab("local")} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${tab === "local" ? "bg-charcoal text-ivory" : "text-storm/60 hover:text-storm"}`}>
          <HardDrive className="h-3.5 w-3.5" /> Lokaal <span className="opacity-50">{localFiles.length}</span>
        </button>
      </div>

      {/* Lokale controls */}
      {tab === "local" && (
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => (local.supported ? local.pickDir() : document.getElementById("mp-fallback")?.click())}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-charcoal text-ivory"
          >
            <FolderOpen className="h-3.5 w-3.5" /> {local.files.length ? "Andere map" : "Kies map"}
          </button>
          {local.files.length > 0 && (
            <button onClick={local.rescan} disabled={local.scanning} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-marble/30 text-storm/70 hover:bg-marble/10 disabled:opacity-50">
              <RefreshCw className={local.scanning ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Scan
            </button>
          )}
          {local.dirName && <span className="text-[11px] text-storm/50 truncate">{local.dirName}</span>}
        </div>
      )}

      {/* Type-filter */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {TYPE_FILTERS.map((tf) => (
          <button key={tf.key} onClick={() => setTypeFilter(tf.key)} className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${typeFilter === tf.key ? "bg-charcoal text-ivory" : "bg-marble/10 text-storm/60 hover:text-storm"}`}>{tf.label}</button>
        ))}
      </div>

      {/* Bibliotheek — visueel raster met voorvertoning */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {tab === "cloud" && cloud.loading && (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-storm/40" /></div>
        )}
        {list.length === 0 && !cloud.loading && (
          <p className="text-xs text-storm/50 py-8 text-center leading-relaxed">
            {tab === "cloud" ? "Nog geen bestanden in de cloud." : "Kies een lokale map om bestanden direct af te spelen — zonder upload."}
          </p>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 content-start">
          {list.map((f) => (
            <MediaTile key={f.id} file={f} busy={busy === f.id} onOpen={open} />
          ))}
        </div>
      </div>
    </div>
  );
}