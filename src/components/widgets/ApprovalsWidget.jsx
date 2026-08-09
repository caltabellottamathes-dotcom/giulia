import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import CountUp from "./CountUp";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

/**
 * ApprovalsWidget — the pending count as the hero, the top item over a
 * branded photo, and two sculpted decision buttons.
 */
export default function ApprovalsWidget() {
  const { openModule } = usePanel();
  const { data: approvals, loading, reload } = useEntityList("Approval", { filter: { status: "pending" } });
  const top = approvals[0];
  const decide = async (e, id, status) => { e.stopPropagation(); try { await base44.entities.Approval.update(id, { status }); reload(); } catch {} };

  return (
    <WidgetShell size="2x1" radius="soft" interactive onClick={() => openModule("approvals")} className="min-h-[240px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Goedkeuringen" count={approvals.length ? `${approvals.length} wacht` : "leeg"} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : approvals.length > 0 ? (
          <>
            <div className="flex items-end gap-3">
              <CountUp value={approvals.length} className="text-6xl font-display font-semibold tracking-[-0.03em] leading-none text-current" />
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-1.5">wachten op jou</p>
            </div>
            <BrandPhoto src={IMAGES.leanChair} className="h-16 rounded-xl mt-4" overlay="bg-gradient-to-r from-charcoal/85 via-charcoal/35 to-transparent">
              <div className="absolute inset-0 flex items-center px-4">
                <p className="text-sm font-medium text-ivory line-clamp-2" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{top?.description}</p>
              </div>
            </BrandPhoto>
            <div className="flex gap-2 mt-4">
              <button onClick={(e) => decide(e, top.id, "approved")} className="flex-1 h-12 rounded-2xl font-semibold text-sm transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Goedkeuren</button>
              <button onClick={(e) => decide(e, top.id, "rejected")} className="flex-1 h-12 rounded-2xl font-semibold text-sm border border-current/15 text-current transition hover:bg-current/5">Afwijzen</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-display font-semibold opacity-30">0</span>
            <p className="text-sm opacity-50 mt-1">Niets staat open</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}