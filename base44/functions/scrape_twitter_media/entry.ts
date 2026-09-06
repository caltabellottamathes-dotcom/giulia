import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

/**
 * scrape_twitter_media — haalt tweets met media op via de TwitterAPI.io
 * API (third-party, uitsluitend een API-key; géén X-developer-account of
 * OAuth) en slaat de directe media-URL's (foto's én video's) op in de
 * bestaande PlaytimeImages-collectie met source="twitter".
 * Input: query (zoekterm) óf username (@handle), category, limit (optioneel).
 *
 * Benodigde secret: TWITTERAPI_IO_KEY (platform.twitterapi.io).
 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const VID_EXT = ["mp4", "mov", "webm", "m4v", "mkv"];

const extOf = (u) => String(u || "").split("?")[0].split("#")[0].split(".").pop().toLowerCase();
const decodeUrl = (u) => String(u || "").replace(/&amp;/g, "&");

// pbs.twimg.com foto's komen als "...?format=jpg&name=small" — haal de
// grootste versie op zodat de thumbnail en de viewer scherp zijn.
function largePhoto(u) {
  return String(u || "").replace(/([?&])name=\w+/, "$1name=large");
}

// Best mp4-variant uit een video/gif-media-object
function bestMp4(m) {
  const variants = m?.variants || m?.videoVariants || [];
  let best = null;
  for (const v of variants) {
    const src = decodeUrl(v?.src || v?.url || v?.content_url || "");
    if (!src) continue;
    const isMp4 = /\.mp4(\?|$)/i.test(src) || String(v?.type || v?.contentType || "").includes("mp4");
    if (!isMp4) continue;
    const br = Number(v?.bitrate || v?.bit_rate || 0);
    if (!best || br > best.br) best = { url: src, br };
  }
  return best?.url || null;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const category = String(body.category || "").trim().toLowerCase();
    const query = String(body.query || "").trim();
    const username = String(body.username || "").trim().replace(/^@/, "");
    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 20, 1), 50);
    if (!category) return Response.json({ error: "categorie vereist" }, { status: 400 });
    if (!query && !username) return Response.json({ error: "query of username vereist" }, { status: 400 });

    const key = process.env.TWITTERAPI_IO_KEY;
    if (!key) {
      return Response.json({
        error: "TWITTERAPI_IO_KEY is niet ingesteld. Maak een account op platform.twitterapi.io en voeg de API-key toe aan de app-secrets.",
      }, { status: 400 });
    }

    // Tweets ophalen — zoekterm of laatste tweets van een gebruiker
    const path = username
      ? `/twitter/user/last-tweets?userName=${encodeURIComponent(username)}`
      : `/twitter/tweet/search?q=${encodeURIComponent(query)}`;
    const apiRes = await fetch(`https://api.twitterapi.io${path}`, {
      headers: { "X-API-Key": key, Accept: "application/json", "User-Agent": UA },
    });
    if (!apiRes.ok) {
      const reason = apiRes.status === 401 ? "TwitterAPI.io API-key ongeldig"
        : apiRes.status === 402 || apiRes.status === 429 ? "Geen credits of rate-limit bereikt bij TwitterAPI.io"
        : `TwitterAPI.io fout (HTTP ${apiRes.status})`;
      let detail = "";
      try { detail = (await apiRes.text()).slice(0, 200); } catch { /* ignore */ }
      return Response.json({ error: `${reason}${detail ? `: ${detail}` : ""}` }, { status: 502 });
    }
    const json = await apiRes.json().catch(() => null);
    const tweets = (json?.tweets || []).slice(0, limit);
    if (!tweets.length) {
      return Response.json({ error: `Geen tweets gevonden voor ${username ? `@${username}` : `"${query}"`}.` }, { status: 502 });
    }

    // Bestaande URL's — geen duplicaten
    const existing = await base44.asServiceRole.entities.PlaytimeImages.list("-created_date", 1000).catch(() => []);
    const seen = new Set((existing || []).map((r) => r.image_url));

    const records = [];
    let found = 0;
    let skipped = 0;
    for (const t of tweets) {
      const media = t?.media || t?.extendedEntities?.media || [];
      const handle = t?.author?.userName || t?.author?.handle || "";
      const postUrl = t?.id ? `https://x.com/${handle}/status/${t.id}` : null;
      for (const m of media) {
        const type = String(m?.type || "").toLowerCase();
        let url = null;
        let kind = "image";
        if (type === "photo") {
          url = largePhoto(m?.url || m?.preview_image_url || m?.media_url || m?.media_url_https);
          kind = "image";
        } else {
          // video of gif — pak de beste mp4, anders de preview als foto
          url = bestMp4(m) || decodeUrl(m?.url || "");
          kind = VID_EXT.includes(extOf(url)) ? "video" : null;
          if (!kind) url = m?.preview_image_url ? largePhoto(m.preview_image_url) : null;
        }
        if (!url) continue;
        const clean = decodeUrl(url);
        if (!/^https?:\/\//.test(clean)) continue;
        found++;
        if (seen.has(clean)) { skipped++; continue; }
        seen.add(clean);
        records.push({
          category,
          image_url: clean,
          gallery_url: postUrl || undefined,
          description: String(t?.text || "").slice(0, 300),
          source: "twitter",
          kind,
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
      source: username ? `@${username}` : query,
      category,
      tweets: tweets.length,
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