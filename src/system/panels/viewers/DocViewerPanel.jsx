import React from "react";
import { Download, FileText } from "lucide-react";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";

export default function DocViewerPanel() {
  const { media } = useMediaViewer();
  if (!media || media.kind !== "doc") return <ViewerEmpty icon={FileText} label="document" />;
  const drive = isDriveUrl(media.url);
  const isPdf = media.type === "pdf" || /\.pdf$/i.test(media.name || media.url || "");

  if (drive || isPdf) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl overflow-hidden bg-white" style={{ minHeight: "68vh" }}>
          <iframe src={media.url} title={media.name} className="w-full" style={{ height: "74vh" }} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ivory/85 truncate">{media.name}</p>
          <a href={media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-olive hover:underline shrink-0"><Download className="h-3.5 w-3.5" /> Openen</a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 p-10 flex flex-col items-center gap-5" style={{ minHeight: "50vh" }}>
      <div className="h-16 w-16 rounded-2xl bg-ivory/8 flex items-center justify-center"><FileText className="h-8 w-8 text-ivory/55" /></div>
      <p className="text-sm text-ivory/85">{media.name}</p>
      <a href={media.url} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-4 py-2 text-xs font-semibold text-ivory hover:bg-ivory/20 transition"><Download className="h-3.5 w-3.5" /> Downloaden</a>
    </div>
  );
}