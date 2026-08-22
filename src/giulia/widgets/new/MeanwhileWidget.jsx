import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { GlassPhotoLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { fetchUnifiedCompleted, DOMAIN_META } from "@/lib/unifiedStream";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/cf4a8aa42_AchterdeSchermen.jpeg";
const IVORY = "hsl(var(--ivory))";

/** MeanwhileWidget — "Achter de schermen: MEANWHILE..." · G·3x2·R·SIDE (gelaagd).
 *  Foto-card rechts: uploaded foto + grote live-tellende count van wat er
 *  deze week achter de schermen is afgerond. Glas-shell links: header
 *  "Achter de schermen." + titel "MEANWHILE..." + grafische lijst van de
 *  recentste voltooide items (Focus / Self / Life), klik opent Updates.
 *  Kleursysteem: GIULIA + Urgent. */

export default function MeanwhileWidget() {
  const { openModule } = usePanel();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const list = await fetchUnifiedCompleted(8);
    setCompleted(list);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="w-full max-w-[620px]">
      <GlassPhotoLayeredWidget
        shape="3:2"
        photo={PHOTO}
        photoPosition="right"
        photoFraction={0.42}
        overhang={0.08}
        domain="giulia"
        radius="large"
        photoOverlay="bg-gradient-to-t from-black/55 via-black/15 to-transparent"
        photoChildren={
          <div className="absolute inset-0 p-4 flex flex-col justify-end" style={{ color: IVORY }}>
            <CountUp value={completed.length} className="text-[44px] font-display font-bold leading-[0.9] tracking-[-0.03em]" />
            <p className="text-[10px] uppercase tracking-[0.24em] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              klaar deze week
            </p>
          </div>
        }
      >
        <WidgetHeader type="pulse" label="Achter de schermen." count={completed.length ? `${completed.length}` : ""} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">
          MEANWHILE...
        </h3>

        <div className="flex-1 min-h-2" />

        <div className="flex flex-col gap-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-5 w-5 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            </div>
          ) : completed.length > 0 ? (
            completed.slice(0, 3).map((t, i) => {
              const meta = DOMAIN_META[t.domain] || DOMAIN_META.giulia;
              return (
                <motion.button
                  key={t.id + t.domain + i}
                  onClick={() => openModule("updates")}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group flex items-center gap-3 w-full text-left rounded-xl px-2 py-2 hover:bg-white/5 transition-colors"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <Check className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="block text-[12px] truncate" style={{ color: IVORY }}>{t.title}</span>
                  </span>
                </motion.button>
              );
            })
          ) : (
            <p className="text-[11px] py-3" style={{ color: "rgba(255,255,255,0.6)" }}>Nog niets afgerond.</p>
          )}
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}