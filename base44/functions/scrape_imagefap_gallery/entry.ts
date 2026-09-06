/**
 * scrape_imagefap_gallery — haalt alle full-afbeeldingen van een ImageFap-
 * galerij op (via de fotopagina's, incl. paginanummers) en slaat ze per
 * categorie op in PlaytimeImages. Bestaande foto's van dezelfde galerij
 * worden overgeslagen. Naast de verse image_url wordt ook de fotopagina
 * (photo_url) opgeslagen, zodat get_playtime_image de link later kan
 * verversen — de CDN-links zijn token-gebonden en verlopen.
 *
 * Input:  { gallery_url, category, description? }
 * Output: { ok, gallery_url, category, found, added, skipped_duplicates, pages_fetched, photo_pages_fetched }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { ifapFetchText, ifapPhotoRefs, ifapAllFullUrls, ifapFullUrl } from '../../shared/imagefap.ts';

const MAX_PAGES = 6;
const MAX_FANOUT = 100;
const MAX_IMAGES = 500;
const BATCH = 8;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const galleryUrl = String(body.gallery_url || "").trim();
    const category = String(body.category || "").trim().toLowerCase();
    const description = body.description ? String(body.description).trim() : "";
    if (!galleryUrl || !category) {
      return Response.json({ error: "gallery_url en category zijn verplicht" }, { status: 400 });
    }

    // ── Galerijpagina('s) ophalen → foto-referenties ─────────────────
    const firstHtml = await ifapFetchText(galleryUrl);
    const refs = ifapPhotoRefs(firstHtml);
    const directFulls = new Set(ifapAllFullUrls(firstHtml));
    let pagesFetched = 1;
    if (!/[?&]page=/.test(galleryUrl)) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        try {
          const u = new URL(galleryUrl);
          u.searchParams.set("page", String(page));
          const html = await ifapFetchText(u.toString());
          const before = refs.size;
          for (const [id, url] of ifapPhotoRefs(html)) {
            if (!refs.has(id)) refs.set(id, url);
          }
          for (const u2 of ifapAllFullUrls(html)) directFulls.add(u2);
          if (refs.size === before && directFulls.size === 0) break;
          pagesFetched++;
        } catch {
          break;
        }
      }
    }

    // ── Fotopagina's af → verse full-URL per foto ────────────────────
    const entries = [];
    const ids = [...refs.keys()].slice(0, MAX_FANOUT);
    for (let i = 0; i < ids.length; i += BATCH) {
      const results = await Promise.allSettled(
        ids.slice(i, i + BATCH).map(async (id) => {
          const html = await ifapFetchText(refs.get(id));
          const imageUrl = ifapFullUrl(html, id);
          return imageUrl ? { image_url: imageUrl, photo_url: refs.get(id) } : null;
        })
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) entries.push(r.value);
      }
    }

    // Fallback: pagina's met directe full-links (geen fotopagina's nodig)
    for (const u of directFulls) {
      if (!entries.some((e) => e.image_url === u)) entries.push({ image_url: u, photo_url: "" });
    }

    // Ontdubbelen binnen de run en cap
    const seen = new Set();
    const unique = [];
    for (const e of entries) {
      if (seen.has(e.image_url)) continue;
      seen.add(e.image_url);
      unique.push(e);
      if (unique.length >= MAX_IMAGES) break;
    }

    if (!unique.length) {
      return Response.json(
        { ok: false, error: "Geen afbeeldingen gevonden — is dit een galerij-URL (https://www.imagefap.com/gallery/…)?", found: 0, added: 0 },
        { status: 422 }
      );
    }

    // ── Ontdubbelen tegen wat er al van deze galerij in de tabel zit ──
    const existing = await base44.entities.PlaytimeImages.filter({ gallery_url: galleryUrl }, "-created_date", 1000).catch(() => []);
    const known = new Set((existing || []).map((r) => r.image_url));
    const fresh = unique.filter((e) => !known.has(e.image_url));
    const now = new Date().toISOString();

    // ── Opslaan in chunks van 100 ────────────────────────────────────
    let added = 0;
    for (let i = 0; i < fresh.length; i += 100) {
      const chunk = fresh.slice(i, i + 100).map((e) => ({
        category,
        image_url: e.image_url,
        photo_url: e.photo_url || "",
        gallery_url: galleryUrl,
        description,
        created_at: now,
      }));
      const created = await base44.entities.PlaytimeImages.bulkCreate(chunk).catch(() => null);
      if (created) added += chunk.length;
    }

    return Response.json({
      ok: true,
      gallery_url: galleryUrl,
      category,
      found: unique.length,
      added,
      skipped_duplicates: unique.length - fresh.length,
      pages_fetched: pagesFetched,
      photo_pages_fetched: ids.length,
    });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}