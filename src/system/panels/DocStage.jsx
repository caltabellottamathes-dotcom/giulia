import React from "react";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import DocViewerPanel from "@/system/panels/viewers/DocViewerPanel";
import MediaLibraryList from "@/system/components/media/MediaLibraryList";

/**
 * DocStage — document-view in het multi-functionele paneel. Zonder
 * geselecteerd document toont de stage de documenten-lijst (transparant,
 * glas van het paneel eronder zichtbaar). Bij een geselecteerde pdf opent
 * de DocViewerPanel (eigen pdf.js viewer).
 */
export default function DocStage() {
  const { media, previewMedia } = useMediaViewer();

  if (media && media.kind === "doc") {
    return <div className="h-full w-full"><DocViewerPanel /></div>;
  }

  return (
    <MediaLibraryList
      filter="doc"
      onPick={(f) => previewMedia(f)}
      emptyHint="Nog geen documenten. Upload een pdf via de Media-pagina."
    />
  );
}