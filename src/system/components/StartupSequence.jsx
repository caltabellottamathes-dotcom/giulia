import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { VIDEOS } from "@/lib/images";
import { bumpRefresh } from "@/lib/refreshBus";

/**
 * StartupSequence — het opstartscherm: speelt de dagopstart-video en zet
 * tegelijk het héle systeem op gang (startGiulia → sync + leider + task-agent;
 * refreshDashboard → actueel inzicht; bumpRefresh → alle widgets/panelen
 * verversen). Eens per sessie; daarna gewone dashboard.
 */
export default function StartupSequence({ onDone }) {
  const videoRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("giulia_boot_seen", "1");
    // 1) de echte opstartprocedure — sync + leider + task-agent
    base44.functions.invoke("startGiulia", {}).catch(() => {});
    // 2) actueel dashboard-inzicht synthetiseren, daarna alles verversen
    base44.functions.invoke("refreshDashboard", {})
      .then(() => bumpRefresh())
      .catch(() => {});
    // safety: ook na een paar seconden forceren, voor het geval de functie traag is
    const t = setTimeout(() => bumpRefresh(), 5000);
    return () => clearTimeout(t);
  }, []);

  const finish = () => { try { onDone && onDone(); } catch { /* ignore */ } };

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="fixed inset-0 z-[80] bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={VIDEOS.giuliaOpening}
        autoPlay
        muted
        playsInline
        onEnded={finish}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

      <button
        onClick={finish}
        className="absolute top-6 right-6 z-10 text-[11px] uppercase tracking-[0.22em] text-ivory/55 hover:text-ivory/95 transition px-4 py-2 rounded-full border border-ivory/20 backdrop-blur-md"
      >
        Overslaan
      </button>

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-[14vh] px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-[11px] uppercase tracking-[0.3em] text-ivory/70 mb-3 font-medium"
        >
          {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="text-4xl sm:text-6xl font-display font-semibold tracking-[-0.02em] text-ivory leading-none"
        >
          {greet}, Salvo.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-4 text-sm text-ivory/65 max-w-md leading-relaxed"
        >
          Giulia start op — agenda, mail, projecten en notificaties worden gesynchroniseerd.
        </motion.p>
      </div>
    </div>
  );
}