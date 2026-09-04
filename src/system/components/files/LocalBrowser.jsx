import React, { useMemo, useRef, useState, useEffect } from "react";
import { useLocalMedia } from "@/lib/useLocalMedia";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import {
  Folder, FolderOpen, FolderX, Film, Music, Play, Loader2, HardDrive, RefreshCw, ShieldCheck, ChevronRight, ImageIcon,
} from "lucide-react";

const FILTERS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
];

function LocalTile({ item, onOpen }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true;
    let made = null;
    (async () => {
      try {
        const f = item.file || await item.handle.getFile();
        if (!alive) return;
        made = URL.createObjectURL(f);
        if (alive) setUrl(made);
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
        <img src={url} alt={item.name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-foreground/45 px-2">
          {item.kind === "video" ? <Film className="h-7 w-7" /> : item.kind === "image" ? <ImageIcon className="h-7 w-7" /> : <Music className="h-7 w-7" />}
          <span className="text-[10px] line-clamp-2 text-foreground/55 text-center">{item.name.split("/").pop()}</span>
        </div>
      )}
      <span className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.16em] font-bold text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full">
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

/** LocalBrowser — de "Lokaal"-map in de FILES-verkenner: blader door de map op
 *  je schijf met echte submappen, alles leestegens in de browser (geen upload). */
export default function LocalBrowser() {
  const local = useLocalMedia();
  const { openMedia } = useMediaViewer();
  const fallbackRef = useRef(null);
  const [path, setPath] = useState("");
  const [filter, setFilter] = useState("all");

  const segments = path ? path.split("/") : [];

  const dirs = useMemo(() => {
    const s = new Set();
    local.files.forEach((f) => {
      const rel = path ? f.name.slice(path.length + 1) : f.name;
      if (!rel.includes("/")) return;
      const d = rel.split("/")[0];
      if (d) s.add(d);
    });
    return [...s].sort();
  }, [local.files, path]);

  const filesInDir = useMemo(
    () => local.files.filter((f) => {
      const rel = path ? f.name.slice(path.length + 1) : f.name;
      return !rel.includes("/");
    }),
    [local.files, path]
  );

  const visible = filter === "all" ? filesInDir : filesInDir.filter((f) => f.kind === filter);
  const counts = {
    all: filesInDir.length,
    image: filesInDir.filter((f) => f.kind === "image").length,
    video: filesInDir.filter((f) => f.kind === "video").length,
    music: filesInDir.filter((f) => f.kind === "music").length,
  };

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

  const hasDir = local.status === "granted" || local.status === "scanning";

  return (
    <div className="flex-1 min-w-0 flex flex-col">
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

      {/* Kop + bediening */}
      <div className="px-5 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 text-[13px] text-foreground/70 min-w-0 flex-wrap">
          <HardDrive className="h-3.5 w-3.5 mr-1" />
          <button onClick={() => setPath("")} className={path ? "hover:text-foreground underline underline-offset-2" : "font-semibold text-foreground"}>
            Lokaal{local.dirName ? ` · ${local.dirName}` : ""}
          </button>
          {segments.map((seg, i) => {
            const p = segments.slice(0, i + 1).join("/");
            return (
              <span key={p} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="h-3 w-3 text-foreground/30 shrink-0" />
                <button
                  onClick={() => setPath(p)}
                  className={i === segments.length - 1 ? "font-semibold text-foreground truncate" : "hover:text-foreground underline underline-offset-2 truncate"}
                >
                  {seg}
                </button>
              </span>
            );
          })}
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          {hasDir && (
            <>
              <button onClick={local.rescan} disabled={local.scanning}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-foreground/[0.05] border border-foreground/10 text-foreground hover:bg-foreground/10">
                <RefreshCw className={local.scanning ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Opnieuw
              </button>
              <button onClick={local.forget}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-foreground/[0.05] border border-foreground/10 text-foreground hover:bg-foreground/10">
                <FolderX className="h-3.5 w-3.5" /> Loskoppelen
              </button>
            </>
          )}
          <button onClick={choose} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-charcoal text-ivory">
            <FolderOpen className="h-4 w-4" /> {hasDir ? "Andere map" : "Kies map"}
          </button>
        </div>
      </div>

      {local.status === "prompt" && (
        <div className="mx-5 mb-3 flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-foreground/70 min-w-0">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="truncate">Map <span className="font-semibold text-foreground">{local.dirName}</span> hergebruiken?</span>
          </div>
          <button onClick={local.resume} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold bg-charcoal text-ivory">
            Toegang geven
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
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
              Kies een map op je schijf om foto's, video's en audio direct te browsen — inclusief submappen, zonder upload. Bestanden blijven lokaal.
            </p>
          </div>
        ) : (
          <>
            {hasDir && filesInDir.length > 0 && (
              <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 mb-5 w-fit">
                {FILTERS.map((t) => (
                  <button key={t.key} onClick={() => setFilter(t.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${filter === t.key ? "bg-charcoal text-ivory" : "text-foreground/60 hover:text-foreground"}`}>
                    {t.label} <span className="opacity-50 ml-1">{counts[t.key] || 0}</span>
                  </button>
                ))}
              </div>
            )}
            {dirs.length === 0 && visible.length === 0 ? (
              <p className="text-sm text-foreground/50 py-24 text-center">Deze map bevat geen media{filter !== "all" ? " voor dit filter" : ""}.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {dirs.map((d) => {
                  const p = path ? `${path}/${d}` : d;
                  return (
                    <button key={p} onClick={() => setPath(p)}
                      className="aspect-square rounded-2xl ring-1 ring-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.08] flex flex-col items-center justify-center gap-2.5 transition">
                      <Folder className="h-8 w-8 text-foreground/40" />
                      <span className="text-[12px] font-medium text-foreground/80 text-center px-3 line-clamp-2 break-all leading-tight">{d}</span>
                    </button>
                  );
                })}
                {visible.map((item) => <LocalTile key={item.id} item={item} onOpen={open} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}