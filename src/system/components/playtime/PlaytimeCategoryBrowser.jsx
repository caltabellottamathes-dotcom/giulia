import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import PlaytimePhotoViewer from "@/system/components/playtime/PlaytimePhotoViewer";
import { proxiedMedia } from "@/lib/mediaProxy";

const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";
const BLUE = "#b1bfc7";
const RED = "#b03a2e";

const VID_EXTS = ["mp4", "mov", "webm", "m4v", "mkv"];
const isVideoUrl = (u) => VID_EXTS.includes(String(u || "").split(".").pop().split("?")[0].toLowerCase());
// kind-veld is leidend (reddit/twitter-video's hebben niet altijd een extensie)
const isVideoItem = (it) => it?.kind === "video" || isVideoUrl(it?.image_url);

/** PlaytimeCategoryBrowser — categorieën (incl. subcategorieën via
 *  'parent/sub') en galerijen van de Playtime-collectie. Klik een categorie →
 *  foto's zien en verwijderen. Sleep foto's naar een subcategorie-chip om ze
 *  gerichter te groeperen; maak zelf nieuwe subcategorieën aan; wis
 *  (sub)categorieën of hele galerijen. Mattia ziet alle categorieën dynamisch. */
export default function PlaytimeCategoryBrowser({ images, categories, loading, onRefresh }) {
  const [selCat, setSelCat] = useState(null);
  const [busy, setBusy] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [dragId, setDragId] = useState(null);
  const [viewIdx, setViewIdx] = useState(null);

  // Alle bekende categorie-paden: uit foto's én expliciete categorie-records
  const allCats = useMemo(() => {
    const set = new Set();
    for (const it of images || []) {
      const c = String(it.category || "").toLowerCase();
      if (c) set.add(c);
    }
    for (const rec of categories || []) {
      const n = String(rec.name || "").toLowerCase();
      if (n) set.add(n);
    }
    return [...set];
  }, [images, categories]);

  const parentOf = (c) => (c.includes("/") ? c.split("/").slice(0, -1).join("/") : null);
  const childrenOf = (path) => allCats.filter((c) => c.startsWith(path + "/") && !c.slice(path.length + 1).includes("/")).sort();
  const descendantsOf = (path) => allCats.filter((c) => c === path || c.startsWith(path + "/"));
  const countIn = (path) =>
    (images || []).filter((it) => {
      const c = String(it.category || "").toLowerCase();
      return c === path || c.startsWith(path + "/");
    }).length;
  const directItemsOf = (path) => (images || []).filter((it) => String(it.category || "").toLowerCase() === path);

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

  // Categorie + alle subcategorieën wissen (foto's én categorie-records)
  const delCategory = (path) => {
    if (selCat && (selCat === path || selCat.startsWith(path + "/"))) setSelCat(null);
    return wipe(async () => {
      for (const p of descendantsOf(path)) {
        await base44.entities.PlaytimeImages.deleteMany({ category: p }).catch(() => {});
        await base44.entities.PlaytimeCategory.deleteMany({ name: p }).catch(() => {});
      }
    });
  };

  // Foto verplaatsen naar een (sub)categorie — sleep-drop
  const movePhoto = async (id, targetCat) => {
    if (!id || busy) return;
    setBusy(true);
    await base44.entities.PlaytimeImages.update(id, { category: targetCat }).catch(() => {});
    await onRefresh();
    setBusy(false);
  };

  // Nieuwe (lege) subcategorie aanmaken onder de open categorie
  const addSub = async () => {
    const raw = newSub.trim().toLowerCase();
    if (!raw || busy) return;
    const name = raw.replace(/[^a-z0-9/-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!name) { setNewSub(""); return; }
    setBusy(true);
    await base44.entities.PlaytimeCategory.create({ name: `${selCat}/${name}`, parent: selCat }).catch(() => {});
    setNewSub("");
    await onRefresh();
    setBusy(false);
  };

  // Subcategorie verwijderen: foto's gaan terug naar de hoofdcategorie
  const delSub = (subPath) => {
    const parent = parentOf(subPath);
    if (!parent) return;
    return wipe(async () => {
      await base44.entities.PlaytimeImages.updateMany({ category: subPath }, { $set: { category: parent } }).catch(() => {});
      await base44.entities.PlaytimeCategory.deleteMany({ name: subPath }).catch(() => {});
    });
  };

  // Hele categorie (incl. subcategorieën en foto's) ónder een andere categorie hangen
  const nestCat = async (path, parent) => {
    const seg = path.split("/");
    const newPath = parent ? `${parent}/${seg[seg.length - 1]}` : seg[seg.length - 1];
    if (busy || newPath === path) return;
    setBusy(true);
    const cat = (it) => String(it.category || "").toLowerCase();
    const imgMoves = (images || [])
      .filter((it) => cat(it) === path || cat(it).startsWith(path + "/"))
      .map((it) => ({ id: it.id, category: newPath + cat(it).slice(path.length) }));
    if (imgMoves.length) await base44.entities.PlaytimeImages.bulkUpdate(imgMoves).catch(() => {});
    const catMoves = (categories || [])
      .filter((rec) => { const n = String(rec.name || "").toLowerCase(); return n === path || n.startsWith(path + "/"); })
      .map((rec) => {
        const nn = newPath + String(rec.name || "").toLowerCase().slice(path.length);
        return { id: rec.id, name: nn, parent: nn.includes("/") ? nn.split("/").slice(0, -1).join("/") : "" };
      });
    if (catMoves.length) await base44.entities.PlaytimeCategory.bulkUpdate(catMoves).catch(() => {});
    setSelCat(newPath);
    await onRefresh();
    setBusy(false);
  };

  // Categorie (incl. subcategorieën en foto's) samenvoegen met een andere categorie
  const mergeCat = async (path, target) => {
    if (busy || !target || target === path || target.startsWith(path + "/")) return;
    setBusy(true);
    const cat = (it) => String(it.category || "").toLowerCase();
    const imgMoves = (images || [])
      .filter((it) => cat(it) === path || cat(it).startsWith(path + "/"))
      .map((it) => ({ id: it.id, category: target + cat(it).slice(path.length) }));
    if (imgMoves.length) await base44.entities.PlaytimeImages.bulkUpdate(imgMoves).catch(() => {});
    for (const p of descendantsOf(path)) {
      await base44.entities.PlaytimeCategory.deleteMany({ name: p }).catch(() => {});
    }
    setSelCat(target);
    await onRefresh();
    setBusy(false);
  };

  const dropOn = (cat) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragId && cat) movePhoto(dragId, cat);
    setDragId(null);
  };

  if (loading) return <p className="font-body text-[12px] italic" style={{ color: INK }}>Laden…</p>;

  // ── Categorie open → foto's zien, slepen, subcategorieën beheren ──
  if (selCat) {
    const items = directItemsOf(selCat);
    const subs = childrenOf(selCat);
    const parent = parentOf(selCat);

    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setSelCat(parent || null)} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>‹ {parent || "Alle categorieën"}</button>
          <span className="font-mono text-[11px]" style={{ color: INK }}>{items.length} hier · {countIn(selCat)} totaal</span>
        </div>
        <p className="font-display font-bold lowercase tracking-[-0.02em] mt-2 mb-3" style={{ color: BLACK, fontSize: "22px" }}>{selCat}</p>

        {dragId && <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: BLUE }}>Laat de foto vallen op een categorie-chip…</p>}

        <div className="flex flex-wrap gap-2 mb-3">
          {parent && (
            <button onClick={() => setSelCat(parent)} onDragOver={(e) => e.preventDefault()} onDrop={dropOn(parent)}
              title={`Sleep foto's hierheen om ze naar '${parent}' te verplaatsen`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-[11px] lowercase transition hover:opacity-70 ${dragId ? "border-dashed" : ""}`}
              style={{ borderColor: GREY, color: BLACK }}>
              ↖ {parent.split("/").pop()} <span style={{ color: INK }}>{countIn(parent)}</span>
            </button>
          )}
          {subs.map((s) => (
            <span key={s} className="inline-flex items-center gap-1">
              <button onClick={() => setSelCat(s)} onDragOver={(e) => e.preventDefault()} onDrop={dropOn(s)}
                title={`Sleep foto's hierheen om ze naar '${s}' te verplaatsen`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-[11px] lowercase transition hover:opacity-70 ${dragId ? "border-dashed" : ""}`}
                style={{ borderColor: GREY, color: BLACK }}>
                {s.split("/").pop()} <span style={{ color: INK }}>{countIn(s)}</span>
              </button>
              <button onClick={() => delSub(s)} disabled={busy} title="Verwijder subcategorie — foto's gaan naar de hoofdcategorie"
                className="text-[11px] leading-none hover:opacity-60 transition disabled:opacity-30" style={{ color: INK }}>×</button>
            </span>
          ))}
        </div>

        <div className="flex items-end gap-2 border-b pb-3" style={{ borderColor: GREY }}>
          <div className="flex-1">
            <label className="block font-mono text-[9px] uppercase tracking-[0.18em] mb-1" style={{ color: INK }}>Nieuwe subcategorie onder {selCat}</label>
            <input value={newSub} onChange={(e) => setNewSub(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSub()} disabled={busy}
              placeholder={`bv. blond → '${selCat}/blond'`}
              className="w-full bg-transparent border-b font-body text-[12px] text-black placeholder:text-black/35 focus:outline-none" style={{ borderColor: GREY }} />
          </div>
          <button onClick={addSub} disabled={busy || !newSub.trim()} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30 pb-1" style={{ color: BLACK }}>Aanmaken</button>
        </div>

        <div className="flex flex-wrap items-end gap-6 border-b pb-3 mt-3" style={{ borderColor: GREY }}>
          {(() => {
            const targets = allCats.filter((c) => c !== selCat && !c.startsWith(selCat + "/"));
            const selCls = "bg-transparent border-b font-body text-[12px] text-black focus:outline-none max-w-full";
            return targets.length > 0 || parent ? (
              <>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] mb-1" style={{ color: INK }}>Categorie onder een andere hangen</label>
                  <select value="" disabled={busy} onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) nestCat(selCat, v === "__hoofd__" ? "" : v); }} className={selCls} style={{ borderColor: GREY }}>
                    <option value="">— kies bovenliggende categorie —</option>
                    {targets.map((c) => <option key={c} value={c}>{c}</option>)}
                    {parent && <option value="__hoofd__">— naar hoofdniveau —</option>}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] mb-1" style={{ color: INK }}>Samenvoegen met categorie</label>
                  <select value="" disabled={busy} onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) mergeCat(selCat, v); }} className={selCls} style={{ borderColor: GREY }}>
                    <option value="">— kies doelcategorie —</option>
                    {targets.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            ) : null;
          })()}
        </div>

        <div className="flex justify-between items-center gap-3 border-b pb-2 mt-2" style={{ borderColor: GREY }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: BLUE }}>Klik = groot bekijken · ← → = bladeren · × = verwijderen · slepen = verplaatsen</span>
          <button onClick={() => delCategory(selCat)} disabled={busy} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30" style={{ color: RED }}>
            {parent ? "Wis alles (incl. foto's)" : "Verwijder categorie + subs"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {items.map((it, i) => (
            <div key={it.id} draggable onDragStart={() => setDragId(it.id)} onDragEnd={() => setDragId(null)}
              className="relative rounded-md overflow-hidden border cursor-grab active:cursor-grabbing" style={{ borderColor: GREY }}>
              {isVideoItem(it) ? (
                <video src={proxiedMedia(it.image_url) + "#t=0.1"} muted loop playsInline preload="metadata" onClick={() => setViewIdx(i)}
                  title="Klik om groot te bekijken" className="w-full h-44 object-cover cursor-pointer bg-black" />
              ) : (
                <button type="button" onClick={() => setViewIdx(i)} title="Klik om groot te bekijken" className="block w-full">
                  <Image src={it.image_url} fittingType="fill" alt={it.category} className="w-full h-44" />
                </button>
              )}
              <button onClick={() => delPhoto(it.id)} disabled={busy} title="Verwijder deze media"
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white text-[12px] leading-none flex items-center justify-center hover:bg-black/90 transition">×</button>
            </div>
          ))}
          {!items.length && (
            <p className="col-span-2 md:col-span-3 font-body text-[12px] italic" style={{ color: INK }}>
              Geen foto's direct in {selCat}{subs.length ? " — sleep ze naar een subcategorie-chip hierboven" : ""}.
            </p>
          )}
        </div>

        {viewIdx != null && items.length > 0 && (
          <PlaytimePhotoViewer
            items={items}
            index={Math.min(viewIdx, items.length - 1)}
            onIndex={setViewIdx}
            onClose={() => setViewIdx(null)}
            onDelete={(id) => delPhoto(id)}
            busy={busy}
          />
        )}
      </div>
    );
  }

  if (!allCats.length) {
    return <p className="font-body text-[12px] leading-[1.5]" style={{ color: INK }}>Nog geen foto's opgeslagen. Scrap je eerste galerij links.</p>;
  }

  // ── Overzicht: hoofdcategorieën + subcategorie-chips + galerijen ──
  const parents = [...new Set(allCats.map((c) => c.split("/")[0]))].sort();

  return (
    <div>
      {parents.map((p) => {
        const inTree = (images || []).filter((it) => {
          const c = String(it.category || "").toLowerCase();
          return c === p || c.startsWith(p + "/");
        });
        return (
          <div key={p} className="py-2 border-b" style={{ borderColor: GREY }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSelCat(p)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <span className="w-10 h-10 shrink-0 rounded-md overflow-hidden border" style={{ borderColor: GREY }}>
                  {inTree[0] ? (
                    isVideoItem(inTree[0])
                      ? <video src={proxiedMedia(inTree[0].image_url) + "#t=0.1"} muted playsInline preload="metadata" className="w-10 h-10 object-cover bg-black" />
                      : <Image src={inTree[0].image_url} fittingType="fill" alt={p} className="w-10 h-10" />
                  ) : <span className="block w-10 h-10" style={{ background: "#eeeeee" }} />}
                </span>
                <span className="font-body text-[13px] lowercase" style={{ color: BLACK }}>{p}</span>
              </button>
              <span className="font-mono text-[11px]" style={{ color: INK }}>{countIn(p)}</span>
              <button onClick={() => delCategory(p)} disabled={busy} title="Verwijder deze categorie en alles eronder"
                className="text-[13px] leading-none hover:opacity-60 transition disabled:opacity-30" style={{ color: INK }}>×</button>
            </div>
            {childrenOf(p).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 pl-[52px]">
                {childrenOf(p).map((s) => (
                  <button key={s} onClick={() => setSelCat(s)} onDragOver={(e) => e.preventDefault()} onDrop={dropOn(s)}
                    className="rounded-full border font-body text-[10px] lowercase px-2 py-0.5 hover:opacity-70 transition"
                    style={{ borderColor: GREY, color: INK }}>
                    {s.split("/").pop()} {countIn(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {byGallery.size > 0 && (
        <>
          <h3 className="font-mono text-[10px] tracking-[0.18em] uppercase mt-6" style={{ color: BLUE }}>Galerijen</h3>
          {[...byGallery.entries()].map(([g, info]) => (
            <div key={g} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: GREY }}>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[12px] truncate" style={{ color: BLACK }} title={g}>{g}</p>
                <p className="font-mono text-[10px] lowercase" style={{ color: INK }}>{info.category} · {info.items.length} foto's</p>
              </div>
              <button onClick={() => wipe(() => base44.entities.PlaytimeImages.deleteMany({ gallery_url: g }))} disabled={busy} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30" style={{ color: RED }}>Verwijder</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}