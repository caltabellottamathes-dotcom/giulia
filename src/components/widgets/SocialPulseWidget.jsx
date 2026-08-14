import React from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { socialPulse } from "@/lib/domainUtils";

const BLUE = "hsl(var(--life-blue))";
const BLUE_SOFT = "hsl(var(--life-blue-soft))";
const SAND = "hsl(var(--life-sand))";

/** Social Pulse widget — top mensen die aandacht nodig hebben. */
export default function SocialPulseWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const pulse = socialPulse(contacts);
  const overdue = pulse.filter((p) => p.overdue);
  const top = overdue.slice(0, 3);
  const alert = overdue.length > 2;

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("socialpulse")} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.portraitThinking} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/80 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Social Pulse</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] tabular-nums" style={{ color: BLUE_SOFT }}>{overdue.length} wacht</span>
          </div>
        </div>
        <div className="flex-1 -mt-8 rounded-t-[24px] glass-3 p-5 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : top.length ? (
            <div className="flex-1 flex flex-col gap-2.5">
              {top.map((p) => (
                <div key={p.contact.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: `${BLUE}22`, color: BLUE_SOFT }}>{(p.contact.name || "?").slice(0, 1).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.contact.name}</p>
                    <p className="text-[11px] text-ivory/50">{p.since === Infinity ? "nooit contact gehad" : `${p.since} dagen geleden`}</p>
                  </div>
                </div>
              ))}
              {alert && <p className="mt-1 text-[11px] font-semibold" style={{ color: SAND }}>{overdue.length} relaties vragen aandacht</p>}
            </div>
          ) : (
            <p className="flex-1 flex items-center justify-center text-xs text-ivory/55">Je netwerk is bij</p>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}