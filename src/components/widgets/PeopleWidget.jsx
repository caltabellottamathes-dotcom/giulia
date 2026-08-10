import React from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

/** PeopleWidget — glass floats over a header photo; avatars + call on glass. */
export default function PeopleWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const top = contacts[0];
  const cluster = contacts.slice(0, 5);

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("people")} className="min-h-[208px]">
      <div className="flex flex-col h-full">
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.portraitThinking} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/80 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Mensen</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/70 tabular-nums">{contacts.length}</span>
          </div>
        </div>
        <div className="flex-1 -mt-8 rounded-t-[24px] glass-3 p-5 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : contacts.length > 0 ? (
            <>
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {cluster.map((c, i) => (
                    <span key={c.id} className="h-11 w-11 rounded-full border-2 border-ivory/20 flex items-center justify-center text-sm font-semibold" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)", zIndex: 10 - i }}>
                      {c.name?.slice(0, 1).toUpperCase()}
                    </span>
                  ))}
                </div>
                {contacts.length > cluster.length && <span className="ml-3 text-sm font-medium text-ivory/60">+{contacts.length - cluster.length}</span>}
              </div>
              <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ivory/45">Bellen</p>
                  <p className="text-sm font-semibold text-ivory truncate">{top?.name}</p>
                </div>
                <a href={top?.phone ? `tel:${top.phone}` : undefined} onClick={(e) => e.stopPropagation()} className={cn("h-11 px-5 rounded-2xl font-semibold text-sm flex items-center transition hover:-translate-y-0.5 active:scale-95", !top?.phone && "pointer-events-none opacity-40")} style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Bel</a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Geen contacten</p></div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}