import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Users, ArrowRight } from "lucide-react";

export default function PeopleWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const visible = contacts.slice(0, 4);

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("people")} className="min-h-[220px]">
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
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Geen contacten</p>
          </div>
        )}

        <button onClick={(ev) => { ev.stopPropagation(); openModule("people"); }} className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition">
          Openen <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </WidgetShell>
  );
}