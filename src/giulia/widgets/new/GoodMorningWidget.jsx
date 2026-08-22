import React, { useEffect, useState } from "react";
import { GlassPhotoLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { base44 } from "@/api/base44Client";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/9134a54f7_Good_Morning.jpeg";

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
  const ss = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const countdown = `${pad(hh)} : ${pad(mm)} : ${pad(ss)}`;

  return (
    <div className="w-full max-w-[680px]">
      <GlassPhotoLayeredWidget
        shape="21:9"
        photo={PHOTO}
        photoPosition="left"
        photoFraction={0.40}
        overhang={0.06}
        domain="giulia"
        radius="large"
        photoOverlay="bg-gradient-to-t from-black/35 via-black/10 to-transparent"
      >
        <WidgetHeader type="briefing" label="GOOD MORNING!" />
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[88px] font-display font-bold leading-none tracking-[-0.04em]">{alarm}</div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-[20px] font-mono tabular-nums tracking-[0.06em]">{countdown}</span>
            <span className="text-[9px] uppercase tracking-[0.24em] opacity-50">tot de wekker</span>
          </div>
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}