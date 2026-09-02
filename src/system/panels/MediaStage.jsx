import React, { useState, useEffect, useMemo, useRef } from "react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { ChevronLeft, ChevronRight, Library, ArrowLeft, Camera, MessageCircle } from "lucide-react";
import MusicWidget from "@/life/widgets/new/MusicWidget";
import ImageViewerPanel from "@/system/panels/viewers/ImageViewerPanel";
import VideoPlayerPanel from "@/system/panels/viewers/VideoPlayerPanel";
import DocViewerPanel from "@/system/panels/viewers/DocViewerPanel";
import MediaLibraryList from "@/system/components/media/MediaLibraryList";
import CameraCapture from "@/system/panels/CameraCapture";
import MattiaTab from "@/system/components/media/MattiaTab";

/** MediaStage — transparante stage met twee tabs: Bibliotheek & Camera.
 *  Luistert naar playtime:media-command (Mattia) om de camera te openen,
 *  foto/film te maken, de mediatheek te doorzoeken en bestanden te tonen. */
export default function MediaStage() {
  const { media, previewMedia, closeMedia } = useMediaViewer();
  const { items } = useMediaLibrary();
  const [tab, setTab] = useState("library");
  const [libraryFilter, setLibraryFilter] = useState(null);
  const [libraryQuery, setLibraryQuery] = useState("");
  const cameraRef = useRef(null);
  const [cameraAction, setCameraAction] = useState(null);

  useEffect(() => {
    if (window.__giuliaPendingMedia) { previewMedia(window.__giuliaPendingMedia); window.__giuliaPendingMedia = null; }
    const h = (e) => { if (e.detail) previewMedia(e.detail); };
    window.addEventListener("giulia:open-media", h);
    return () => window.removeEventListener("giulia:open-media", h);
  }, [previewMedia]);

  // Mattia media-command bus
  useEffect(() => {
    const h = (e) => {
      const cmd = e.detail; if (!cmd || !cmd.type) return;
      if (cmd.type === "camera") {
        if (cmd.action === "open") setTab("camera");
        else if (cmd.action === "close") setTab("library");
        else if (["photo", "start_film", "stop_film"].includes(cmd.action)) { setTab("camera"); setCameraAction(cmd.action); }
      } else if (cmd.type === "show_library") {
        setLibraryFilter(cmd.kind || null);
        setLibraryQuery(cmd.query || "");
        setTab("library"); closeMedia();
      } else if (cmd.type === "show_media") {
        setTab("library");
        previewMedia({ name: cmd.name || "bestand", url: cmd.url, type: cmd.kind || "image" });
      }
    };
    window.addEventListener("playtime:media-command", h);
    return () => window.removeEventListener("playtime:media-command", h);
  }, [previewMedia, closeMedia]);

  // Voer camera-acties uit zodra CameraCapture gemount is
  useEffect(() => {
    if (!cameraAction) return;
    const raf = requestAnimationFrame(() => {
      const api = cameraRef.current;
      if (!api) return;
      if (cameraAction === "photo") api.capturePhoto();
      else if (cameraAction === "start_film") api.startRecord();
      else if (cameraAction === "stop_film") api.stopRecord();
      setCameraAction(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [cameraAction]);

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

  const tabBtn = (active) => `flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition ${active ? "bg-white/25 text-ivory" : "text-ivory/65 hover:text-ivory"}`;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-1 rounded-full bg-white/8 p-0.5 border border-white/12">
          <button onClick={() => { setTab("camera"); closeMedia(); }} className={tabBtn(tab === "camera")}><Camera className="h-3.5 w-3.5" /> Camera</button>
          <button onClick={() => setTab("library")} className={tabBtn(tab === "library")}><Library className="h-3.5 w-3.5" /> Bibliotheek</button>
          <button onClick={() => { setTab("mattia"); closeMedia(); }} className={tabBtn(tab === "mattia")}><MessageCircle className="h-3.5 w-3.5" /> Mattia</button>
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-1.5 justify-center">
          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ivory/75 truncate">
            {tab === "camera" ? "Camera · foto & film" : tab === "mattia" ? "Mattia · spiegel" : media ? (media.name || "bestand") : `${all.length} bestanden in bibliotheek`}
          </p>
        </div>
        {tab === "library" && media && (
          <button onClick={closeMedia} className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 transition" aria-label="Terug naar bibliotheek" title="Terug naar bibliotheek">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        {tab === "library" && (
          <>
            <button onClick={() => go(-1)} disabled={!all.length} className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 disabled:opacity-30 transition" aria-label="Vorige" title="Vorige bestand">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => go(1)} disabled={!all.length} className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 disabled:opacity-30 transition" aria-label="Volgende" title="Volgende bestand">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "mattia" ? (
          <MattiaTab />
        ) : tab === "camera" ? (
          <CameraCapture ref={cameraRef} onClose={() => setTab("library")} />
        ) : !media ? (
          <MediaLibraryList onPick={pick} filter={libraryFilter} query={libraryQuery} />
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