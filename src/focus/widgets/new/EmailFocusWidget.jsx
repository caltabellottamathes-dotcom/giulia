import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";

const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const URGENT = "hsl(var(--d-focus-urgent))";

const fmtDay = (iso) => { try { return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }); } catch { return ""; } };

/**
 * EmailFocusWidget — P·9x16·B·SIDE · "Online Postoffice."
 * Foto = focusMetalGloves (geborsteld metaal + handschoenen). Foto-kant:
 * header + XL ongelezen-telling. Glass-card: afzender-stapel met urgent-geel
 * voor belangrijke mail.
 */
export default function EmailFocusWidget() {
  const { openModule } = usePanel();
  const { data: emails } = useEntityList("Email", { sort: "-created_date", limit: 80, realtime: true });

  const unread = useMemo(() => (emails || []).filter((e) => e.status === "unread").slice(0, 5), [emails]);
  const count = (emails || []).filter((e) => e.status === "unread").length;
  const important = (emails || []).filter((e) => e.status === "unread" && (e.important || e.category === "important")).length;

  return (
    <div className="w-full h-[440px]">
      <PhotoGlassLayeredWidget
        shape="9:16"
        photo={IMAGES.focusMetalGloves}
        glassPosition="bottom"
        glassFraction={0.5}
        overhang={0.06}
        domain="focus"
        radius="large"
        onClick={() => openModule("email")}
        overlay="bg-gradient-to-t from-zinc-900/55 via-zinc-900/20 to-transparent"
        photoChildren={
          <div className="absolute inset-0 flex flex-col p-4 text-ivory">
            <WidgetHeader type="social" label="Online Postoffice." count={count ? String(count) : ""} />
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">INBOX, SORTED.</h3>
            <div className="flex items-end gap-2 mt-2">
              <motion.span className="text-[44px] font-display font-semibold leading-none tabular-nums" style={{ color: LIGHT }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>{count}</motion.span>
              <span className="text-[10px] uppercase tracking-[0.18em] pb-1 text-ivory/50">ongelezen{important ? ` · ${important} belangrijk` : ""}</span>
            </div>
            <div className="flex-1" />
          </div>
        }
      >
        <div className="flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {unread.length === 0 ? (
            <p className="text-[11px] text-ivory/60 px-1 py-1">Inbox leeg.</p>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar -mx-1 px-1">
              {unread.map((m, i) => {
                const imp = m.important || m.category === "important";
                return (
                  <div key={m.id || i} className="flex items-start gap-2.5 py-1.5 border-b border-white/10 last:border-0">
                    <span className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ background: imp ? URGENT : DEEP }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium leading-tight truncate text-ivory">{m.sender || m.sender_email || "Onbekend"}</p>
                      <p className="text-[10px] text-ivory/55 truncate">{m.subject}</p>
                    </div>
                    {m.timestamp && <span className="text-[9px] text-ivory/40 shrink-0 pt-0.5">{fmtDay(m.timestamp)}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}