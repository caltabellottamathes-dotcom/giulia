import React from "react";
import { Image } from "@/components/ui/image";
import { proxiedMedia } from "@/lib/mediaProxy";

const IMG_EXT = ["png", "jpg", "jpeg", "gif", "webp"];
const VID_EXT = ["mp4", "mov", "webm", "mkv"];
const AUD_EXT = ["mp3", "wav", "m4a", "flac", "aac", "ogg"];

/** ChatMessageText — berichttekst met klikbare links. Afbeelding-URL's
 *  renderen inline als thumbnail; klik opent hem vergroot (MediaStage /
 *  fullscreen viewer) via onOpenMedia({ name, url, type }). */
export default function ChatMessageText({ text, linkColor, onOpenMedia }) {
  if (!text) return null;
  const re = /(https?:\/\/[^\s)]+)/g;
  const out = [];
  let last = 0; let m; let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    const url = m[0].replace(/[)\]>"'.,;:!?]+$/, "");
    const ext = url.split(".").pop().split("?")[0].toLowerCase();
    const isImage = IMG_EXT.includes(ext) || /format=(jpe?g|png|webp|gif)/i.test(url);
    const isVideo = VID_EXT.includes(ext);
    if (isImage) {
      out.push(
        <span key={k++} className="mt-1.5 mb-0.5 block">
          <button
            type="button"
            onClick={() => onOpenMedia?.({ name: "Mattia", url, type: "image" })}
            className="block rounded-md overflow-hidden border hover:opacity-85 transition"
            style={{ borderColor: "rgba(0,0,0,0.15)" }}
          >
            <Image src={url} fittingType="fill" alt="Mattia" className="w-40 h-28" />
          </button>
        </span>
      );
    } else if (isVideo) {
      // Video → direct zichtbaar als inline spelende tile (gedempt, herhalend);
      // klik opent hem groot in de MediaStage-viewer.
      out.push(
        <span key={k++} className="mt-1.5 mb-0.5 block">
          <button
            type="button"
            onClick={() => onOpenMedia?.({ name: "Mattia", url, type: "video" })}
            className="block rounded-md overflow-hidden border hover:opacity-85 transition"
            style={{ borderColor: "rgba(0,0,0,0.15)" }}
          >
            <video src={proxiedMedia(url)} muted loop playsInline autoPlay preload="auto"
              className="w-40 h-28 object-cover bg-black" />
          </button>
        </span>
      );
    } else if (AUD_EXT.includes(ext) || ext === "pdf") {
      const type = AUD_EXT.includes(ext) ? "audio" : "doc";
      out.push(
        <button key={k++} type="button" onClick={() => onOpenMedia?.({ name: "Mattia", url, type })}
          className="underline underline-offset-2 hover:opacity-70 transition break-all" style={{ color: linkColor }}>
          {url}
        </button>
      );
    } else {
      out.push(
        <a key={k++} href={url} target="_blank" rel="noreferrer"
          className="underline underline-offset-2 hover:opacity-70 transition break-all" style={{ color: linkColor }}>
          {url}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>);
  return out;
}