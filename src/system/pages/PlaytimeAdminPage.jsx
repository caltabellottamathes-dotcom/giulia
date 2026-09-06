import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const BLUE = "#b1bfc7";
const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";

const EXAMPLE_CATEGORIES = [
  "hairy", "gaping", "piss", "somno", "arab", "bbw", "fisting", "gay",
  "incest", "selfsuck", "cruising", "public", "fat", "ftm", "breeding",
];

/** PlaytimeAdminPage — beheer de gescrapte Playtime-collectie: galerij-URL's
 *  + categorie toevoegen, de scraper draaien, en per categorie zien hoeveel
 *  foto's er opgeslagen zijn. */
export default function PlaytimeAdminPage() {
  const [galleryUrl, setGalleryUrl] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCounts = async () => {
    try {
      const list = await base44.entities.PlaytimeImages.list("-created_date", 1000);
      const byCat = {};
      for (const it of list || []) {
        const c = it.category || "onbekend";
        if (!byCat[c]) byCat[c] = { category: c, count: 0, latest: null };
        byCat[c].count++;
        if (!byCat[c].latest) byCat[c].latest = it;
      }
      setRows(Object.values(byCat).sort((a, b) => b.count - a.count));
    } catch {
      /* tabel blijft leeg */
    }
    setLoading(false);
  };

  useEffect(() => { loadCounts(); }, []);

  const scrape = async () => {
    if (!galleryUrl.trim() || !category.trim() || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("scrape_imagefap_gallery", {
        gallery_url: galleryUrl.trim(),
        category: category.trim().toLowerCase(),
        description: description.trim(),
      });
      const d = res?.data || res;
      setResult(d?.error ? d : { ...d, ok: d?.ok !== false });
      await loadCounts();
    } catch (e) {
      setResult({ error: String((e && e.message) || e) });
    }
    setBusy(false);
  };

  const inputCls = "w-full bg-transparent border-b focus:outline-none px-1 py-1.5 font-body text-[14px] text-black placeholder:text-black/35";
  const labelCls = "block font-mono text-[9px] uppercase tracking-[0.18em] mb-1";

  return (
    <div className="min-h-screen pt-14 pb-16 graph-paper">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold">LIFE → PLAYTIME · MEDIA ADMIN</p>
        <h1 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.95] mt-3" style={{ color: BLACK, fontSize: "clamp(30px, 3vw, 46px)" }}>
          Galerijen &amp; foto's
        </h1>
        <p className="font-body text-[13px] leading-[1.5] mt-2 max-w-xl" style={{ color: INK }}>
          Voeg een galerij-URL plus categorie toe — de scraper haalt alle foto's eruit en tagt ze. Mattia kan ze daarna per categorie opvragen in de chat.{" "}
          <Link to="/playtime" className="underline underline-offset-4 decoration-black/20 hover:decoration-black/60" style={{ color: INK }}>Terug naar Playtime</Link>
        </p>

        <div className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start">
          {/* Nieuwe galerij */}
          <div className="rounded-2xl border p-6" style={{ borderColor: GREY, background: "rgba(255,255,255,0.65)" }}>
            <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>Nieuwe galerij scrapen</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls} style={{ color: INK }}>Galerij-URL</label>
                <input value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} placeholder="https://www.imagefap.com/gallery…" className={inputCls} style={{ borderColor: GREY }} />
              </div>
              <div>
                <label className={labelCls} style={{ color: INK }}>Categorie</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="hairy, gaping, arab…" list="pt-cats" className={inputCls} style={{ borderColor: GREY }} />
                <datalist id="pt-cats">{EXAMPLE_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className={labelCls} style={{ color: INK }}>Beschrijving (optioneel)</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="bv. Carina's favoriete set" className={inputCls} style={{ borderColor: GREY }} />
              </div>
              <button
                onClick={scrape}
                disabled={busy || !galleryUrl.trim() || !category.trim()}
                className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30"
                style={{ color: BLACK }}
              >
                {busy ? "Scrapen…" : "Scrape galerij"}
              </button>
              {busy && <p className="font-body text-[12px] italic" style={{ color: INK }}>Galerij ophalen — kan even duren…</p>}
              {result && !busy && (
                <p className="font-body text-[12px] leading-[1.5]" style={{ color: result.error ? "#b03a2e" : "#3d6b35" }}>
                  {result.error
                    ? result.error
                    : `Klaar: ${result.added} toegevoegd · ${result.skipped_duplicates} duplicaten overgeslagen · ${result.found} gevonden${result.pages_fetched ? ` · ${result.pages_fetched} pagina('s)` : ""}.`}
                </p>
              )}
            </div>
          </div>

          {/* Categorie-tellingen */}
          <div className="rounded-2xl border p-6" style={{ borderColor: GREY, background: "rgba(255,255,255,0.65)" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>Categorieën</h2>
              <button onClick={loadCounts} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>Verversen</button>
            </div>
            <div className="mt-4">
              {loading ? (
                <p className="font-body text-[12px] italic" style={{ color: INK }}>Laden…</p>
              ) : rows.length === 0 ? (
                <p className="font-body text-[12px] leading-[1.5]" style={{ color: INK }}>Nog geen foto's opgeslagen. Scrap je eerste galerij links.</p>
              ) : (
                rows.map((r) => (
                  <div key={r.category} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: GREY }}>
                    {r.latest && (
                      <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden border" style={{ borderColor: GREY }}>
                        <Image src={r.latest.image_url} fittingType="fill" alt={r.category} className="w-10 h-10" />
                      </div>
                    )}
                    <span className="font-body text-[13px] lowercase" style={{ color: BLACK }}>{r.category}</span>
                    <span className="ml-auto font-mono text-[11px]" style={{ color: INK }}>{r.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}