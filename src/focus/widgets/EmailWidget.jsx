import React from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import WidgetHeader from "../../system/widgets/WidgetHeader";
import CountUp from "../../system/widgets/CountUp";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

/**
 * EmailWidget — oversized unread count with a bespoke inbox meter; a branded
 * photo floats full-width over the bottom of the glass with rounded corners.
 */
export default function EmailWidget() {
  const { openModule } = usePanel();
  const { data: emails, loading } = useEntityList("Email", { filter: { folder: "inbox" }, sort: "-created_date" });
  const unread = emails.filter((e) => e.status === "unread");
  const urgent = unread.filter((e) => e.important);
  const hero = unread.length;
  const next = unread[0];

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("email")} className="min-h-[260px]">
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Online Postoffice." count={hero ? `${hero} ongelezen` : "alles gelezen"} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="flex items-end gap-3">
              <CountUp value={hero} className="text-[84px] leading-[0.85] font-display font-semibold tracking-[-0.04em] text-current" />
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-3">ongelezen</p>
            </div>
            <div className="mt-5 flex gap-1">
              {Array.from({ length: 14 }).map((_, i) => {
                const filled = i < hero;
                const isUrgent = i < urgent.length;
                return (
                  <span key={i} className="h-8 flex-1 rounded-[3px] transition-all duration-500" style={filled ? { background: isUrgent ? "hsl(var(--d-focus-urgent))" : "currentColor", opacity: isUrgent ? 1 : 0.85 } : { background: "currentColor", opacity: 0.1 }} />
                );
              })}
            </div>
            <div className="flex-1" />
          </>
        )}
      </div>
      {!loading && (
        <BrandPhoto
          src={IMAGES.portraitBoot}
          className="h-24 w-full -mt-8 rounded-t-[24px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.28)]"
          overlay="bg-gradient-to-t from-charcoal/40 via-transparent to-transparent"
        >
          <div className="absolute inset-0 flex items-center justify-between px-6">
            <p className="text-sm font-semibold text-ivory truncate" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{next ? next.sender || "Onbekend" : "Inbox rustig"}</p>
            {urgent.length > 0 ? (
              <button onClick={(e) => { e.stopPropagation(); openModule("email"); }} className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition hover:-translate-y-0.5 active:scale-95 shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
                {urgent.length} nodig actie
              </button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); openModule("email"); }} className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold border border-ivory/30 text-ivory transition hover:bg-ivory/10 shrink-0">Open mail</button>
            )}
          </div>
        </BrandPhoto>
      )}
    </WidgetShell>
  );
}