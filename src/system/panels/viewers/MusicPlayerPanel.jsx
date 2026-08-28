import React from "react";
import { Music, Download } from "lucide-react";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

const GLASS = { background: "rgba(20,22,26,0.45)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.12)" };

export default function MusicPlayerPanel() {
  const { media } = useMediaViewer();
  if (!media || media.kind !== "music") return <ViewerEmpty icon={Music} label="muziek" />;
  const drive = isDriveUrl(media.url);
  if (drive) {
    return (
      <div className="h-full w-full flex flex-col gap-3 p-4">
        <div className="rounded-2xl overflow-hidden bg-black/40 flex-1 min-h-0">
          <iframe src={media.url} title={media.name} className="w-full h-full" allow="autoplay" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={GLASS}>
          <p className="text-sm text-ivory/95 truncate">{media.name}</p>
          <a href={media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-ivory/85 hover:text-ivory underline shrink-0"><Download className="h-3.5 w-3.5" /> Openen</a>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl px-6 py-8 w-full max-w-md" style={GLASS}>
        <div className="h-32 w-32 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center">
          <Music className="h-14 w-14 text-ivory/85" />
        </div>
        <p className="text-base text-ivory/95 truncate max-w-full">{media.name}</p>
        <audio src={media.url} controls autoPlay className="w-full" />
        <a href={media.url} download target="_blank" rel="noreferrer" className="text-[11px] text-ivory/85 hover:text-ivory underline">Downloaden</a>
      </div>
    </div>
  );
}