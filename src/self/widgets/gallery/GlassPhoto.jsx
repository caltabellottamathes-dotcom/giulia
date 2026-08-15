import React from "react";

/** PhotoCard — ronde-hoek fotokaart die BOVEN het glas zweeft: crisp,
 *  sterke slagschaduw, ring. De "card above glass" laag. */
export function PhotoCard({ src, className = "", style, caption, alt = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-[20px] shadow-[0_22px_48px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/8 ${className}`}
      style={style}>
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {caption && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <p className="absolute bottom-1.5 left-2.5 right-2.5 text-[8px] uppercase tracking-[0.18em] font-semibold text-white/90 leading-tight">{caption}</p>
        </>
      )}
    </div>
  );
}

/** BehindCard — ronde-hoek fotokaart die ONDER het glas ligt: de afbeelding
 *  is geblurd en gedempt, alsof je hem door matglas ziet. De "card below
 *  glass" laag. */
export function BehindCard({ src, className = "", style, dim = 0.2, alt = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] scale-105 ${className}`} style={style}>
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" style={{ filter: "blur(7px) saturate(0.85) brightness(0.96)" }} draggable={false} />
      <div className="absolute inset-0" style={{ background: `rgba(28,18,24,${dim})` }} />
    </div>
  );
}