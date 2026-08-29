import React, { useEffect, useMemo } from "react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { ChevronLeft, ChevronRight, Library, ArrowLeft } from "lucide-react";
import MusicWidget from "@/life/widgets/new/MusicWidget";
import ImageViewerPanel from "@/system/panels/viewers/ImageViewerPanel";
import VideoPlayerPanel from "@/system/panels/viewers/VideoPlayerPanel";
import DocViewerPanel from "@/system/panels/viewers/DocViewerPanel";
import MediaLibraryList from "@/system/components/media/MediaLibraryList";

/** MediaStage — transparante stage. Bovenaast een knoppenbalk om te bladeren:
 *  ← terug naar de bibliotheek-lijst, ◀ ▶ vorige/volgende bestand. Zonder
 *  geselecteerd bestand: de mediatheek-lijst. Pikt pending media op bij mount
 *  en luistert naar giulia:open-media. */
export default function MediaStage() {
  const { media, previewMedia, closeMedia } = useMediaViewer();
  const { items } = useMediaLibrary();

  useEffect(() => {
    if (window.__giuliaPendingMedia) {
      previewMedia(window.__giuliaPendingMedia);
      window.__giuliaPendingMedia = null;
    }
    const h = (e) => { if (e.detail) previewMedia(e.detail); };
    window.addEventListener("giulia:open-media", h);
    return () => window.removeEventListener("giulia:open-media", h);
  }, [previewMedia]);

  const all = items || [];
  const curIdx = useMemo(() => (media ? all.findIndex((i) => i.file_url === media.url) : -1), [media, all]);

  const go = (dir) => {
    if (!all.length) return;
    const base = curIdx >= 0 ? curIdx : dir > 0 ? -1 : all.length;
    const ni = (base + dir + all.length) % all.length;
    const it = all[ni];
    previewMedia({ name: it.filename, url: it.file_url, type: kindOfUpload(it) });
  };

  const pick = (file) => previewMedia(file);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* BOVEN — bibliotheek-navigatie (knoppenbalk) */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-white/[0.03]">
        {media ? (
          <button onClick={closeMedia} className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 transition" aria-label="Terug naar bibliotheek" title="Terug naar bibliotheek">
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <div className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/70" aria-hidden>
            <Library className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 justify-center">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ivory/75 truncate">
            {media ? (media.name || "bestand") : `${all.length} bestanden in bibliotheek`}
          </p>
        </div>
        <button onClick={() => go(-1)} disabled={!all.length} className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 disabled:opacity-30 transition" aria-label="Vorige" title="Vorige bestand">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => go(1)} disabled={!all.length} className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 disabled:opacity-30 transition" aria-label="Volgende" title="Volgende bestand">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {!media ? (
          <MediaLibraryList onPick={pick} />
        ) : media.kind === "music" ? (
          <div className="h-full p-3"><MusicWidget fill /></div>
        ) : media.kind === "image" ? (
          <ImageViewerPanel />
        ) : media.kind === "video" ? (
          <VideoPlayerPanel />
        ) : (
          <DocViewerPanel />
        )}
      </div>
    </div>
  );
}