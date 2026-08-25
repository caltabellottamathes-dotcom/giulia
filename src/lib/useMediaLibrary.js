import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { kindOfFile } from "@/lib/MediaViewerContext";

/**
 * useMediaLibrary — beheert geüploade media (foto / video / audio) in de
 * bestaande Upload-entity. Items worden getagd met `uploaded_for: "media"`
 * zodat ze gescheiden blijven van andere uploads. Het type wordt afgeleid
 * uit de bestandsnaam via kindOfFile en in `note` opgeslagen.
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
      const list = await base44.entities.Upload.filter({ uploaded_for: TAG }, "-created_date", 200);
      setItems(list || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = useCallback(async (file) => {
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

  return { items, loading, uploading, upload, remove, reload: load };
}