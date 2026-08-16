import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_BOARDS, loadCustomBoards, createCustomBoard } from "@/lib/useDashboardBoard";

/**
 * BoardSwitcher — simpele links linksonder op Home. Wisselt het actieve
 * dashboard in-place. Vijf vaste boards + tijdelijke eigen boards (altijd
 * "NOW") + een knop om een leeg dashboard toe te voegen.
 */
export default function BoardSwitcher({ active, onSelect }) {
  const [custom, setCustom] = useState(loadCustomBoards());

  const addBoard = () => {
    const id = createCustomBoard("NOW");
    setCustom(loadCustomBoards());
    onSelect(id);
  };

  const all = [...DEFAULT_BOARDS, ...custom];

  return (
    <div className="fixed left-4 bottom-4 z-40 flex flex-wrap gap-1.5 items-center max-w-[calc(100vw-2rem)]">
      {all.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={cn(
            "rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition border",
            active === b.id
              ? "bg-ivory text-charcoal border-transparent"
              : "glass-1 text-ivory/70 border-white/12 hover:text-ivory hover:border-white/25"
          )}
        >
          {b.label}
        </button>
      ))}
      <button
        onClick={addBoard}
        title="Leeg dashboard toevoegen"
        className="rounded-full h-8 w-8 flex items-center justify-center glass-1 text-ivory/70 border border-white/12 hover:text-ivory hover:border-white/25 transition"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}