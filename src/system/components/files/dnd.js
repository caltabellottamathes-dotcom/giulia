/** Gedeelde HTML5 drag & drop types voor de FILES-verkenner. */
export const DRAG_FILES = "application/x-giulia-files";
export const DRAG_FOLDER = "application/x-giulia-folder";

/** Lees uit een drop-event welke bestand-ID's (of map) gesleept werd. */
export function readDrag(e) {
  try {
    if (e.dataTransfer.types.includes(DRAG_FILES)) {
      const ids = JSON.parse(e.dataTransfer.getData(DRAG_FILES) || "[]");
      if (Array.isArray(ids) && ids.length) return { type: "files", ids };
    }
    if (e.dataTransfer.types.includes(DRAG_FOLDER)) {
      const path = e.dataTransfer.getData(DRAG_FOLDER);
      if (path) return { type: "folder", path };
    }
  } catch { /* negeer */ }
  return null;
}

/** Is dit een interne sleep (bestanden/map) — geen OS-bestanden? */
export function isInternalDrag(e) {
  return e.dataTransfer.types.includes(DRAG_FILES) || e.dataTransfer.types.includes(DRAG_FOLDER);
}