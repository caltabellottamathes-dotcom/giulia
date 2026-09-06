/**
 * proxiedMedia — route externe media-CDN's die hotlinken blokkeren
 * (video.twimg.com, media.redgifs.com, Reddit-media) via de eigen
 * playtime_media_proxy backend-functie. Die stuurt de media zonder Referer
 * door en geeft Range-requests 1:1 door, zodat <video>-spelers gewoon
 * direct streamen. Andere URL's (eigen uploads, imagefap) blijven ongewijzigd.
 */
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
  return "/functions/playtime_media_proxy?u=" + encodeURIComponent(url);
}