import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

/**
 * scrape_reddit_media — haalt posts uit een subreddit via de Scrape Creators
 * API (third-party, uitsluitend een API-key; géén officiële Reddit-API en
 * géén OAuth) en slaat de directe media-URL's (foto's én video's) op in de
 * bestaande PlaytimeImages-collectie met source="reddit".
 * Dekking: i.redd.it, preview.redd.it, v.redd.it, imgur (.gifv→mp4),
 * redgifs en galerijen. get_playtime_image levert ze daarna aan Mattia.
 *
 * Benodigde secret: SCRAPECREATORS_API_KEY (app.scrapecreators.com — 100 gratis credits).
 * Input: subreddit, category, limit (optioneel, default 25), sort (hot|new|top).
 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const IMG_EXT = ["png", "jpg", "jpeg", "gif", "webp"];
const VID_EXT = ["mp4", "mov", "webm", "m4v", "mkv"];
const SORTS = ["hot", "new", "top"];

const extOf = (u) => String(u || "").split("?")[0].split("#")[0].split(".").pop().toLowerCase();
const decodeUrl = (u) => String(u || "").replace(/&amp;/g, "&");

// Redgifs-paginalink → directe mp4 via de publieke API (best-effort)
async function redgifsDirect(url) {
  const idM = String(url).match(/redgifs\.com\/(?:watch|ifr|gifs)\/([a-z0-9]+)/i);
  if (!idM) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const authRes = await fetch("https://api.redgifs.com/v2/auth/temporary", { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctrl.signal });
    if (!authRes.ok) return null;
    const auth = await authRes.json();
    if (!auth?.token) return null;
    const gifRes = await fetch(`https://api.redgifs.com/v2/gifs/${idM[1]}`, { headers: { "User-Agent": UA, Accept: "application/json", Authorization: `Bearer ${auth.token}` }, signal: ctrl.signal });
    if (!gifRes.ok) return null;
    const gif = await gifRes.json();
    const u = gif?.gif?.urls?.hd || gif?.gif?.urls?.sd;
    if (!u) return null;
    return { url: u, kind: "video" };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Scrape Creators geeft óf een ruwe reddit-listing óf een genormaliseerde lijst
function normalizePosts(json) {
  if (json?.data?.children) return json.data.children.map((c) => c?.data).filter(Boolean);
  if (Array.isArray(json?.posts)) return json.posts.filter(Boolean);
  if (Array.isArray(json?.data)) return json.data.filter(Boolean);
  if (Array.isArray(json)) return json.filter(Boolean);
  return [];
}

// Alle directe media-URL's uit één post
function mediaFromPost(p) {
  const out = [];
  const push = (url, kind) => {
    const u = decodeUrl(url);
    if (!u || !/^https?:\/\//.test(u)) return;
    if (out.some((o) => o.url === u)) return;
    out.push({ url: u, kind });
  };
  const dest = decodeUrl(p.url_overridden_by_dest || p.url || p.link_url || p.media_url || "");

  // 1. Reddit-video (v.redd.it mp4)
  const rv = p.media?.reddit_video || p.secure_media?.reddit_video || p.preview?.reddit_video || p.reddit_video;
  if (rv?.fallback_url) push(rv.fallback_url, "video");

  // 2. Galerie (meerdere foto's)
  if (p.is_gallery && p.media_metadata) {
    for (const m of Object.values(p.media_metadata || {})) {
      if (m?.e === "Image" && (m.u || m.s?.u)) push(m.u || m.s.u, "image");
    }
  }

  // 3. Genormaliseerde velden (Scrape Creators trim)
  if (Array.isArray(p.images)) {
    for (const iu of p.images) {
      const u = typeof iu === "string" ? iu : iu?.url || iu?.source?.url || iu?.media_url;
      push(u, "image");
    }
  }
  if (p.image_url) push(p.image_url, "image");
  if (p.video_url) push(p.video_url, "video");

  // 4. Directe i.redd.it-foto
  if (/i\.redd\.it\//.test(dest) && IMG_EXT.includes(extOf(dest))) push(dest, "image");

  // 5. imgur-pagina → directe link (.gifv → mp4)
  const im = dest.match(/(?:m\.)?imgur\.com\/([A-Za-z0-9]+)(\.gifv)?\/?$/);
  if (im) push(`https://i.imgur.com/${im[1]}.${im[2] ? "mp4" : "jpg"}`, im[2] ? "video" : "image");

  // 6. mp4-previewvariant (gif's → video)
  const mp4vRaw = p.preview?.images?.[0]?.variants?.mp4;
  const mp4v = typeof mp4vRaw === "string" ? mp4vRaw : mp4vRaw?.source?.url || mp4vRaw?.url;
  if (mp4v && !rv?.fallback_url) push(mp4v, "video");

  // 7. Standaard preview-foto (dekt externe hosts)
  const src = p.preview?.images?.[0]?.source?.url || (typeof p.preview === "string" ? p.preview : null);
  if (src && !/i\.redd\.it\//.test(dest)) push(src, "image");

  // 8. Directe extensies op de dest-link
  if (IMG_EXT.includes(extOf(dest)) && !/i\.redd\.it\//.test(dest)) push(dest, "image");
  if (VID_EXT.includes(extOf(dest))) push(dest, "video");

  return { out, redgifs: /redgifs\.com/.test(dest) ? dest : null };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const subreddit = String(body.subreddit || "").trim().replace(/^\/?r\//i, "").replace(/[^A-Za-z0-9_+-]/g, "");
    const category = String(body.category || "").trim().toLowerCase();
    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 25, 1), 100);
    const sort = SORTS.includes(body.sort) ? body.sort : "hot";
    if (!subreddit || !category) return Response.json({ error: "subreddit en categorie vereist" }, { status: 400 });

    const key = process.env.SCRAPECREATORS_API_KEY;
    if (!key) {
      return Response.json({
        error: "SCRAPECREATORS_API_KEY is niet ingesteld. Maak gratis een account op app.scrapecreators.com (100 gratis credits) en voeg de API-key toe aan de app-secrets.",
      }, { status: 400 });
    }

    // Posts ophalen via Scrape Creators (third-party Reddit-API)
    const apiRes = await fetch(
      `https://api.scrapecreators.com/v1/reddit/subreddit?subreddit=${encodeURIComponent(subreddit)}&sort=${sort}&trim=true`,
      { headers: { "x-api-key": key, Accept: "application/json", "User-Agent": UA } },
    );
    if (!apiRes.ok) {
      const reason = apiRes.status === 401 ? "Scrape Creators API-key ongeldig"
        : apiRes.status === 402 ? "Geen credits meer bij Scrape Creators"
        : apiRes.status === 429 ? "Scrape Creators rate-limit bereikt"
        : `Scrape Creators fout (HTTP ${apiRes.status})`;
      let detail = "";
      try { detail = (await apiRes.text()).slice(0, 200); } catch { /* ignore */ }
      return Response.json({ error: `${reason}${detail ? `: ${detail}` : ""}` }, { status: 502 });
    }
    const json = await apiRes.json().catch(() => null);
    let posts = normalizePosts(json);
    if (!posts.length) {
      return Response.json({ error: `Geen posts terug van Scrape Creators voor r/${subreddit} (${sort}).` }, { status: 502 });
    }
    posts = posts.slice(0, limit);

    // Bestaande URL's — geen duplicaten
    const existing = await base44.asServiceRole.entities.PlaytimeImages.list("-created_date", 1000).catch(() => []);
    const seen = new Set((existing || []).map((r) => r.image_url));

    const records = [];
    let found = 0;
    let skipped = 0;
    for (const p of posts) {
      const { out, redgifs } = mediaFromPost(p);
      const media = [...out];
      if (redgifs) {
        const rg = await redgifsDirect(redgifs).catch(() => null);
        if (rg) media.push(rg);
      }
      const permalinkRaw = decodeUrl(p.permalink);
      const postUrl = permalinkRaw
        ? (permalinkRaw.startsWith("http") ? permalinkRaw : `https://www.reddit.com${permalinkRaw}`)
        : (/\/comments\//.test(String(p.url || "")) ? decodeUrl(p.url) : null);
      for (const m of media) {
        found++;
        if (seen.has(m.url)) { skipped++; continue; }
        seen.add(m.url);
        records.push({
          category,
          image_url: m.url,
          gallery_url: postUrl || undefined,
          description: String(p.title || "").slice(0, 300),
          source: "reddit",
          kind: m.kind,
          created_at: new Date().toISOString(),
        });
      }
    }

    let added = 0;
    for (let i = 0; i < records.length; i += 100) {
      const chunk = records.slice(i, i + 100);
      const created = await base44.asServiceRole.entities.PlaytimeImages.bulkCreate(chunk).catch(() => null);
      added += Array.isArray(created) ? created.length : chunk.length;
    }

    return Response.json({
      ok: true,
      subreddit,
      sort,
      category,
      posts: posts.length,
      found,
      added,
      skipped_duplicates: skipped,
      images: records.filter((r) => r.kind === "image").length,
      videos: records.filter((r) => r.kind === "video").length,
    });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}