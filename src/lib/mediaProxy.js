/**
 * proxiedMedia — route externe media-CDN's die hotlinken blokkeren
 * (video.twimg.com, media.redgifs.com, Reddit-media) via de eigen
 * playtime_media_proxy backend-functie. Die stuurt de media zonder Referer
 * door en geeft Range-requests 1:1 door, zodat <video>-spelers gewoon
 * direct streamen. Andere URL's (eigen uploads, imagefap) blijven ongewijzigd.
 *
 * Absolute URL naar de gepubliceerde functie: een <video src> kan niet via
 * de SDK, en de absolute URL werkt overal — builder-preview én gepubliceerde
 * app. De functie zet zelf Access-Control-Allow-Origin: *, dus cross-origin
 * laden in de preview is geen probleem.
 */
const PROXY_URL = "https://giulia-os-flow.base44.app/functions/playtime_media_proxy?u=";
const PROXY_HOSTS = ["video.twimg.com", "media.redgifs.com", "v.redd.it", "i.redd.it", "preview.redd.it"];

export function proxiedMedia(url) {
  if (!url) return url;
  let u;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  if (!PROXY_HOSTS.includes(u.hostname)) return url;
  return PROXY_URL + encodeURIComponent(url);
}