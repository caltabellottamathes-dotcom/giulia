import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

const TYPE_MARK = { pdf: "PDF", image: "IMG", doc: "DOC", sheet: "XLS", figma: "FIG", other: "FILE" };
const TYPE_COLOR = { pdf: "bg-charcoal", image: "bg-olive", doc: "bg-charcoal", sheet: "bg-sand", figma: "bg-olive", other: "bg-charcoal" };

/**
 * DocumentsWidget — content as a fanned stack of cards (the top file's own
 * thumbnail, a color block with the type as typography, or a branded photo
 * fallback). A branded banner carries the count badge.
 */
export default function DocumentsWidget() {
  const { openModule } = usePanel();
  const { data: docs, loading, reload } = useEntityList("Document", { sort: "-created_date" });
  const favs = docs.filter((d) => d.status === "favorite");
  const top = docs[0];
  const stack = docs.slice(0, 3);

  const toggleFav = async (e, d) => { e.stopPropagation(); try { await base44.entities.Document.update(d.id, { status: d.status === "favorite" ? "recent" : "favorite" }); reload(); } catch {} };

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("documents")} className="min-h-[208px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Documenten" count={`${docs.length}`} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : docs.length > 0 ? (
          <div className="flex-1 flex items-center gap-5">
            <div className="relative w-24 h-28 shrink-0">
              {stack.map((d, i) => (
                <div key={d.id} className={cn("absolute inset-0 rounded-2xl overflow-hidden border border-ivory/15 float-shadow", i === 0 ? "z-30" : "z-20")} style={{ transform: `translate(${i * 6}px, ${i * 6}px) rotate(${i * 4}deg)` }}>
                  {i === 0 && (d.type === "image" && d.url
                    ? <img src={d.url} alt="" className="h-full w-full object-cover" />
                    : <div className={cn("h-full w-full flex items-center justify-center", TYPE_COLOR[d.type] || "bg-charcoal")}><span className="font-display font-bold text-lg tracking-tight text-ivory">{TYPE_MARK[d.type] || "FILE"}</span></div>
                  )}
                  {i > 0 && <img src={IMAGES.chairsScattered} alt="" className="h-full w-full object-cover opacity-80" draggable={false} />}
                </div>
              ))}
              <span className="absolute -top-2 -right-2 z-40 h-7 min-w-7 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{docs.length}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-current truncate">{top?.name}</p>
              <p className="text-[11px] opacity-50 truncate mt-0.5">{top?.owner || "Onbekend"}</p>
              <button onClick={(e) => toggleFav(e, top)} className={cn("mt-3 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition", top?.status === "favorite" ? "border-transparent" : "border-current/15 text-current")} style={top?.status === "favorite" ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" } : undefined}>
                {top?.status === "favorite" ? "Favoriet" : "Markeer favoriet"}
              </button>
              {favs.length > 0 && <p className="text-[11px] opacity-50 mt-2">{favs.length} favorieten</p>}
            </div>
          </div>
        ) : (
          <BrandPhoto src={IMAGES.chairsScattered} className="flex-1 rounded-2xl" overlay="bg-charcoal/45">
            <div className="absolute inset-0 flex items-center justify-center"><p className="text-sm text-ivory">Geen bestanden</p></div>
          </BrandPhoto>
        )}
      </div>
    </WidgetShell>
  );
}