import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

/**
 * scrape_twitter_media — haalt de media uit de posts van een X/Twitter-gebruiker
 * en slaat de directe media-URL's (foto's en video's) op in de
 * PlaytimeImages-collectie met source="twitter".
 *
 * Twee routes, automatisch na elkaar:
 *   1. Scrape Creators API (SCRAPECREATORS_API_KEY) — werkt voor gewone accounts.
 *   2. X-mirror (twstalker.com) via de lokale bridge (BRIDGE_URL + BRIDGE_TOKEN) —
 *      de mirror ziet ook leeftijdsbeperkte (18+) en 'onzichtbare' accounts. De
 *      bridge haalt de pagina's op vanaf het thuis-IP zodat Cloudflare ze doorlaat.
 *      Alleen de media in de posts (foto's/video's) wordt opgeslagen, geen tweets.
 * Input: username (@handle), category, limit (optioneel, default 100).
 * Zoeken op trefwoord ondersteunt geen van beide routes — alleen @gebruiker.
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

// Genormaliseerde lijst of ruwe GraphQL-timeline -> platte tweet-array
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

// ── Route 2: X-mirror (twstalker) via de lokale bridge ────────────────────

async function bridgeFetch(url) {
  const bridge = String(process.env.BRIDGE_URL || "").replace(/\/$/, "");
  const token = process.env.BRIDGE_TOKEN;
  if (!bridge || !token) {
    return { error: "De X-mirror-route loopt via je lokale bridge (BRIDGE_URL/BRIDGE_TOKEN) en die is niet ingesteld in de app-secrets." };
  }
  try {
    const r = await fetch(bridge + "/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ url: url }),
    });
    const d = await r.json().catch(() => null);
    if (r.status === 404) {
      return { error: "De bridge draait nog een oude versie zonder de nieuwe fetch-route — herstart de bridge met de nieuwste server.js." };
    }
    if (!r.ok || !d || typeof d.body !== "string") {
      return { error: "Bridge-fout (HTTP " + r.status + ")" + (d && d.error ? ": " + String(d.error).slice(0, 120) : "") };
    }
    return { status: d.status, body: d.body };
  } catch (e) {
    return { error: "Bridge onbereikbaar — draait de bridge op je computer? (" + String((e && e.message) || e).slice(0, 100) + ")" };
  }
}

const stripTags = (s) => String(s || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  .replace(/\s+/g, " ").trim();

// Media (foto's + video's) uit het hoofdpost-blok van een twstalker-statuspagina
function mediaFromPostBlock(html) {
  const out = [];
  const textM = html.match(/class="activity-descp"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  const desc = stripTags(textM ? textM[1] : "").slice(0, 300);
  // Foto's — data-image="https://pbs.twimg.com/media/XXX.jpg" (originele grootte)
  const imgRe = /data-image="([^"]+)"/g;
  const imgUrlSet = new Set();
  let im;
  while ((im = imgRe.exec(html)) !== null) {
    const u = decodeUrl(im[1]);
    if (u.indexOf("pbs.twimg.com/media/") !== -1) imgUrlSet.add(u.split("?")[0]);
  }
  for (const u of imgUrlSet) {
    out.push({ url: u, kind: "image", desc: desc });
  }
  // Video — "Download Video"-links naar video-s.twimg.com mp4, hoogste resolutie
  const vidRe = /https:\/\/video[^"'\s<>]+\.mp4[^"'\s<>]*/g;
  let bestVid = null;
  let vm;
  while ((vm = vidRe.exec(html)) !== null) {
    const v = decodeUrl(vm[0]);
    const dim = v.match(/(\d{2,5})x(\d{2,5})/);
    const px = dim ? Number(dim[1]) * Number(dim[2]) : 0;
    if (!bestVid || px > bestVid.px) bestVid = { url: v, px: px };
  }
  if (bestVid) out.push({ url: bestVid.url, kind: "video", desc: desc });
  return out;
}

