import React, { useEffect } from "react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import MusicWidget from "@/life/widgets/new/MusicWidget";
import ImageViewerPanel from "@/system/panels/viewers/ImageViewerPanel";
import VideoPlayerPanel from "@/system/panels/viewers/VideoPlayerPanel";
import DocViewerPanel from "@/system/panels/viewers/DocViewerPanel";
import { Film } from "lucide-react";

/**
 * MediaStage — transparante stage (zelfde glas als de tab-strook). Muziek opent
 * de LIFE MusicWidget (volledig gevuld); beeld/video/pdf vullen de stage op
 * eigen verhouding (geen zwarte villing) en spelen automatisch — tik opent de
 * grote MediaFullscreenWindow. Pikt pending media op bij mount (één klik) en
 * luistert naar giulia:open-media.
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

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {!media ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-ivory/70">
          <div className="h-14 w-14 rounded-2xl bg-ivory/10 border border-ivory/15 flex items-center justify-center mb-5">
            <Film className="h-6 w-6 text-ivory/70" />
          </div>
          <p className="font-display font-semibold text-xl tracking-[-0.01em]">Media</p>
          <p className="text-[13px] text-ivory/55 mt-2 max-w-[16rem] leading-relaxed">
            Klik een bestand aan om het hier te openen — beeld, video, audio of pdf.
          </p>
        </div>
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