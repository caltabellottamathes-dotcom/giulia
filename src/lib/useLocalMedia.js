import { useCallback, useEffect, useState } from "react";

/**
 * useLocalMedia — lokale mediabibliotheek via de File System Access API.
 *
 * - Kiest een map (showDirectoryPicker), somt recursief alle mediabestanden
 *   op en speelt ze af via tijdelijke blob-URL's — niets wordt geüpload.
 * - De map-handle wordt in IndexedDB bewaard, zodat na herladen alleen
 *   opnieuw toestemming hoeft te worden gegeven (geen her-kiezen).
 * - Browsers zonder FSA (Safari/Firefox) vallen terug op een
 *   <input webkitdirectory>-filepicker met dezelfde afspeel-API.
 */

const DB_NAME = "giulia_local_media";
const STORE = "handles";

const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
const VIDEO_EXT = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];
const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"];
const MEDIA_EXT = [...AUDIO_EXT, ...VIDEO_EXT, ...IMAGE_EXT];

export function kindOfName(name) {
  const e = (name || "").toLowerCase().split(".").pop();
  if (AUDIO_EXT.includes(e)) return "music";
  if (VIDEO_EXT.includes(e)) return "video";
  if (IMAGE_EXT.includes(e)) return "image";
  return "doc";
}

/* ── IndexedDB (minimaal, voor map-handles) ─────────────────────── */
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, val) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbDel(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

/* ── recursieve map-scan ───────────────────────────────────────── */
async function scanDir(handle, prefix, out, depth) {
  if (depth > 4) return;
  for await (const entry of handle.values()) {
    if (entry.kind === "file") {
      const e = (entry.name || "").toLowerCase().split(".").pop();
      if (!MEDIA_EXT.includes(e)) continue;
      out.push({ id: prefix + entry.name, name: prefix + entry.name, kind: kindOfName(entry.name), handle: entry });
    } else if (entry.kind === "directory") {
      await scanDir(entry, prefix + entry.name + "/", out, depth + 1);
    }
  }
}

export function useLocalMedia() {
  const supported = typeof window !== "undefined" && "showDirectoryPicker" in window;
  const [dirHandle, setDirHandle] = useState(null);
  const [dirName, setDirName] = useState("");
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | granted | prompt | scanning

  // bij opstart: bewaarde handle laden + toestemming controleren
  useEffect(() => {
    (async () => {
      const h = await idbGet("dir").catch(() => null);
      if (!h) return;
      setDirHandle(h);
      setDirName(h.name);
      try {
        const perm = await h.queryPermission({ mode: "read" });
        if (perm === "granted") { setStatus("granted"); enumerate(h); }
        else { setStatus("prompt"); }
      } catch { setStatus("prompt"); }
    })();
  }, []);

  const enumerate = useCallback(async (h) => {
    setScanning(true);
    setStatus("scanning");
    const out = [];
    await scanDir(h, "", out, 0);
    out.sort((a, b) => a.name.localeCompare(b.name));
    setFiles(out);
    setScanning(false);
    setStatus("granted");
  }, []);

  const pickDir = useCallback(async () => {
    if (!supported) return false;
    try {
      const h = await window.showDirectoryPicker({ mode: "read" });
      await idbSet("dir", h).catch(() => {});
      setDirHandle(h);
      setDirName(h.name);
      enumerate(h);
      return true;
    } catch {
      return false;
    }
  }, [supported, enumerate]);

  // fallback (geen FSA): verwerk FileList uit <input webkitdirectory>
  const pickFallback = useCallback((fileList) => {
    const out = [];
    for (const f of fileList) {
      const e = (f.name || "").toLowerCase().split(".").pop();
      if (!MEDIA_EXT.includes(e)) continue;
      out.push({ id: f.webkitRelativePath || f.name, name: f.webkitRelativePath || f.name, kind: kindOfName(f.name), file: f });
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    setFiles(out);
    setDirName(out[0]?.name?.split("/")[0] || "Map");
    setStatus("granted");
  }, []);

  const resume = useCallback(async () => {
    if (!dirHandle) return;
    try {
      const perm = await dirHandle.requestPermission({ mode: "read" });
      if (perm === "granted") enumerate(dirHandle);
    } catch { /* negeer */ }
  }, [dirHandle, enumerate]);

  const rescan = useCallback(() => { if (dirHandle) enumerate(dirHandle); }, [dirHandle, enumerate]);

  const forget = useCallback(async () => {
    await idbDel("dir").catch(() => {});
    setDirHandle(null);
    setDirName("");
    setFiles([]);
    setStatus("idle");
  }, []);

  // maak een afspeel-blob voor één item (caller roekt openMedia aan)
  const openFile = useCallback(async (item) => {
    const f = item.file || await item.handle.getFile();
    const url = URL.createObjectURL(f);
    return { name: item.name.split("/").pop(), url, type: item.kind };
  }, []);

  return {
    supported, dirName, dirHandle, files, scanning, status,
    pickDir, pickFallback, resume, rescan, forget, openFile,
  };
}