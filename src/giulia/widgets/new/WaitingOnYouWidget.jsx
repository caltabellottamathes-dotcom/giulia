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

/** WaitingOnYouWidget — G·3x2·R·SIDE (gelaagd).
 *  Foto-card rechts: uploaded foto + énorme live-tellende count van open
 *  approvals. Glas-shell links: header "Waiting on you." + sterke, korte
 *  rijen — per approval een 3-woord-samenvatting (geen lange tekst meer).
 *  Kleursysteem: GIULIA + Urgent. */

const STOP = new Set(["the", "a", "an", "de", "het", "een", "en", "van", "te", "dat", "die", "is", "voor", "met", "to", "for", "and", "of", "in", "on", "at", "by", "je", "jouw", "uw", "this", "that", "with", "your"]);

function threeWordSummary(a) {
  let src = (a.description || a.title || a.action_type || a.type || "").toString().trim();
  if (!src) src = "Wacht op jou";
  let words = src.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}\u2013-]/gu, "")).filter((w) => w.length > 1 && !STOP.has(w.toLowerCase()));
  if (words.length < 3) {
    const all = (a.description || a.title || src).split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}\u2013-]/gu, "")).filter(Boolean);
    words = all;
  }
  const fill = ["wacht", "op", "jou"];
  let i = 0;
  while (words.length < 3) words.push(fill[i++ % 3]);
  return words.slice(0, 3);
}

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
        photoOverlay="bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        photoChildren={
          <div className="absolute inset-0 p-5 flex flex-col justify-end" style={{ color: IVORY }}>
            <CountUp value={total} className="text-[88px] font-display font-bold leading-[0.82] tracking-[-0.04em]" />
            <p className="text-[10px] uppercase tracking-[0.28em] mt-2" style={{ color: "rgba(255,255,255,0.78)" }}>
              wachten op jou
            </p>
          </div>
        }
      >
        <WidgetHeader type="tasks" label="Waiting on you." count={total ? `${total}` : ""} />

        <div className="flex-1 min-h-2" />

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-5">
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            </div>
          ) : top3.length > 0 ? (
            top3.map((a, i) => {
              const num = String(i + 1).padStart(2, "0");
              const urgent = a.category === "urgent";
              const color = urgent ? URGENT : i % 2 === 1 ? LIGHT : DEEP;
              const words = threeWordSummary(a);
              return (
                <motion.button
                  key={a.id}
                  onClick={() => openModule("approvals")}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group flex items-center gap-3 w-full text-left rounded-xl px-2 py-2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-[13px] font-mono font-bold tabular-nums leading-none" style={{ color }}>{num}</span>
                  <span className="w-[3px] self-stretch rounded-full" style={{ background: color, opacity: urgent ? 1 : 0.6 }} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-display font-bold uppercase tracking-[0.01em] leading-tight truncate" style={{ color: IVORY }}>
                      {words.join(" ")}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" style={{ color: IVORY }} />
                </motion.button>
              );
            })
          ) : (
            <p className="text-[12px] py-4 font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Niets staat open.</p>
          )}
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}