/**
 * webSearch.ts — gratis web-zoekresultaten, zonder API-key of credits.
 * Bing HTML is de primaire route (werkt vanuit de cloud-runtime, geeft
 * titels + snippets); DuckDuckGo Lite is de fallback. Gemini-Search-
 * grounding viel af: alle eigen API-keys zitten tegen de grounding-quota
 * aan (429). De snippets geeft de search_web-tool (chatWithMattia) aan
 * het model terug zodat Mattia er het antwoord mee opbouwt.
 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MAX_RESULTS = 6;

function cleanText(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

// Bing wikkelt doel-URL's in /ck/a?...&u=a1<base64url>. DDG-lite gebruikt
// /l/?uddg=<urlencoded>.
function decodeUrl(href) {
  let url = String(href || "").replace(/&amp;/g, "&");
  const bingM = url.match(/[?&]u=a1([A-Za-z0-9_\-]+)/);
  if (bingM) {
    try {
      let b = bingM[1].replace(/-/g, "+").replace(/_/g, "/");
      while (b.length % 4) b += "=";
      const dec = atob(b);
      if (dec.startsWith("http")) return dec;
    } catch { /* val door naar de rauwe href */ }
  }
  const ddgM = url.match(/[?&]uddg=([^&]+)/);
  if (ddgM) { try { return decodeURIComponent(ddgM[1]); } catch { /* ignore */ } }
  return url;
}

async function fetchHtml(url, extraHeaders) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8", ...(extraHeaders || {}) },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

// ── Bing: <li class="b_algo"> blokken met h2><a href> en <p> snippet ──────
async function bingSearch(query) {
  const html = await fetchHtml("https://www.bing.com/search?q=" + encodeURIComponent(query) + "&count=10");
  if (!html) return [];
  const out = [];
  const chunks = html.split('<li class="b_algo"');
  for (const c of chunks.slice(1)) {
    const aM = c.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!aM) continue;
    const pM = c.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const title = cleanText(aM[2]);
    const url = decodeUrl(aM[1]);
    if (!title || !/^https?:\/\//.test(url)) continue;
    out.push({ title, url, snippet: cleanText(pM ? pM[1] : "").slice(0, 300) });
    if (out.length >= MAX_RESULTS) break;
  }
  return out;
}

// ── DuckDuckGo Lite: <a ... href> + <td class="result-snippet"> ────────────
async function ddgLiteSearch(query) {
  const html = await fetchHtml("https://lite.duckduckgo.com/lite/?q=" + encodeURIComponent(query));
  if (!html) return [];
  const out = [];
  const re = /<a[^>]*href="([^"]+)"[^>]*class='result-link'>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = cleanText(m[2]);
    const url = decodeUrl(m[1]);
    if (!title || !/^https?:\/\//.test(url)) continue;
    const after = html.slice(m.index, m.index + 2000);
    const sM = after.match(/<td class="result-snippet">([\s\S]*?)<\/td>/);
    out.push({ title, url, snippet: cleanText(sM ? sM[1] : "").slice(0, 300) });
    if (out.length >= MAX_RESULTS) break;
  }
  return out;
}

/** searchWeb(query) — zoekresultaten [{title, url, snippet}] of null bij falen. */
export async function searchWeb(query) {
  const q = String(query || "").trim().slice(0, 300);
  if (!q) return null;
  const bing = await bingSearch(q).catch(() => []);
  if (bing.length) return { engine: "bing", results: bing };
  const ddg = await ddgLiteSearch(q).catch(() => []);
  if (ddg.length) return { engine: "duckduckgo", results: ddg };
  return null;
}