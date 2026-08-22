import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GlassPhotoLayeredWidget, WidgetHeader, CountUp, URGENT } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/37aed6798_Waiting_on_You.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const IVORY = "hsl(var(--ivory))";

/** WaitingOnYouWidget — G·3x2·L·SIDE (gelaagd).
 *  Foto-card links: uploaded foto + grote live-tellende count van het totaal
 *  aantal open approvals. Glas-shell rechts: header "Waiting on you." +
 *  titel "Sign, seal and approve!" + grafische lijst met de 3 meest urgente
 *  approvals (klik opent het approval). Kleursysteem: GIULIA + Urgent. */
export default function WaitingOnYouWidget() {
  const { openModule } = usePanel();
  const { data: approvals, loading } = useEntityList("Approval", { filter: { status: "pending" }, realtime: true });

  const sorted = [...(approvals || [])].sort((a, b) => {
    const au = a.category === "urgent" ? 1 : 0;
    const bu = b.category === "urgent" ? 1 : 0;
    return bu - au;
  });
  const top3 = sorted.slice(0, 3);
  const total = (approvals || []).length;

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
            <CountUp value={total} className="text-[56px] font-display font-bold leading-[0.88] tracking-[-0.03em]" />
            <p className="text-[10px] uppercase tracking-[0.24em] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              wachten op jou
            </p>
          </div>
        }
      >
        <WidgetHeader type="pulse" label="Waiting on you." count={total ? `${total}` : ""} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">
          Sign, seal and approve!
        </h3>

        <div className="flex-1 min-h-2" />

        <div className="flex flex-col gap-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            </div>
          ) : top3.length > 0 ? (
            top3.map((a, i) => {
              const num = String(i + 1).padStart(2, "0");
              const urgent = a.category === "urgent";
              const color = urgent ? URGENT : i % 2 === 1 ? LIGHT : DEEP;
              return (
                <motion.button
                  key={a.id}
                  onClick={() => openModule("approvals")}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group flex items-center gap-3 w-full text-left rounded-xl px-2 py-2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-[18px] font-display font-bold tabular-nums leading-none" style={{ color }}>{num}</span>
                  <span className="w-[3px] self-stretch rounded-full" style={{ background: color, opacity: urgent ? 1 : 0.55 }} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] font-medium truncate" style={{ color: IVORY }}>{a.description}</span>
                    <span className="block text-[9px] uppercase tracking-[0.2em] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{a.type || a.action_type}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" style={{ color: IVORY }} />
                </motion.button>
              );
            })
          ) : (
            <p className="text-[11px] py-3" style={{ color: "rgba(255,255,255,0.6)" }}>Niets staat open.</p>
          )}
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}