import React, { createContext, useContext, useState, useCallback } from "react";
import { usePanel } from "@/lib/PanelContext";

/**
 * MediaViewerContext — houdt het momenteel aangeklikte bestand bij en opent
 * het bijbehorende viewer-panel (afbeelding / video / muziek / document).
 * De widgets (kleine viewers) en panels (grote viewers) lezen hieruit.
 */
const MediaViewerContext = createContext(null);

const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
const VIDEO_EXT = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];
const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"];

export function kindOfFile(file) {
  const name = (file?.name || "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop() : "";
  if (AUDIO_EXT.includes(ext)) return "music";
  if (VIDEO_EXT.includes(ext)) return "video";
  if (IMAGE_EXT.includes(ext)) return "image";
  const t = (file?.type || "").toLowerCase();
  if (t === "image") return "image";
  if (t === "video") return "video";
  if (t === "audio") return "music";
  return "doc";
}

export function isDriveUrl(url) {
  if (!url) return false;
  return /drive\.google\.com|googleusercontent\.com/.test(url);
}

const MODULE_FOR_KIND = { image: "imageviewer", video: "videoplayer", music: "musicplayer", doc: "docviewer" };

export function MediaViewerProvider({ children }) {
  const { openModule } = usePanel();
  const [media, setMedia] = useState(null);

  const openMedia = useCallback((file) => {
    if (!file) return;
    const kind = kindOfFile(file);
    setMedia({ name: file.name, url: file.url, type: file.type, kind });
    openModule(MODULE_FOR_KIND[kind]);
  }, [openModule]);

  const closeMedia = useCallback(() => setMedia(null), []);

  return (
    <MediaViewerContext.Provider value={{ media, openMedia, closeMedia }}>
      {children}
    </MediaViewerContext.Provider>
  );
}

export function useMediaViewer() {
  const ctx = useContext(MediaViewerContext);
  if (!ctx) throw new Error("useMediaViewer must be used within MediaViewerProvider");
  return ctx;
}