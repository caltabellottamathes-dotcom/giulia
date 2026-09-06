/**
 * imagefap.ts — gedeelde scraping-hulpstukken voor de Playtime-collectie.
 * ImageFap galerijpagina's bevatten alleen thumbnails; de echte full-afbeeldingen
 * staan (met token-gebonden secure-links) op de losse fotopagina's. Die tokens
 * verlopen snel, dus slaat de scraper naast image_url ook photo_url op en lost
 * get_playtime_image de afbeelding live opnieuw op.
 */

export const IFAP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function ifapFetchText(url: string, timeoutMs = 15000) {
  const res = await fetch(url, {
    headers: { "User-Agent": IFAP_UA, Accept: "text/html,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} voor ${url}`);
  return await res.text();
}

/** Foto-referenties (id → fotopagina-URL) uit galerij-HTML. Dekt zowel
 *  absolute als relatieve /photo/<id>/ links en de oude photo.php?pid=-indeling. */
export function ifapPhotoRefs(html: string) {
  const refs = new Map();
  let m;
  const reAbs = /https?:\/\/(?:www\.)?imagefap\.com\/photo\/(\d{1,15})/gi;
  while ((m = reAbs.exec(html)) !== null) refs.set(m[1], `https://www.imagefap.com/photo/${m[1]}/`);
  const reRel = /\/photo\/(\d{1,15})/g;
  while ((m = reRel.exec(html)) !== null) refs.set(m[1], `https://www.imagefap.com/photo/${m[1]}/`);
  const rePid = /photo\.php\?[^"'\s<>]*pid=(\d{1,15})/gi;
  while ((m = rePid.exec(html)) !== null) refs.set(m[1], `https://www.imagefap.com/photo.php?pid=${m[1]}`);
  return refs;
}

/** Alle directe full-afbeelding-URL's uit een pagina. */
export function ifapAllFullUrls(html: string) {
  const re = /https?:\/\/cdn[a-z]?\.imagefap\.com\/images\/full\/\d+\/\d+\/\d+\.(?:jpe?g|png|webp)(?:\?[^\s"'<>\)]+)?/gi;
  return [...new Set(html.match(re) || [])];
}

/** De full-afbeelding voor een foto-id uit fotopagina-HTML — first try
 *  op de eigen id, anders de eerste full op de pagina. */
export function ifapFullUrl(html: string, photoId?: string | null): string | null {
  const all = ifapAllFullUrls(html);
  if (photoId) {
    const hit = all.find((u) => u.includes(`/${photoId}.`));
    if (hit) return hit;
  }
  return all[0] || null;
}