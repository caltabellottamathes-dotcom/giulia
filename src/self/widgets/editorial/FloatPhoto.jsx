import React from "react";

/**
 * FloatPhoto — een foto-kaart met 4 afgeronde hoeken die aan de widget
 * "geplakt" zit en altijd een stukje buiten de widget-rand zweeft. Nooit een
 * full-bleed achtergrond. Laag boven het glas (z-20).
 *
 * stick: bottom | top | left | right | top-right | bottom-right | bottom-left | top-left
 */
const POS = {
  bottom: "left-3 right-3 -bottom-3 h-24",
  top: "left-3 right-3 -top-3 h-20",
  left: "-left-3 top-3 bottom-3 w-28",
  right: "-right-3 top-3 bottom-3 w-28",
  "top-right": "-top-3 -right-3 w-24 h-24",
  "bottom-right": "-bottom-3 -right-3 w-24 h-24",
  "bottom-left": "-bottom-3 -left-3 w-24 h-24",
  "top-left": "-top-3 -left-3 w-24 h-24",
};

export default function FloatPhoto({ src, stick = "bottom", className, overlay, children }) {
  const ov = overlay || "linear-gradient(180deg, rgba(48,23,40,0.05), rgba(48,23,40,0.62))";
  return (
    <div className={`absolute ${POS[stick] || POS.bottom} rounded-2xl overflow-hidden border border-white/25 shadow-[0_18px_44px_-14px_rgba(0,0,0,0.55)] z-20 ${className || ""}`}>
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: ov }} />
      {children}
    </div>
  );
}