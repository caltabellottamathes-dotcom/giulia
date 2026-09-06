/**
 * playtime_media_proxy — streamt externe media (X/Twitter-video's, Redgifs,
 * Reddit) vanuit deze app, zónder Referer mee te sturen. Deze CDN's weigeren
 * namelijk élk verzoek met een Referer (403 hotlink-blokkade), en een browser
 * <video>/<img> stuurt die altijd automatisch mee — vandaar dat video's in de
 * app nooit laadden terwijl dezelfde URL's wel degelijk werken.
 *
 * De browser vraagt de media dus via deze eigen URL. Range-requests gaan 1:1
 * door (206), dus de speler streamt en kan doorspoelen; responses mogen
 * gecached worden (week) zodat herhaald kijken direct gaat.
 *
 * Alleen whitelisted media-hosts — de functie is geen open proxy. De media-
 * URL's zelf (met tokens) zijn niet te raden.
 *
 * Aanroepen: GET /functions/playtime_media_proxy?u=<url>  (vanuit <video>).
 * Voor tests ook POST met JSON { u } of { url }.
 */
const ALLOWED_HOSTS = new Set([
  "video.twimg.com",
  "pbs.twimg.com",
  "media.redgifs.com",
  "v.redd.it",
  "i.redd.it",
  "preview.redd.it",
]);

const PASS_HEADERS = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

export default async function (req: Request): Promise<Response> {
  try {
    let target = null;
    try {
      target = new URL(req.url).searchParams.get("u");
    } catch {
      /* geen query-string */
    }
    if (!target && (req.method === "POST" || req.method === "PUT")) {
      const body = await req.json().catch(() => null);
      target = (body && (body.u || body.url)) || null;
    }
    if (!target) return Response.json({ error: "u (media-url) vereist" }, { status: 400 });

    let parsed;
    try {
      parsed = new URL(String(target));
    } catch {
      return Response.json({ error: "ongeldige url" }, { status: 400 });
    }
    if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
      return Response.json({ error: "host niet toegestaan" }, { status: 403 });
    }

    // Range doorsturen zodat streamen/doorspoelen werkt; géén Referer/Origin.
    const fwd: Record<string, string> = {};
    const range = req.headers.get("range");
    if (range) fwd["Range"] = range;

    const upstream = await fetch(parsed.toString(), { headers: fwd });
    const out = new Headers();
    for (const h of PASS_HEADERS) {
      const v = upstream.headers.get(h);
      if (v) out.set(h, v);
    }
    out.set("Cache-Control", "public, max-age=604800");
    out.set("Access-Control-Allow-Origin", "*");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}