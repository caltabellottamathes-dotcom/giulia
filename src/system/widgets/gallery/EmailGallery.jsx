import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT } from "./palette";

const A = ACCENT.focus;
const CATS = ["important", "newsletter", "advertising", "other"];

/** Email — "Hoeveel ongelezen?" Big count + categorie-verdeling. */
export default function EmailGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: emails } = useEntityList("Email", { realtime: true, externalTick: t });
  const unread = (emails || []).filter(e => e.status === "unread" && !e.deleted);
  const count = unread.length;
  const byCat = useMemo(() => { const m = {}; CATS.forEach(c => m[c] = 0); unread.forEach(e => { const c = e.category || "other"; if (m[c] != null) m[c]++; else m.other++; }); return m; }, [unread]);
  const total = unread.length || 1;
  const headline = count === 0 ? "INBOX NUL" : count <= 5 ? "BEHEERSBAAR" : "VEEL ONGELEZEN";
  const sub = count === 0 ? "Alles gelezen" : `${count} wachten op je`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("email")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Who's Texting?" count={count ? `${count} nieuw` : "leeg"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex items-end gap-1.5 h-12">
          {CATS.map((c, i) => {
            const v = byCat[c] || 0;
            return (
              <div key={c} className="flex-1 flex flex-col items-center gap-1">
                <motion.div className="w-full rounded-md" style={{ background: A, opacity: v ? 0.85 : 0.12 }}
                  initial={{ height: 6 }} animate={{ height: `${Math.max(6, (v / total) * 100)}%` }} transition={{ duration: 0.7, delay: i * 0.08 }} />
                <span className="text-[6px] uppercase tracking-wide opacity-40 font-semibold">{c.slice(0, 4)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.portraitBoot} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${byCat.important || 0} belangrijk · ${byCat.newsletter || 0} nieuws` : "Inbox schoon"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}