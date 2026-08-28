import React from "react";

const GLASS = { background: "rgba(20,22,26,0.45)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.12)" };

export default function ViewerEmpty({ icon: Icon, label }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center gap-3 rounded-2xl px-6 py-8 max-w-xs" style={GLASS}>
        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
          {Icon ? <Icon className="h-7 w-7 text-ivory/85" /> : null}
        </div>
        <p className="text-sm text-ivory/95 max-w-xs">
          Geen {label} geselecteerd. Klik een bestand in je documenten om het hier te openen.
        </p>
      </div>
    </div>
  );
}