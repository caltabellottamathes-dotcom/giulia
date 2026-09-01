import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { X, Film, Music, FileText, Images } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/** MediaStageHorizontal — horizontaal glaspaneel (zoals MediaStage) dat
 *  rechts-onder omhoog uitschuift. Breedte gelijk aan het fotoheader-paneel
 *  op de projectpagina. Toont een horizontale mediastrip; klik een thumb
 *  om de volledige viewer te openen (useMediaViewer). */
export default function MediaStageHorizontal({ open, onClose }) {
  const { previewMedia } = useMediaViewer();
  const { items } = useMediaLibrary();

  const all = items || [];

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const pick = (it) => previewMedia({ name: it.filename, url: it.file_url, type: kindOfUpload(it) });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "102%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "102%", opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute right-0 bottom-0 z-[40] w-[62%] lg:w-[47%] h-[230px] flex flex-col rounded-t-[24px] overflow-hidden"
          style={{ background: "rgba(20,22,26,0.55)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 -24px 64px -20px rgba(0,0,0,0.55)" }}
        >
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Images className="h-4 w-4 text-ivory/70" />
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ivory/80 flex-1 truncate">Media · {all.length} bestanden</p>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 transition" aria-label="Sluiten">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden no-scrollbar">
            {all.length === 0 ? (
              <div className="h-full flex items-center justify-center text-ivory/50 text-xs px-4">Geen media in bibliotheek</div>
            ) : (
              <div className="flex gap-3 h-full p-3 items-center">
                {all.map((it) => {
                  const kind = kindOfUpload(it);
                  const isImg = kind === "image";
                  return (
                    <button key={it.id} onClick={() => pick(it)} className="relative h-full aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-white/15 hover:border-white/45 transition group">
                      {isImg ? (
                        <img src={it.file_url} alt={it.filename} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-white/10 text-ivory/75 gap-1.5">
                          {kind === "music" ? <Music className="h-5 w-5" /> : kind === "video" ? <Film className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          <span className="text-[9px] uppercase tracking-[0.16em]">{kind}</span>
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/45 text-[9px] text-ivory/90 truncate text-left">{it.filename}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}