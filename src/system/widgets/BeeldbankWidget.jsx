import React from "react";
import { Link } from "react-router-dom";
import { useBeeldbank } from "@/lib/BeeldbankContext";
import { IMAGES } from "@/lib/images";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { Camera, ArrowUpRight } from "lucide-react";

const MONTAGE = [IMAGES.feetChair, IMAGES.walkChairsBeach, IMAGES.portraitThinking, IMAGES.leanChair];

/**
 * BeeldbankWidget — dashboard-tegel. Toont een montage + teller, schakelt de
 * beeldbank-modus in (klik elke foto in de app om te wisselen) en linkt naar
 * de volledige Beeldbank-pagina.
 */
export default function BeeldbankWidget() {
  const { mode, toggleMode, assets } = useBeeldbank();
  const total = Object.keys(IMAGES).length + (assets?.length || 0);

  return (
    <WidgetShell size="2x1" radius="medium" className="min-h-[176px]">
      <div className="p-4 h-full flex flex-col text-ivory">
        <WidgetHeader label="Beeldbank" count={total} />
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl overflow-hidden mt-1">
          {MONTAGE.map((u, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img src={u} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ivory/60 leading-relaxed">
          Alle foto's in je systeem. Klik een foto in de app om hem te wisselen.
        </p>
        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            onClick={toggleMode}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-semibold transition ${
              mode ? "bg-olive text-ivory" : "bg-ivory/10 hover:bg-ivory/20 text-ivory border border-ivory/15"
            }`}
          >
            <Camera className="h-3.5 w-3.5" /> {mode ? "Modus aan" : "Beeldbank modus"}
          </button>
          <Link
            to="/beeldbank"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory border border-ivory/15"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </WidgetShell>
  );
}