import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";
const BLUE = "#b1bfc7";
const RED = "#b03a2e";

/** PlaytimeCategoryBrowser — de categorieën + galerijen van de gescrapte
 *  Playtime-collectie. Klik een categorie → alle foto's met url zien en per
 *  foto verwijderen; een hele categorie of galerij in één keer wissen. */
export default function PlaytimeCategoryBrowser({ images, loading, onRefresh }) {
  const [selCat, setSelCat] = useState(null);
  const [busy, setBusy] = useState(false);

  const byCat = useMemo(() => {
    const m = new Map();
    for (const it of images || []) {
      const c = it.category || "onbekend";
      if (!m.has(c)) m.set(c, []);
      m.get(c).push(it);
    }
    return new Map([...m.entries()].sort((a, b) => b[1].length - a[1].length));
  }, [images]);

  const byGallery = useMemo(() => {
    const m = new Map();
    for (const it of images || []) {
      const g = it.gallery_url || "";
      if (!g) continue;
      if (!m.has(g)) m.set(g, { category: it.category, items: [] });
      m.get(g).items.push(it);
    }
    return m;
  }, [images]);

  const wipe = async (fn) => {
    if (busy) return;
    setBusy(true);
    await fn().catch(() => {});
    await onRefresh();
    setBusy(false);
  };
  const delPhoto = (id) => wipe(() => base44.entities.PlaytimeImages.delete(id));
  const delCategory = (cat) => {
    if (selCat === cat) setSelCat(null);
    return wipe(() => base44.entities.PlaytimeImages.deleteMany({ category: cat }));
  };
  const delGallery = (g) => wipe(() => base44.entities.PlaytimeImages.deleteMany({ gallery_url: g }));

  if (loading) return <p className="font-body text-[12px] italic" style={{ color: INK }}>Laden…</p>;

  // ── Categorie open → alle foto's zien en per foto verwijderen ──
  if (selCat) {
    const items = byCat.get(selCat) || [];
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setSelCat(null)} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>‹ Alle categorieën</button>
          <span className="font-mono text-[11px]" style={{ color: INK }}>{items.length} foto's</span>
        </div>
        <p className="font-display font-bold lowercase tracking-[-0.02em] mt-2 mb-3" style={{ color: BLACK, fontSize: "22px" }}>{selCat}</p>
        <div className="flex justify-between items-center gap-3 border-b pb-2" style={{ borderColor: GREY }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: BLUE }}>Klik = origineel · × = verwijderen</span>
          <button onClick={() => delCategory(selCat)} disabled={busy} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30" style={{ color: RED }}>Verwijder categorie</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {items.map((it) => (
            <div key={it.id} className="relative rounded-md overflow-hidden border" style={{ borderColor: GREY }}>
              <a href={it.image_url} target="_blank" rel="noreferrer" className="block" title={it.image_url}>
                <Image src={it.image_url} fittingType="fill" alt={it.category} className="w-full h-24" />
              </a>
              <button onClick={() => delPhoto(it.id)} disabled={busy} title="Verwijder deze foto"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[11px] leading-none flex items-center justify-center hover:bg-black/90 transition">×</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!byCat.size) {
    return <p className="font-body text-[12px] leading-[1.5]" style={{ color: INK }}>Nog geen foto's opgeslagen. Scrap je eerste galerij links.</p>;
  }

  // ── Overzicht: categorieën (klikbaar) + galerijen ──
  return (
    <div>
      {[...byCat.entries()].map(([cat, items]) => (
        <div key={cat} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: GREY }}>
          <button onClick={() => setSelCat(cat)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <span className="w-10 h-10 shrink-0 rounded-md overflow-hidden border" style={{ borderColor: GREY }}>
              <Image src={items[0].image_url} fittingType="fill" alt={cat} className="w-10 h-10" />
            </span>
            <span className="font-body text-[13px] lowercase" style={{ color: BLACK }}>{cat}</span>
          </button>
          <span className="font-mono text-[11px]" style={{ color: INK }}>{items.length}</span>
          <button onClick={() => delCategory(cat)} disabled={busy} title="Verwijder alle foto's in deze categorie"
            className="text-[13px] leading-none hover:opacity-60 transition disabled:opacity-30" style={{ color: INK }}>×</button>
        </div>
      ))}

      <h3 className="font-mono text-[10px] tracking-[0.18em] uppercase mt-6" style={{ color: BLUE }}>Galerijen</h3>
      {[...byGallery.entries()].map(([g, info]) => (
        <div key={g} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: GREY }}>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[12px] truncate" style={{ color: BLACK }} title={g}>{g}</p>
            <p className="font-mono text-[10px] lowercase" style={{ color: INK }}>{info.category} · {info.items.length} foto's</p>
          </div>
          <button onClick={() => delGallery(g)} disabled={busy} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30" style={{ color: RED }}>Verwijder</button>
        </div>
      ))}
    </div>
  );
}