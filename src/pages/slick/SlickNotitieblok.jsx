import React, { useState } from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

export default function SlickNotitieblok() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div className="flex flex-col h-[60vh]">
      <Head title="Notitieblok" tag="Vrij denken" />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Schrijf vrij…
Laat ideeën, gedachten en verbindingen los. Niets hoeft af."
        className="flex-1 w-full resize-none rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4 text-slickstorm text-sm leading-relaxed outline-none focus:border-marble/50 placeholder:text-marble/40"
      />
      <div className="flex items-center justify-between mt-3 text-marble/50 text-[11px]">
        <span className="tabular-nums">{words} woorden</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-olive" /> Automatisch opgeslagen
        </span>
      </div>
    </div>
  );
}