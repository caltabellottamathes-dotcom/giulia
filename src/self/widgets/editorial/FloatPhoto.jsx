import React from "react";

/**
 * FloatPhoto — een foto-kaart met 4 afgeronde hoeken die als rustige regio
 * binnen het widget leeft (flex-child, shrink-0). Géen overlay, géen zweven;
 * de foto is deel van de widget en overlapt nooit info.
 */
export default function FloatPhoto({ src, className }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden border border-black/10 shrink-0 ${className || ""}`}>
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}