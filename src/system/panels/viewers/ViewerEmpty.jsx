import React from "react";

export default function ViewerEmpty({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-20 px-6">
      <div className="h-14 w-14 rounded-2xl bg-ivory/8 flex items-center justify-center">
        {Icon ? <Icon className="h-7 w-7 text-ivory/45" /> : null}
      </div>
      <p className="text-sm text-ivory/65 max-w-xs">
        Geen {label} geselecteerd. Klik een bestand in je documenten om het hier te openen.
      </p>
    </div>
  );
}