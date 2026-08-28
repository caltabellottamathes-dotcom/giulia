import React from "react";
import { Maximize2, Download, FileText } from "lucide-react";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import { usePanel } from "@/lib/PanelContext";
import ViewerEmpty from "@/system/panels/viewers/ViewerEmpty";
import PdfViewer from "@/system/panels/viewers/PdfViewer";

/** DocViewerPanel — pdf opent in de OS-eigen PdfViewer (canvas op glas, eigen
 *  besturing). Drive-embeds en non-pdf vallen terug op een ingebed iframe. */
export default function DocViewerPanel() {
  const { media } = useMediaViewer();
  const { openMediaFullscreen } = usePanel();
  if (!media || media.kind !== "doc") return <ViewerEmpty icon={FileText} label="document" />;
  const drive = isDriveUrl(media.url);
  const isPdf = media.type === "pdf" || /\.pdf$/i.test(media.name || media.url || "");

  if (isPdf && !drive) {
    return (
      <div className="relative w-full h-full p-3 sm:p-4">
        <PdfViewer url={media.url} />
        <button onClick={openMediaFullscreen} className="absolute top-5 right-5 z-30 h-9 w-9 rounded-full bg-black/25 border border-white/15 backdrop-blur-md flex items-center justify-center text-ivory/90 hover:text-white hover:bg-black/40 transition" aria-label="Vergroten"><Maximize2 className="h-4 w-4" /></button>
      </div>
    );
  }

  if (drive || isPdf) {
    return (
      <div className="relative w-full h-full p-4 sm:p-6">
        <div className="relative h-full w-full rounded-2xl bg-white overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)]">
          <iframe src={media.url} title={media.name} className="w-full h-full" />
        </div>
        <button onClick={openMediaFullscreen} className="absolute top-7 right-7 z-10 h-9 w-9 rounded-full bg-black/30 border border-white/15 backdrop-blur-md flex items-center justify-center text-ivory/90 hover:text-white hover:bg-black/45 transition" aria-label="Vergroten"><Maximize2 className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center gap-4 rounded-2xl px-6 py-8 max-w-xs" style={{ background: "rgba(20,22,26,0.45)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center"><FileText className="h-8 w-8 text-ivory/85" /></div>
        <p className="text-sm text-ivory/95 truncate max-w-full">{media.name}</p>
        <div className="flex items-center gap-4">
          <a href={media.url} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-ivory/90 hover:text-ivory underline"><Download className="h-3.5 w-3.5" /> Downloaden</a>
          <button onClick={openMediaFullscreen} className="inline-flex items-center gap-1.5 text-[12px] text-ivory/90 hover:text-ivory underline"><Maximize2 className="h-3.5 w-3.5" /> Vergroten</button>
        </div>
      </div>
    </div>
  );
}