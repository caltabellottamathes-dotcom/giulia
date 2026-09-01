/**
 * imageParts.ts — gedeelde helper om afbeeldingsbijlagen om te zetten naar
 * inline Gemini vision-parts (base64). Gebruikt door chatWithGiulia en
 * chatWithMattia, zodat beide agents foto's kunnen ontvangen en zien
 * (Gemma/Gemini vision) in plaats van alleen een tekstverwijzing.
 */
export async function buildImageParts(attachments) {
  const parts = [];
  for (const a of attachments) {
    if (!a || a.type !== "image" || !a.url) continue;
    try {
      const ext = (a.name || "").split(".").pop().toLowerCase();
      const mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : "image/jpeg";
      const buf = await fetch(a.url).then((r) => r.arrayBuffer());
      if (!buf || buf.byteLength > 12 * 1024 * 1024) continue;
      const bytes = new Uint8Array(buf);
      let bin = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      parts.push({ inlineData: { mimeType: mime, data: btoa(bin) } });
    } catch { /* ignore */ }
  }
  return parts;
}