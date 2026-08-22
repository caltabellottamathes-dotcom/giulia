import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassPhotoLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { base44 } from "@/api/base44Client";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/9134a54f7_Good_Morning.jpeg";
const LIGHT = "hsl(var(--d-giulia-light))";
const DEEP = "hsl(var(--d-giulia-deep))";
const URGENT = "hsl(var(--d-giulia-urgent))";

/** GoodMorningWidget — "GOOD MORNING!" · G·21x9·L·SIDE (gelaagd).
 *  Foto-card links (geüploade foto). Glas-shell rechts: header met klok-icoon
 *  + de ingestelde wektijd in heel grote cijfers + een live aftelklok (HH:MM:SS)
 *  tot de wekker afgaat. Wektijd uit MorningSettings (fallback 07:00). */

export default function GoodMorningWidget() {
  const [alarm, setAlarm] = useState("07:00");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    base44.entities.MorningSettings.list("-created_date", 1)
      .then((r) => { if (r && r[0] && r[0].wake_time) setAlarm(r[0].wake_time); })
      .catch(() => {});
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [h, m] = alarm.split(":").map(Number);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const diff = next - now;
  const hh = Math.floor(diff / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const pad = (n) => String(n).padStart(2, "0");
  const countdownHHMM = `${pad(hh)}:${pad(mm)}`;
  const alarmStr = `${pad(h)}:${pad(m)}`;

  return (
    <div className="w-full max-w-[680px]">
      <GlassPhotoLayeredWidget
        shape="21:9"
        photo={PHOTO}
        photoPosition="left"
        photoFraction={0.36}
        overhang={0.06}
        domain="giulia"
        radius="large"
        photoOverlay="bg-gradient-to-t from-black/35 via-black/10 to-transparent"
        photoChildren={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-28 w-28">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}>
                  <span className="absolute top-0 left-1/2 h-3 w-3 -ml-1.5 rounded-full" style={{ background: i === 0 ? URGENT : LIGHT }} />
                </motion.div>
              ))}
              <span className="absolute inset-0 m-auto h-3.5 w-3.5 rounded-full" style={{ background: DEEP }} />
            </div>
          </div>
        }
      >
        <WidgetHeader type="briefing" label="GOOD MORNING!" />
        <div className="flex-1 flex flex-col justify-end items-end">
          <span className="text-[88px] font-display font-bold leading-none tracking-[-0.04em] tabular-nums" style={{ color: LIGHT, opacity: 0.32 }}>{countdownHHMM}</span>
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1 pb-3">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-2 w-2 rounded-full" style={{ background: i % 2 ? LIGHT : URGENT }}
                  animate={{ y: [0, -10, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }} />
              ))}
            </div>
            <span className="text-[88px] font-display font-bold leading-none tracking-[-0.04em] tabular-nums">{alarmStr}</span>
          </div>
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}