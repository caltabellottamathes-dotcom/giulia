import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const BLUE = "hsl(var(--life-blue))";
const SAND = "hsl(var(--life-sand))";
const iso = (d) => d.toISOString().slice(0, 10);

/** Personal Admin widget — aankomende betalingen/deadlines + achterstanden. */
export default function PersonalAdminWidget() {
  const { openModule } = usePanel();
  const { data: obligations, loading } = useEntityList("AdminObligation");

  const today = iso(new Date());
  const soon = useMemo(() => {
    const limit = new Date(Date.now() + 14 * 86400000);
    return (obligations || []).filter((o) => o.status !== "done" && o.due_date && new Date(o.due_date) <= limit);
  }, [obligations]);
  const overdue = soon.filter((o) => o.due_date < today);

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("personaladmin")} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.personClipboard} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/80 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Persoonlijk Admin</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] tabular-nums" style={{ color: SAND }}>{soon.length} eraan</span>
          </div>
        </div>
        <div className="flex-1 -mt-8 rounded-t-[24px] glass-3 p-5 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : soon.length ? (
            <div className="flex-1 flex flex-col gap-2.5">
              {overdue.length > 0 && (
                <p className="text-[11px] font-semibold" style={{ color: SAND }}>{overdue.length} te laat</p>
              )}
              {soon.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: o.due_date < today ? SAND : BLUE }} />
                  <p className="text-sm font-medium truncate flex-1">{o.title}</p>
                  <span className="text-[10px] text-ivory/45 tabular-nums shrink-0">{o.due_date?.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="flex-1 flex items-center justify-center text-xs text-ivory/55">Admin is bij</p>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}