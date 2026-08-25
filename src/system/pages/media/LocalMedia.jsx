import React, { useRef, useState, useEffect } from "react";
import { useLocalMedia } from "@/lib/useLocalMedia";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { FolderOpen, FolderX, Film, Music, Play, Loader2, HardDrive, RefreshCw, ShieldCheck } from "lucide-react";

const FILTERS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
];

function LocalThumb({ item, onOpen }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    let made = null;
    (async () => {
      try {
        const f = item.file || await item.handle.getFile();
        if (!alive) return;
        const u = URL.createObjectURL(f);
        made = u;
        if (alive) setUrl(u);
      } catch { /* negeer */ }
    })();
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [item]);

  return (
    <button
      onClick={() => onOpen(item)}
      className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-foreground/10 bg-foreground/[0.04] flex items-center justify-center text-left"
    >
      {item.kind === "image" && url ? (
        <img src={url} alt={item.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-foreground/45 px-2">
          {item.kind === "video" ? <Film className="h-7 w-7" /> : <Music className="h-7 w-7" />}
          <span className="text-[10px] line-clamp-2 text-foreground/55 text-center">{item.name.split("/").pop()}</span>
        </div>
      )}
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.16em] font-bold text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full">
        {item.kind === "music" ? "audio" : item.kind}
      </span>
      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors">
        <span className="h-10 w-10 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-4 w-4 ml-0.5" />
        </span>
      </span>
    </button>
  );
}

export default function LocalMedia() {
  const local = useLocalMedia();
  const { openMedia } = useMediaViewer();
  const fallbackRef = useRef(null);
  const [filter, setFilter] = useState("all");

  const choose = () => {
    if (local.supported) local.pickDir();
    else fallbackRef.current?.click();
  };

  const open = async (item) => {
    try {
      const m = await local.openFile(item);
      openMedia(m);
    } catch { /* negeer */ }
  };

  const visible = filter === "all" ? local.files : local.files.filter((f) => f.kind === filter);
  const counts = {
    all: local.files.length,
    image: local.files.filter((f) => f.kind === "image").length,
    video: local.files.filter((f) => f.kind === "video").length,
    music: local.files.filter((f) => f.kind === "music").length,
  };

  const hasDir = local.status === "granted" || local.status === "scanning";

  return (
    <div>
      <input
        ref={fallbackRef}
        type="file"
        // @ts-ignore — webkitdirectory is een niet-standaard attribuut
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) local.pickFallback(e.target.files); e.target.value = ""; }}
      />

      {/* Statusbalk */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 text-xs text-foreground/60 min-w-0">
          <HardDrive className="h-4 w-4 shrink-0" />
          {hasDir ? (
            <span className="truncate">
              <span className="font-semibold text-foreground">{local.dirName}</span>
              {" · "}{local.files.length} bestanden
              {!local.supported && <span className="text-foreground/40"> · map-kiezer</span>}
            </span>
          ) : (
            <span>Lokaal — kies een map op je schijf</span>
          )}
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          {hasDir && (
            <>
              <button
                onClick={local.rescan}
                disabled={local.scanning}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-foreground/[0.05] border border-foreground/10 text-foreground hover:bg-foreground/10"
              >
                <RefreshCw className={local.scanning ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Opnieuw scannen
              </button>
              <button
                onClick={local.forget}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-foreground/[0.05] border border-foreground/10 text-foreground hover:bg-foreground/10"
              >
                <FolderX className="h-3.5 w-3.5" /> Map loskoppelen
              </button>
            </>
          )}
          <button
            onClick={choose}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-charcoal text-ivory"
          >
            <FolderOpen className="h-4 w-4" /> {hasDir ? "Andere map" : "Kies map"}
          </button>
        </div>
      </div>

      {/* Hergebruik-prompt bij bewaarde handle zonder toestemming */}
      {local.status === "prompt" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 py-3 mb-5">
          <div className="flex items-center gap-2 text-xs text-foreground/70 min-w-0">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="truncate">Map <span className="font-semibold text-foreground">{local.dirName}</span> hergebruiken?</span>
          </div>
          <button
            onClick={local.resume}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold bg-charcoal text-ivory"
          >
            Toegang geven
          </button>
        </div>
      )}

      {/* Type-filter (alleen als er bestanden zijn) */}
      {hasDir && local.files.length > 0 && (
        <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 mb-5 w-fit">
          {FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === t.key ? "bg-charcoal text-ivory" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {t.label} <span className="opacity-50 ml-1">{counts[t.key] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Grid / states */}
      {local.scanning ? (
        <div className="flex flex-col items-center justify-center py-24 text-foreground/40 gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs">Map scannen…</span>
        </div>
      ) : !hasDir ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-foreground/[0.05] flex items-center justify-center mb-4">
            <FolderOpen className="h-6 w-6 text-foreground/35" />
          </div>
          <p className="text-sm text-foreground/50 max-w-sm">
            Kies een map op je schijf om foto's, video's en audio direct af te spelen — zonder upload. Bestanden blijven lokaal.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-foreground/50">Geen media gevonden in deze map{filter !== "all" ? " voor dit filter" : ""}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visible.map((item) => (
            <LocalThumb key={item.id} item={item} onOpen={open} />
          ))}
        </div>
      )}
    </div>
  );
}