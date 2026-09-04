import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { kindOfFile } from "@/lib/MediaViewerContext";
import { onRefresh } from "@/lib/refreshBus";

/**
 * useMediaLibrary — beheert geüploade media (foto / video / audio / pdf) in de
 * Upload-entity. Items worden getagd met `uploaded_for: "media"` en optioneel
 * een `folder` en `project_id`. Het type wordt afgeleid via kindOfFile en in
 * `note` opgeslagen. Bestanden gekoppeld aan een project krijgen folder
 * "Projects/<projectId>" zodat ze in de FILES-bibliotheek onder het project
 * verschijnen én op de projectpagina.
 */
const TAG = "media";

export function kindOfUpload(item) {
  if (item?.note && ["image", "video", "music", "doc"].includes(item.note)) return item.note;
  return kindOfFile({ name: item?.filename, url: item?.file_url });
}

export function useMediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Upload.filter({ uploaded_for: TAG }, "-created_date", 500);
      setItems(list || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => onRefresh(load), [load]);

  const upload = useCallback(async (file, folder, project_id) => {
    if (!file) return null;
    setUploading((n) => n + 1);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const kind = kindOfFile({ name: file.name, type: file.type });
      const rec = await base44.entities.Upload.create({
        file_url,
        filename: file.name,
        uploaded_for: TAG,
        document_type: kind === "image" ? "image" : "other",
        note: kind,
        status: "new",
        folder: folder || "",
        ...(project_id ? { project_id } : {}),
      });
      setItems((a) => [rec, ...(a || [])]);
      return rec;
    } catch {
      return null;
    } finally {
      setUploading((n) => Math.max(0, n - 1));
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await base44.entities.Upload.delete(id);
      setItems((a) => (a || []).filter((x) => x.id !== id));
    } catch { /* negeer */ }
  }, []);

  const removeMany = useCallback(async (ids) => {
    if (!ids || !ids.length) return;
    try {
      await base44.entities.Upload.deleteMany({ id: { $in: ids } });
      setItems((a) => (a || []).filter((x) => !ids.includes(x.id)));
    } catch { /* negeer */ }
  }, []);

  const rename = useCallback(async (id, filename) => {
    try {
      const rec = await base44.entities.Upload.update(id, { filename });
      setItems((a) => (a || []).map((x) => (x.id === id ? { ...x, ...rec } : x)));
    } catch { /* negeer */ }
  }, []);

  const setFolder = useCallback(async (id, folder) => {
    try {
      const rec = await base44.entities.Upload.update(id, { folder: folder || "" });
      setItems((a) => (a || []).map((x) => (x.id === id ? { ...x, ...rec } : x)));
    } catch { /* negeer */ }
  }, []);

  /** Verplaats meerdere bestanden in één keer naar een map. */
  const moveMany = useCallback(async (ids, folder) => {
    if (!ids || !ids.length) return;
    try {
      for (let i = 0; i < ids.length; i += 100) {
        await base44.entities.Upload.bulkUpdate(ids.slice(i, i + 100).map((id) => ({ id, folder: folder || "" })));
      }
      setItems((a) => (a || []).map((x) => (ids.includes(x.id) ? { ...x, folder: folder || "" } : x)));
    } catch { /* negeer */ }
  }, []);

  /** Verplaats een bestand naar een project-map: zet zowel project_id als folder. */
  const setProjectFile = useCallback(async (id, projectId, folder) => {
    try {
      const rec = await base44.entities.Upload.update(id, { project_id: projectId, folder: folder || "" });
      setItems((a) => (a || []).map((x) => (x.id === id ? { ...x, ...rec } : x)));
    } catch { /* negeer */ }
  }, []);

  return { items, loading, uploading, upload, remove, removeMany, rename, setFolder, moveMany, setProjectFile, reload: load };
}