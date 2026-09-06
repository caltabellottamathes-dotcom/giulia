import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PlaytimeCategoryBrowser from "@/system/components/playtime/PlaytimeCategoryBrowser";

const BLUE = "#b1bfc7";
const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";

const EXAMPLE_CATEGORIES = [
  "hairy", "gaping", "piss", "somno", "arab", "bbw", "fisting", "gay",
  "incest", "selfsuck", "cruising", "public", "fat", "ftm", "breeding",
];

/** PlaytimeAdminPage — beheer de gescrapte Playtime-collectie: galerij-URL's
 *  + categorie toevoegen, de scraper draaien, en per categorie/galerij alle
 *  foto's zien en verwijderen. */
export default function PlaytimeAdminPage() {
  const [galleryUrl, setGalleryUrl] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [subreddit, setSubreddit] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subSort, setSubSort] = useState("hot");
  const [twUser, setTwUser] = useState("");
  const [twCategory, setTwCategory] = useState("");
  const [srcBusy, setSrcBusy] = useState(null);
  const [srcResult, setSrcResult] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [list, cats] = await Promise.all([
        base44.entities.PlaytimeImages.list("-created_date", 1000).catch(() => []),
        base44.entities.PlaytimeCategory.list("-created_date", 200).catch(() => []),
      ]);
      setImages(list || []);
      setCategories(cats || []);
    } catch {
      /* lijst blijft leeg */
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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
      await load();
    } catch (e) {
      setResult({ error: String((e && e.message) || e) });
    }
    setBusy(false);
  };

  const scrapeReddit = async () => {
    if (!subreddit.trim() || !subCategory.trim() || srcBusy) return;
    setSrcBusy("reddit");
    setSrcResult(null);
    try {
      const res = await base44.functions.invoke("scrape_reddit_media", {
        subreddit: subreddit.trim(), category: subCategory.trim().toLowerCase(), sort: subSort,
      });
      const d = res?.data || res;
      setSrcResult(d?.error ? d : { ...d, ok: true });
      await load();
    } catch (e) {
      setSrcResult({ error: e?.response?.data?.error || e?.data?.error || e?.response?.data?.message || String((e && e.message) || e) });
    }
    setSrcBusy(null);
  };

  const scrapeTwitter = async () => {
    const u = twUser.trim();
    if (!u || !twCategory.trim() || srcBusy) return;
    if (!/^@?[A-Za-z0-9_.]{1,20}$/.test(u)) {
      setSrcResult({ error: "X-scraping werkt alleen met een @gebruiker (bv. @naam) — een zoekterm of een naam met spaties vindt de API niet." });
      return;
    }
    setSrcBusy("twitter");
    setSrcResult(null);
    try {
      const res = await base44.functions.invoke("scrape_twitter_media", {
        username: u.replace(/^@/, ""), category: twCategory.trim().toLowerCase(),
      });
      const d = res?.data || res;
      setSrcResult(d?.error ? d : { ...d, ok: true });
      await load();
    } catch (e) {
      setSrcResult({ error: e?.response?.data?.error || e?.data?.error || e?.response?.data?.message || String((e && e.message) || e) });
    }
    setSrcBusy(null);
  };

  const cats = [...new Set(images.map((i) => (i.category || "").toLowerCase()).filter(Boolean))].sort();
  const datalist = [...cats, ...EXAMPLE_CATEGORIES.filter((c) => !cats.includes(c))];

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
          Voeg een galerij-URL plus categorie toe — de scraper haalt alle foto's eruit en tagt ze. Maak subcategorieën aan en sleep foto's erin voor gerichtere resultaten; Mattia ziet en gebruikt alle (sub)categorieën in de chat.{" "}
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
                <datalist id="pt-cats">{datalist.map((c) => <option key={c} value={c} />)}</datalist>
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

          {/* Categorieën + galerijen */}
          <div className="rounded-2xl border p-6" style={{ borderColor: GREY, background: "rgba(255,255,255,0.65)" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>Categorieën</h2>
              <button onClick={load} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>Verversen</button>
            </div>
            <div className="mt-4">
              <PlaytimeCategoryBrowser images={images} categories={categories} loading={loading} onRefresh={load} />
            </div>
          </div>
        </div>

        {/* Reddit & Twitter — third-party scrapers */}
        <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: GREY, background: "rgba(255,255,255,0.65)" }}>
          <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>Reddit &amp; Twitter scrapen</h2>
          <p className="font-body text-[12px] leading-[1.5] mt-2" style={{ color: INK }}>
            Haal foto's én video's uit een subreddit of van een X-gebruiker — de Reddit-scraper loopt automatisch alle beschikbare pagina's door.
          </p>
          <div className="mt-5 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className={labelCls} style={{ color: INK }}>Subreddit (zonder r/)</label>
                <input value={subreddit} onChange={(e) => setSubreddit(e.target.value)} placeholder="bv. hairyarmpits" className={inputCls} style={{ borderColor: GREY }} />
              </div>
              <div>
                <label className={labelCls} style={{ color: INK }}>Categorie</label>
                <input value={subCategory} onChange={(e) => setSubCategory(e.target.value)} placeholder="hairy, gaping, arab…" list="pt-cats" className={inputCls} style={{ borderColor: GREY }} />
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <label className={labelCls} style={{ color: INK }}>Sortering</label>
                  <select value={subSort} onChange={(e) => setSubSort(e.target.value)} className="bg-transparent border-b focus:outline-none px-1 py-1.5 font-body text-[14px] text-black" style={{ borderColor: GREY }}>
                    <option value="hot">hot</option>
                    <option value="new">new</option>
                    <option value="top">top</option>
                  </select>
                </div>
                <button onClick={scrapeReddit} disabled={!subreddit.trim() || !subCategory.trim() || !!srcBusy} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30" style={{ color: BLACK }}>
                  {srcBusy === "reddit" ? "Scrapen…" : "Scrape subreddit"}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls} style={{ color: INK }}>X-gebruiker (@handle)</label>
                <input value={twUser} onChange={(e) => setTwUser(e.target.value)} placeholder="@gebruiker" className={inputCls} style={{ borderColor: GREY }} />
              </div>
              <div>
                <label className={labelCls} style={{ color: INK }}>Categorie</label>
                <input value={twCategory} onChange={(e) => setTwCategory(e.target.value)} placeholder="hairy, gaping, arab…" list="pt-cats" className={inputCls} style={{ borderColor: GREY }} />
              </div>
              <div>
                <button onClick={scrapeTwitter} disabled={!twUser.trim() || !twCategory.trim() || !!srcBusy} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition disabled:opacity-30" style={{ color: BLACK }}>
                  {srcBusy === "twitter" ? "Scrapen…" : "Scrape X-gebruiker"}
                </button>
              </div>
            </div>
          </div>
          {srcBusy && (
            <p className="font-body text-[12px] italic mt-4" style={{ color: INK }}>
              {srcBusy === "reddit" ? "Subreddit ophalen — loopt pagina voor pagina door, even geduld…" : "Tweets ophalen…"}
            </p>
          )}
          {srcResult && !srcBusy && (
            <p className="font-body text-[12px] leading-[1.5] mt-4" style={{ color: srcResult.error ? "#b03a2e" : "#3d6b35" }}>
              {srcResult.error
                ? srcResult.error
                : `Klaar: ${srcResult.added} toegevoegd · ${srcResult.skipped_duplicates || 0} duplicaten overgeslagen${srcResult.pages ? ` · ${srcResult.pages} pagina('s) · ${srcResult.posts || srcResult.tweets} posts` : ""} · ${srcResult.images || 0} foto('s) · ${srcResult.videos || 0} video('s).`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}