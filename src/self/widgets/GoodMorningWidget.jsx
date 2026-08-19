import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import WidgetShell from "../../system/widgets/WidgetShell";
import { Sunrise } from "lucide-react";

function minsUntil(wakeTime) {
  const [h, m] = (wakeTime || "07:30").split(":").map(Number);
  const now = new Date();
  let mins = (h - now.getHours()) * 60 + (m - now.getMinutes());
  if (mins < 0) mins += 1440;
  return mins;
}

export default function GoodMorningWidget() {
  const { openModule } = usePanel();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    const s = await base44.entities.MorningSettings.list().catch(() => []);
    setSettings(s[0] || null);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!settings?.enabled || !settings.wake_time) return;
    const check = () => {
      const now = new Date();
      const [h, m] = settings.wake_time.split(":").map(Number);
      const today = new Date().toLocaleDateString("sv-SE");
      if (now.getHours() === h && now.getMinutes() === m && sessionStorage.getItem("giulia_wake_fired") !== today) {
        sessionStorage.setItem("giulia_wake_fired", today);
        navigate("/wake");
      }
    };
    check();
    const i = setInterval(check, 20000);
    return () => clearInterval(i);
  }, [settings, navigate]);

  const enabled = settings?.enabled && settings.wake_time;
  const mins = enabled ? minsUntil(settings.wake_time) : null;
  const soon = enabled && mins <= 30;

  return (
    <WidgetShell size="2x1" radius="large" interactive onClick={() => openModule("goodmorning")} className="min-h-[176px]">
      <div className="relative h-full p-5 flex flex-col justify-between overflow-hidden">
        {enabled && (
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-full transition-all duration-[3000ms] ease-out pointer-events-none"
            style={{
              width: soon ? "130%" : "55%",
              height: soon ? "130%" : "55%",
              background: "radial-gradient(circle, rgba(210,185,140,0.30), transparent 70%)",
              filter: "blur(32px)",
              opacity: soon ? 1 : 0.45,
            }}
          />
        )}
        <div className="relative flex items-center gap-2 text-current/60">
          <Sunrise className="h-3.5 w-3.5" />
          <p className="text-[10px] uppercase tracking-[0.28em] font-semibold">Good Morning!</p>
        </div>
        <div className="relative">
          {enabled ? (
            <>
              <p className="font-display font-light text-current leading-none tracking-tight" style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}>
                {settings.wake_time}
              </p>
              <p className="text-[12px] text-current/65 mt-1.5">{mins <= 1 ? "Wake-up" : `Wake-up in ${mins} min`}</p>
            </>
          ) : (
            <>
              <p className="font-display font-light text-current text-lg leading-tight">Set your wake-up time.</p>
              <p className="text-[11px] text-current/50 mt-1">Giulia wakes you gradually.</p>
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}