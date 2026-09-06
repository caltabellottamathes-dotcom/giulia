import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

/**
 * scrape_twitter_media — haalt de media-tweets van een X/Twitter-gebruiker
 * op via de Scrape Creators API (zelfde API-key als de Reddit-scraper;
 * TwitterAPI.io is vervallen omdat die volledig betalend is). Slaat de
 * directe media-URL's (foto's én video's) op in de bestaande
 * PlaytimeImages-collectie met source="twitter".
 * Input: username (@handle), category, limit (optioneel, default 100).
 * Zoeken op trefwoord ondersteunt deze API niet — alleen @gebruiker.
 *
 * Benodigde secret: SCRAPECREATORS_API_KEY (app.scrapecreators.com).
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

// Beste mp4-variant uit een video/gif-media-object (GraphQL en genormaliseerd)
function bestMp4(m) {
  const variants = m?.variants || m?.videoVariants || m?.video_info?.variants || [];
  let best = null;
  for (const v of variants) {
    const src = decodeUrl(v?.src || v?.url || v?.content_url || "");
    if (!src) continue;
    const ctype = String(v?.type || v?.contentType || v?.content_type || "");
    const isMp4 = /\.mp4(\?|$)/i.test(src) || ctype.includes("mp4");
    if (!isMp4) continue;
    const br = Number(v?.bitrate || v?.bit_rate || 0);
    if (!best || br > best.br) best = { url: src, br };
  }
  return best?.url || null;
}

// Genormaliseerde lijst óf ruwe GraphQL-timeline → platte tweet-array
function normalizeTweets(json) {
  if (Array.isArray(json?.tweets)) return json.tweets.filter(Boolean);
  if (Array.isArray(json?.data?.tweets)) return json.data.tweets.filter(Boolean);
  if (Array.isArray(json?.data)) return json.data.filter(Boolean);
  if (Array.isArray(json)) return json.filter(Boolean);
  const instructions = json?.data?.user?.result?.timeline_v2?.timeline?.instructions
    || json?.data?.user?.result?.timeline?.timeline?.instructions;
  if (Array.isArray(instructions)) {
    const out = [];
    for (const ins of instructions) {
      for (const e of ins?.entries || []) {
        const t = e?.content?.itemContent?.tweet_results?.result;
        if (t) out.push(t);
      }
    }
    if (out.length) return out;
  }
  return [];
}

function mediaListOf(t) {
  return t?.media || t?.extendedEntities?.media || t?.extended_entities?.media
    || t?.legacy?.extended_entities?.media || t?.tweet?.legacy?.extended_entities?.media
    || t?.tweet?.extended_entities?.media || [];
}

function tweetIdOf(t) {
  return t?.id || t?.rest_id || t?.legacy?.id_str || t?.tweet?.rest_id || t?.tweet?.legacy?.id_str || null;
}
function handleOf(t, fallback) {
  return t?.author?.userName || t?.author?.handle || t?.author?.screen_name
    || t?.core?.user_results?.result?.legacy?.screen_name || t?.legacy?.user?.screen_name || fallback;
}
function textOf(t) {
  return t?.text || t?.legacy?.full_text || t?.tweet?.legacy?.full_text || t?.tweet?.text || "";
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const category = String(body.category || "").trim().toLowerCase();
    const username = String(body.username || "").trim().replace(/^@/, "");
    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 100, 1), 100);
    if (!category) return Response.json({ error: "categorie vereist" }, { status: 400 });
    if (!username) {
      return Response.json({
        error: "Alleen @gebruiker-scrapes zijn mogelijk op X — zoeken op trefwoord ondersteunt deze API niet. Vul een @gebruiker in.",
      }, { status: 400 });
    }

    const key = process.env.SCRAPECREATORS_API_KEY;
    if (!key) {
      return Response.json({
        error: "SCRAPECREATORS_API_KEY is niet ingesteld. Maak gratis een account op app.scrapecreators.com (100 gratis credits) en voeg de API-key toe aan de app-secrets.",
      }, { status: 400 });
    }

    // Tweets ophalen via Scrape Creators (Twitter user-tweets)
    const apiRes = await fetch(
      `https://api.scrapecreators.com/v1/twitter/user-tweets?handle=${encodeURIComponent(username)}&trim=true`,
      { headers: { "x-api-key": key, Accept: "application/json", "User-Agent": UA } },
    );
    if (!apiRes.ok) {
      const reason = apiRes.status === 401 ? "Scrape Creators API-key ongeldig"
        : apiRes.status === 402 ? "Geen credits meer bij Scrape Creators"
        : apiRes.status === 429 ? "Scrape Creators rate-limit bereikt"
        : apiRes.status === 404 ? `@${username} bestaat niet of is privé`
        : `Scrape Creators fout (HTTP ${apiRes.status})`;
      let detail = "";
      try { detail = (await apiRes.text()).slice(0, 200); } catch { /* ignore */ }
      return Response.json({ error: `${reason}${detail ? `: ${detail}` : ""}` }, { status: 502 });
    }
    const json = await apiRes.json().catch(() => null);
    const tweets = normalizeTweets(json).slice(0, limit);
    if (!tweets.length) {
      const apiNote = json?.error || json?.message
        || (json?.data && typeof json.data === "object" && !Array.isArray(json.data) ? json.data.error || json.data.message : "");
      return Response.json({
        error: `Geen tweets gevonden voor @${username}${apiNote ? ` (API: ${String(apiNote).slice(0, 150)})` : ""}. Check dat de @gebruiker precies klopt — een niet-bestaande, privé, afgesloten of leeftijdsbeperkte (18+) account is voor deze API onzichtbaar. Zoeken op zoektermen kan niet, alleen @gebruikers.`,
      }, { status: 502 });
    }

    // Bestaande URL's — geen duplicaten
    const existing = await base44.asServiceRole.entities.PlaytimeImages.list("-created_date", 1000).catch(() => []);
    const seen = new Set((existing || []).map((r) => r.image_url));

    const records = [];
    let found = 0;
    let skipped = 0;
    for (const t of tweets) {
      const media = mediaListOf(t);
      const handle = handleOf(t, username);
      const id = tweetIdOf(t);
      const postUrl = id ? `https://x.com/${handle}/status/${id}` : null;
      for (const m of media) {
        const type = String(m?.type || "").toLowerCase();
        let url = null;
        let kind = "image";
        if (type === "photo") {
          url = largePhoto(m?.url || m?.media_url_https || m?.preview_image_url || m?.media_url);
        } else {
          // video of gif — pak de beste mp4, anders de preview als foto
          url = bestMp4(m) || decodeUrl(m?.url || "");
          kind = VID_EXT.includes(extOf(url)) ? "video" : null;
          if (!kind) url = m?.preview_image_url || m?.media_url_https ? largePhoto(m?.preview_image_url || m?.media_url_https) : null;
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
          description: String(textOf(t)).slice(0, 300),
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
      username: `@${username}`,
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