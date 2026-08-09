import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import CountUp from "./CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";

const SPINNER = <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>;

/**
 * EmailWidget — one question: how many unread, and how many need action now?
 * Hero is the oversized unread count; a bespoke inbox meter (segmented bar)
 * shows the fill, with urgent segments in the accent color.
 */
export default function EmailWidget() {
  const { openModule } = usePanel();
  const { data: emails, loading } = useEntityList("Email", { filter: { folder: "inbox" }, sort: "-created_date" });
  const unread = emails.filter((e) => e.status === "unread");
  const urgent = unread.filter((e) => e.important);
  const hero = unread.length;
  const next = unread[0];

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("email")} className="min-h-[300px]">
      <div className="p-6 flex flex-col h-full">
        <WidgetHeader label="Email" count={hero ? `${hero} ongelezen` : "alles gelezen"} />
        {loading ? SPINNER : (
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-end gap-3">
              <CountUp value={hero} className="text-[88px] leading-[0.85] font-display font-semibold tracking-[-0.04em] text-current" />
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-3">ongelezen</p>
            </div>

            <div className="mt-6 flex gap-1">
              {Array.from({ length: 14 }).map((_, i) => {
                const filled = i < hero;
                const isUrgent = i < urgent.length;
                return (
                  <span
                    key={i}
                    className="h-9 flex-1 rounded-[3px] transition-all duration-500"
                    style={filled
                      ? { background: isUrgent ? "var(--tile-accent)" : "currentColor", opacity: isUrgent ? 1 : 0.85 }
                      : { background: "currentColor", opacity: 0.1 }}
                  />
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-[12px] opacity-55 truncate">{next ? next.sender || "Onbekend" : "Inbox rustig"}</p>
              {urgent.length > 0 ? (
                <button onClick={(e) => { e.stopPropagation(); openModule("email"); }} className="rounded-full px-4 py-2 text-[12px] font-semibold transition hover:-translate-y-0.5 active:scale-95 shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
                  {urgent.length} nodig actie
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); openModule("email"); }} className="rounded-full px-4 py-2 text-[12px] font-semibold border border-ivory/15 text-current opacity-70 hover:opacity-100 transition shrink-0">
                  Open mail
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}