import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Users, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PeopleWidget — tap-to-call a contact inline via a tel: link.
 */
export default function PeopleWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const visible = contacts.slice(0, 4);

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("people")} className="min-h-[240px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Users} label="Mensen" count={`${contacts.length}`} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {visible.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-full bg-olive/15 border border-olive/25 flex items-center justify-center text-[11px] font-semibold text-olive shrink-0">
                  {c.name?.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                  <p className="text-[10px] text-foreground/50 truncate">{c.role ? `${c.role}${c.company ? " · " + c.company : ""}` : c.company || ""}</p>
                </div>
                <a
                  href={c.phone ? `tel:${c.phone}` : undefined}
                  onClick={(e) => e.stopPropagation()}
                  className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition shrink-0", c.phone ? "bg-olive/15 text-olive hover:bg-olive/25" : "bg-foreground/5 text-foreground/25 pointer-events-none")}
                  aria-label="Bellen"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Geen contacten</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}