async function scrapeViaMirror(username, category, seen, limit) {
  const profile = await bridgeFetch("https://twstalker.com/" + encodeURIComponent(username));
  if (profile.error) return profile;
  const body = profile.body || "";
  if (profile.status === 403 || profile.status === 503 || body.indexOf("Just a moment") !== -1) {
    return { error: "De X-mirror blokkeert dit verkeer met een Cloudflare-controle. Start de bridge op je eigen computer (opnieuw) en probeer het nog eens — vanaf je thuis-IP laat de mirror het normaal door." };
  }
  if (profile.status === 404 || body.indexOf("images/error.png") !== -1 || body.toLowerCase().indexOf("user not found") !== -1) {
    return { error: "@" + username + " niet gevonden op de X-mirror — de account bestaat niet, is privé of afgesloten." };
  }
  // Status-links op de profiel-tijdlijn (ook retweets linken naar de originele auteur)
  const postRe = /\/([A-Za-z0-9_]{1,20})\/status\/(\d{5,25})/g;
  const seenIds = new Set();
  const posts = [];
  let pm;
  while ((pm = postRe.exec(body)) !== null) {
    if (!seenIds.has(pm[2])) {
      seenIds.add(pm[2]);
      posts.push({ handle: pm[1], id: pm[2] });
    }
    if (posts.length >= Math.min(limit, 15)) break;
  }
  if (!posts.length) {
    return { error: "Geen posts gevonden voor @" + username + " op de X-mirror." };
  }
  // Per post de statuspagina halen — hoofdpost = eerste activity-posts-blok
  let found = 0;
  const records = [];
  let idx = 0;
  while (idx < posts.length) {
    const batch = posts.slice(idx, idx + 4);
    const results = await Promise.all(batch.map((p) => bridgeFetch("https://twstalker.com/" + p.handle + "/status/" + p.id)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.error || r.status !== 200 || !r.body) continue;
      const block = r.body.split('class="activity-posts"')[1] || "";
      const media = mediaFromPostBlock(block);
      for (const m of media) {
        found++;
        if (seen.has(m.url)) continue;
        seen.add(m.url);
        records.push({
          category,
          image_url: m.url,
          gallery_url: "https://x.com/" + batch[j].handle + "/status/" + batch[j].id,
          description: m.desc,
          source: "twitter",
          kind: m.kind,
          created_at: new Date().toISOString(),
        });
      }
    }
    idx = idx + 4;
  }
  if (!records.length) {
    if (found) return { error: "De media van @" + username + " stond er al in — niets nieuws toegevoegd." };
    return { error: "Geen media (foto's/video's) gevonden in de laatste " + posts.length + " posts van @" + username + "." };
  }
  return { records: records, found: found, posts: posts.length, skipped_duplicates: found - records.length };
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
    if (!username || !/^@?[A-Za-z0-9_.]{1,20}$/.test(username)) {
      return Response.json({
        error: "Alleen @gebruiker-scrapes zijn mogelijk op X — zoeken op trefwoord ondersteunt de bron niet. Vul een @gebruiker in.",
      }, { status: 400 });
    }

    // Bestaande URL's — geen duplicaten (voor beide routes)
    const existing = await base44.asServiceRole.entities.PlaytimeImages.list("-created_date", 1000).catch(() => []);
    const seen = new Set((existing || []).map((r) => r.image_url));

    // ── Route 1: Scrape Creators — gewone accounts ───────────────────────
    const key = process.env.SCRAPECREATORS_API_KEY;
    let scNote = "";
    let tweets = [];
    if (key) {
      try {
        const apiRes = await fetch(
          "https://api.scrapecreators.com/v1/twitter/user-tweets?handle=" + encodeURIComponent(username) + "&trim=true",
          { headers: { "x-api-key": key, Accept: "application/json", "User-Agent": UA } },
        );
        if (apiRes.ok) {
          const json = await apiRes.json().catch(() => null);
          tweets = normalizeTweets(json).slice(0, limit);
        } else if (apiRes.status === 401) scNote = "API-key ongeldig";
        else if (apiRes.status === 402) scNote = "geen credits meer bij Scrape Creators";
        else if (apiRes.status === 429) scNote = "rate-limit bereikt bij Scrape Creators";
        // 404/5xx = meestal leeftijdsbeperkt of onzichtbaar voor de API -> stille doorval naar de mirror
      } catch (e) {
        scNote = String((e && e.message) || e).slice(0, 100);
      }
    } else {
      scNote = "geen SCRAPECREATORS_API_KEY ingesteld";
    }

    const records = [];
    let found = 0;
    let skipped = 0;
    for (const t of tweets) {
      const media = mediaListOf(t);
      const handle = handleOf(t, username);
      const id = tweetIdOf(t);
      const postUrl = id ? "https://x.com/" + handle + "/status/" + id : null;
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

    if (records.length) {
      let added = 0;
      for (let i = 0; i < records.length; i += 100) {
        const chunk = records.slice(i, i + 100);
        const created = await base44.asServiceRole.entities.PlaytimeImages.bulkCreate(chunk).catch(() => null);
        added += Array.isArray(created) ? created.length : chunk.length;
      }
      return Response.json({
        ok: true,
        via: "scrape-creators",
        username: "@" + username,
        category,
        tweets: tweets.length,
        found,
        added,
        skipped_duplicates: skipped,
        images: records.filter((r) => r.kind === "image").length,
        videos: records.filter((r) => r.kind === "video").length,
      });
    }

    // ── Route 2: X-mirror via de bridge — 18+/leeftijdsbeperkte accounts ──
    const mirror = await scrapeViaMirror(username, category, seen, limit);
    if (mirror.error) {
      return Response.json({
        error: String(mirror.error) + (scNote ? " (Scrape Creators gaf: " + scNote + ")" : ""),
      }, { status: 502 });
    }
    let mAdded = 0;
    for (let i = 0; i < mirror.records.length; i += 100) {
      const chunk = mirror.records.slice(i, i + 100);
      const created = await base44.asServiceRole.entities.PlaytimeImages.bulkCreate(chunk).catch(() => null);
      mAdded += Array.isArray(created) ? created.length : chunk.length;
    }
    return Response.json({
      ok: true,
      via: "x-mirror",
      username: "@" + username,
      category,
      posts: mirror.posts,
      found: mirror.found,
      added: mAdded,
      skipped_duplicates: mirror.skipped_duplicates || 0,
      images: mirror.records.filter((r) => r.kind === "image").length,
      videos: mirror.records.filter((r) => r.kind === "video").length,
    });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}