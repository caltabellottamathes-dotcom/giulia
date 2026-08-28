import React, { useEffect } from "react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import MusicWidget from "@/life/widgets/new/MusicWidget";
import ImageViewerPanel from "@/system/panels/viewers/ImageViewerPanel";
import VideoPlayerPanel from "@/system/panels/viewers/VideoPlayerPanel";
import DocViewerPanel from "@/system/panels/viewers/DocViewerPanel";
import MediaLibraryList from "@/system/components/media/MediaLibraryList";

/**
 * MediaStage — transparante stage (geen eigen achtergrond; het glas van het
 * paneel eronder blijft zichtbaar). Zonder geselecteerd bestand toont de
 * stage de mediatheek-lijst; muziek opent de LIFE MusicWidget (volledig
 * gevuld); beeld/video/pdf vullen de stage op eigen verhouding en spelen
 * automatisch — tik opent de grote MediaFullscreenWindow. Pikt pending media
 * op bij mount (één klik) en luistert naar giulia:open-media.
 */
export default function MediaStage() {
  const { media, previewMedia } = useMediaViewer();

  useEffect(() => {
    if (window.__giuliaPendingMedia) {
      previewMedia(window.__giuliaPendingMedia);
      window.__giuliaPendingMedia = null;
    }
    const h = (e) => { if (e.detail) previewMedia(e.detail); };
    window.addEventListener("giulia:open-media", h);
    return () => window.removeEventListener("giulia:open-media", h);
  }, [previewMedia]);

  const pick = (file) => previewMedia(file);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {!media ? (
        <MediaLibraryList onPick={pick} />
      ) : media.kind === "music" ? (
        <div className="flex-1 min-h-0 p-3">
          <MusicWidget fill />
        </div>
      ) : media.kind === "image" ? (
        <ImageViewerPanel />
      ) : media.kind === "video" ? (
        <VideoPlayerPanel />
      ) : (
        <DocViewerPanel />
      )}
    </div>
  );
}