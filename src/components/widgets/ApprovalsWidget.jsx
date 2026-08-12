import React from "react";
import WidgetShell from "./WidgetShell";
import CountUp from "./CountUp";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

/** ApprovalsWidget — glass floats over a header photo that carries the count. */
export default function ApprovalsWidget() {
  const { openModule } = usePanel();
  const { data: approvals, loading, reload } = useEntityList("Approval", { filter: { status: "pending" }, realtime: true });
  const top = approvals[0];
  const decide = async (e, id, status) => { e.stopPropagation(); try { await base44.entities.Approval.update(id, { status }); reload(); } catch {} };

  return (
    <WidgetShell size="2x1" radius="soft" interactive onClick={() => openModule("approvals")} className="min-h-[208px]">
      <div className="flex flex-col h-full">
        <div className="relative h-28 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.leanChair} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-charcoal/10" />
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Goedkeuringen</h3>
            <div className="flex items-end gap-2">
              <CountUp value={approvals.length} className="text-5xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/70 mb-1.5">wachten op jou</p>
            </div>
          </div>
        </div>
        <div className="flex-1 -mt-8 rounded-t-[24px] glass-3 p-4 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : approvals.length > 0 ? (
            <>
              <p className="text-sm font-medium text-ivory line-clamp-2">{top?.description}</p>
              {top?.assignee && (
                <span className={`mt-2 self-start text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${top.assignee === "giulia" ? "bg-steel/25 text-ivory/80" : "bg-olive/30 text-ivory"}`}>
                  {top.assignee === "giulia" ? "Voor Giulia" : "Voor jou"}
                </span>
              )}
              <div className="mt-auto pt-3 flex gap-2">
                <button onClick={(e) => decide(e, top.id, "approved")} className="flex-1 h-11 rounded-2xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Goedkeuren</button>
                <button onClick={(e) => decide(e, top.id, "rejected")} className="flex-1 h-11 rounded-2xl font-semibold text-sm border border-ivory/20 text-ivory transition hover:bg-ivory/10">Afwijzen</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-display font-semibold text-ivory/30">0</span>
              <p className="text-sm text-ivory/55 mt-1">Niets staat open</p>
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}