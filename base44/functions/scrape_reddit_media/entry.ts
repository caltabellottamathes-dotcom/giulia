import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

/**
 * scrape_reddit_media — haalt posts uit een subreddit en slaat de directe
 * media-URL's (foto's én video's) op in de bestaande PlaytimeImages-collectie
 * met source="reddit". Dekking: i.redd.it, preview.redd.it, v.redd.it,
 * imgur (incl. .gifv→mp4), redgifs (via publieke API) en galerijen.
 * Input: subreddit, category, limit (optioneel, 1-100, default 25),
 * sort (optioneel: hot|new|top|rising, default hot).
 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const SORTS = ["hot", "new", "top", "rising"];
const IMG_EXT = ["png", "jpg", "jpeg", "gif", "webp"];
const VID_EXT = ["mp4", "mov", "webm", "m4v", "mkv"];

const extOf = (u) => String(u || "").split("?")[0].split("#")[0].split(".").pop().toLowerCase();
const decodeUrl = (u) => String(u || "").replace(/&amp;/g, "&");

async function fetchJson(url, timeoutMs = 15000, headers = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json", ...headers },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Redgifs-paginalink → directe mp4 via de publieke API (best-effort)
async function redgifsDirect(url) {
  const idM = String(url).match(/redgifs\.com\/(?:watch|ifr|gifs)\/([a-z0-9]+)/i);
  if (!idM) return null;
  const auth = await fetchJson("https://api.redgifs.com/v2/auth/temporary", 10000);
  if (!auth?.token) return null;
  const gif = await fetchJson(`https://api.redgifs.com/v2/gifs/${idM[1]}`, 12000, { Authorization: `Bearer ${auth.token}` });
  const u = gif?.gif?.urls?.hd || gif?.gif?.urls?.sd;
  if (!u) return null;
  return { url: u, kind: "video" };
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
  const dest = decodeUrl(p.url_overridden_by_dest || p.url || "");

  // 1. Reddit-video (v.redd.it mp4)
  const rv = p.media?.reddit_video || p.secure_media?.reddit_video || p.preview?.reddit_video;
  if (rv?.fallback_url) push(rv.fallback_url, "video");

  // 2. Galerie (meerdere foto's)
  if (p.is_gallery && p.media_metadata) {
    for (const m of Object.values(p.media_metadata || {})) {
      if (m?.e === "Image" && (m.u || m.s?.u)) push(m.u || m.s.u, "image");
    }
  }

  // 3. Directe i.redd.it-foto
  if (/i\.redd\.it\//.test(dest) && IMG_EXT.includes(extOf(dest))) push(dest, "image");

  // 4. imgur-pagina → directe link (.gifv → mp4)
  const im = dest.match(/(?:m\.)?imgur\.com\/([A-Za-z0-9]+)(\.gifv)?\/?$/);
  if (im) push(`https://i.imgur.com/${im[1]}.${im[2] ? "mp4" : "jpg"}`, im[2] ? "video" : "image");

  // 5. mp4-previewvariant (gif's → video)
  const mp4v = p.preview?.images?.[0]?.variants?.mp4?.source?.url;
  if (mp4v && !rv?.fallback_url) push(mp4v, "video");

  // 6. Standaard preview-foto (dekt externe hosts)
  const src = p.preview?.images?.[0]?.source?.url;
  if (src && !/i\.redd\.it\//.test(dest)) push(src, "image");

  // 7. Directe bestandsextensies op de dest-link
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

    // Posts ophalen — www eerst, old.reddit als fallback
    let listing = null;
    for (const u of [
      `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`,
      `https://old.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`,
    ]) {
      listing = await fetchJson(u, 15000);
      if (listing?.data?.children) break;
    }
    const posts = (listing?.data?.children || []).map((c) => c?.data).filter(Boolean);
    if (!posts.length) {
      return Response.json({ error: `Geen posts gevonden voor r/${subreddit} (${sort}) — reddit kan onbereikbaar zijn vanaf deze server.` }, { status: 502 });
    }

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
      for (const m of media) {
        found++;
        if (seen.has(m.url)) { skipped++; continue; }
        seen.add(m.url);
        records.push({
          category,
          image_url: m.url,
          gallery_url: `https://www.reddit.com${p.permalink || ""}`,
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