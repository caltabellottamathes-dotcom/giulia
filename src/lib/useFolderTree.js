import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { onRefresh } from "@/lib/refreshBus";

/**
 * useFolderTree — map-beheer voor de FILES-bibliotheek. Mappen zijn echte
 * Folder-records (dus lege mappen bestaan), genest via parent_path.
 * Upload.folder houdt het volledige pad bij ("A/B/C"). Hernoemen en
 * verplaatsen herschrijft het pad van alle submappen én bestanden.
 */

const TAG = "media";
const parentOf = (p) => (p && p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");
const sortFolders = (a, b) => (a.path || "").localeCompare(b.path || "");

export function useFolderTree() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef([]);
  ref.current = folders;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Folder.list("path", 500);
      setFolders((list || []).sort(sortFolders));
    } catch {
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => onRefresh(load), [load]);

  /** Directe submappen van een pad. */
  const children = useCallback(
    (parentPath = "") => ref.current.filter((f) => (f.parent_path || "") === (parentPath || "")),
    []
  );

  const allPaths = useCallback(() => ref.current.map((f) => f.path), []);

  /** Registreer map-paden die alleen nog op bestanden staan (legacy), inclusief
   *  tussenliggende niveaus. Idempotent — maakt alleen ontbrekende mappen aan. */
  const ensurePaths = useCallback(async (paths) => {
    const existing = new Set(ref.current.map((f) => f.path));
    const wanted = new Set();
    (paths || []).filter(Boolean).forEach((p) => {
      if (p.startsWith("Projects/")) return;
      const parts = p.split("/");
      for (let i = 1; i <= parts.length; i++) wanted.add(parts.slice(0, i).join("/"));
    });
    const missing = [...wanted].filter((p) => !existing.has(p));
    if (!missing.length) return;
    const recs = missing.map((p) => ({
      name: p.split("/").pop(),
      path: p,
      parent_path: parentOf(p),
    }));
    try {
      const created = await base44.entities.Folder.bulkCreate(recs);
      setFolders((prev) => [...prev, ...(created || [])].sort(sortFolders));
    } catch { /* negeer */ }
  }, []);

  const createFolder = useCallback(async (name, parentPath = "") => {
    const clean = String(name || "").trim().replace(/\//g, "-").trim();
    if (!clean) return { error: "Geen naam opgegeven." };
    const path = parentPath ? `${parentPath}/${clean}` : clean;
    if (ref.current.some((f) => f.path === path)) return { error: "Er bestaat al een map met die naam." };
    try {
      const rec = await base44.entities.Folder.create({ name: clean, path, parent_path: parentPath || "" });
      setFolders((prev) => [...prev, rec].sort(sortFolders));
      return { folder: rec };
    } catch {
      return { error: "Map aanmaken mislukt." };
    }
  }, []);

  // Alle media-bestanden die in één van de gegeven paden (exact) staan.
  const uploadsUnder = async (paths) => {
    const list = await base44.entities.Upload.filter({ uploaded_for: TAG }, "-created_date", 500).catch(() => []);
    const set = new Set(paths);
    return (list || []).filter((u) => u.folder && set.has(u.folder));
  };

  /** Kern: verplaats/naam map 'path' naar 'newPath' en herschrijf submappen + bestanden. */
  const repath = useCallback(async (path, newPath) => {
    const affected = ref.current.filter((f) => f.path === path || f.path.startsWith(`${path}/`));
    const folderUpdates = affected.map((f) => {
      const np = f.path === path ? newPath : newPath + f.path.slice(path.length);
      return { id: f.id, path: np, name: f.path === path ? newPath.split("/").pop() : f.name, parent_path: parentOf(np) };
    });
    await base44.entities.Folder.bulkUpdate(folderUpdates);
    const paths = affected.map((f) => f.path);
    const ups = await uploadsUnder(paths);
    const moves = ups.map((u) => ({ id: u.id, folder: u.folder === path ? newPath : newPath + u.folder.slice(path.length) }));
    for (let i = 0; i < moves.length; i += 100) {
      await base44.entities.Upload.bulkUpdate(moves.slice(i, i + 100));
    }
    await load();
    return { newPath, files: moves.length };
  }, [load]);

  const renameFolder = useCallback(async (path, newName) => {
    const clean = String(newName || "").trim().replace(/\//g, "-").trim();
    if (!clean) return { error: "Geen naam opgegeven." };
    const newPath = path.includes("/") ? `${path.slice(0, path.lastIndexOf("/") + 1)}${clean}` : clean;
    if (newPath === path) return { newPath: path, files: 0 };
    if (ref.current.some((f) => f.path === newPath && f.path !== path)) return { error: "Die naam bestaat hier al." };
    try {
      return await repath(path, newPath);
    } catch {
      return { error: "Hernoemen mislukt." };
    }
  }, [repath]);

  const moveFolder = useCallback(async (path, destParent = "") => {
    if (destParent === path || destParent.startsWith(`${path}/`)) return { error: "Kan een map niet in zichzelf verplaatsen." };
    const name = path.split("/").pop();
    const newPath = destParent ? `${destParent}/${name}` : name;
    if (newPath === path) return { newPath: path, files: 0 };
    if (ref.current.some((f) => f.path === newPath && f.path !== path)) return { error: "Die naam bestaat daar al." };
    try {
      return await repath(path, newPath);
    } catch {
      return { error: "Verplaatsen mislukt." };
    }
  }, [repath]);

  /** Verwijder map + alle submappen + alle bestanden erin. Retourneert het aantal bestanden. */
  const deleteFolder = useCallback(async (path) => {
    const affected = ref.current.filter((f) => f.path === path || f.path.startsWith(`${path}/`));
    const ups = await uploadsUnder(affected.map((f) => f.path));
    try {
      if (ups.length) await base44.entities.Upload.deleteMany({ id: { $in: ups.map((u) => u.id) } });
      await base44.entities.Folder.deleteMany({ id: { $in: affected.map((f) => f.id) } });
    } catch {
      return { error: "Verwijderen mislukt." };
    }
    await load();
    return { files: ups.length };
  }, [load]);

  return { folders, loading, children, allPaths, ensurePaths, createFolder, renameFolder, moveFolder, deleteFolder, reload: load };
}