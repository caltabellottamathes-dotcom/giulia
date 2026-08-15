import React from "react";

/**
 * FloatPhoto — een foto-kaart die even breed (onder/boven) of even hoog
 * (links/rechts) is als de widget, met 4 afgeronde hoeken, géen overlay,
 * en altijd een stukje buiten de widget-rand. Laag via `className` (z-0
 * = onder het glas, z-20 = over het glas).
 */
const POS = {
  bottom: "left-0 right-0 -bottom-3",
  top: "left-0 right-0 -top-3",
  left: "top-0 bottom-0 -left-3",
  right: "top-0 bottom-0 -right-3",
};

export default function FloatPhoto({ src, edge = "bottom", size = "h-28", className }) {
  return (
    <div className={`absolute ${POS[edge]} ${size} rounded-2xl overflow-hidden border border-black/10 shadow-[0_18px_44px_-14px_rgba(0,0,0,0.4)] ${className || ""}`}>
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}