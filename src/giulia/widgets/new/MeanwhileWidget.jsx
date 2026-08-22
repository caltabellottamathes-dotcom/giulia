import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { fetchUnifiedCompleted, DOMAIN_META } from "@/lib/unifiedStream";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/cf4a8aa42_AchterdeSchermen.jpeg";

/** MeanwhileWidget — "Achter de schermen: MEANWHILE..." · P·4:3·R·SIDE (gelaagd).
 *  Foto full-bleed als shell; links zichtbaar: eyebrow "Achter de schermen" +
 *  grote live-tellende count "klaar deze week". Glazen card rechts: header
 *  "MEANWHILE..." + een grafische timeline-lijst van recente voltooide items
 *  (Focus / Self / Life) met gekleurde dots op een verbindingslijn. Klik opent
 *  Updates. Visueel bewust anders dan Waiting on you (P i.p.v. G, timeline
 *  i.p.v. genummerde blokken). Kleursysteem: GIULIA + Urgent. */

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
      <PhotoGlassLayeredWidget
        shape="4:3"
        photo={PHOTO}
        glassPosition="right"
        glassFraction={0.48}
        overhang={0.08}
        domain="giulia"
        radius="large"
        glassBlur={8}
        overlay="bg-gradient-to-t from-black/50 via-black/15 to-transparent"
        photoChildren={
          <div className="absolute left-0 top-0 bottom-0 p-5 flex flex-col justify-end" style={{ width: "52%" }}>
            <span className="text-[9px] uppercase tracking-[0.32em] font-bold opacity-60 mb-1">Achter de schermen</span>
            <CountUp value={completed.length} className="text-[56px] font-display font-bold leading-[0.85] tracking-[-0.03em]" />
            <p className="text-[10px] uppercase tracking-[0.24em] opacity-70 mt-1">klaar deze week</p>
          </div>
        }
      >
        <WidgetHeader type="pulse" label="MEANWHILE..." />

        {/* timeline-lijst */}
        <div className="flex-1 flex flex-col justify-center min-h-0 pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-5 w-5 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            </div>
          ) : completed.length > 0 ? (
            <div className="relative pl-3">
              <span className="absolute left-[3px] top-2 bottom-2 w-px bg-white/15" />
              {completed.slice(0, 3).map((t, i) => {
                const meta = DOMAIN_META[t.domain] || DOMAIN_META.giulia;
                return (
                  <motion.button
                    key={t.id + t.domain + i}
                    onClick={() => openModule("updates")}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="group relative flex items-start gap-2.5 w-full text-left py-1.5"
                  >
                    <span className="absolute -left-3 top-2.5 h-2 w-2 rounded-full ring-2 ring-[rgba(48,50,55,0.65)]" style={{ background: meta.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[8.5px] uppercase tracking-[0.2em] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                      <span className="block text-[12px] truncate">{t.title}</span>
                    </div>
                    <Check className="h-3.5 w-3.5 shrink-0 mt-1 opacity-50" style={{ color: meta.color }} />
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] py-3 opacity-60">Nog niets afgerond.</p>
          )}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}