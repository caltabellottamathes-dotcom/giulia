import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { cn } from "@/lib/utils";

/**
 * PeopleWidget — relationships as an overlapping avatar cluster (a bespoke
 * group mark, never a name list). The top contact gets a sculpted "Bel"
 * call-to-action.
 */
export default function PeopleWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const top = contacts[0];
  const cluster = contacts.slice(0, 5);

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("people")} className="min-h-[240px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Mensen" count={`${contacts.length}`} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
        ) : contacts.length > 0 ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {cluster.map((c, i) => (
                  <span
                    key={c.id}
                    className="h-12 w-12 rounded-full border-2 border-ivory/30 flex items-center justify-center text-sm font-semibold"
                    style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)", zIndex: 10 - i }}
                  >
                    {c.name?.slice(0, 1).toUpperCase()}
                  </span>
                ))}
              </div>
              {contacts.length > cluster.length && (
                <span className="ml-3 text-sm font-medium opacity-60">+{contacts.length - cluster.length}</span>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider opacity-45">Bellen</p>
                <p className="text-sm font-semibold text-current truncate">{top?.name}</p>
              </div>
              <a
                href={top?.phone ? `tel:${top.phone}` : undefined}
                onClick={(e) => e.stopPropagation()}
                className={cn("h-12 px-5 rounded-2xl font-semibold text-sm flex items-center transition hover:-translate-y-0.5 active:scale-95", !top?.phone && "pointer-events-none opacity-40")}
                style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}
              >
                Bel
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Geen contacten</p></div>
        )}
      </div>
    </WidgetShell>
  );
}