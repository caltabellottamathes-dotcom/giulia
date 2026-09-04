import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MattiaMobileMasthead from "@/giulia/components/mattiaMobile/MattiaMobileMasthead";
import MattiaMobileChat from "@/giulia/components/mattiaMobile/MattiaMobileChat";

/**
 * MattiaMobile — full-screen editorial chat met Mattia, 100% gebouwd voor
 * mobiel (safe-area insets, duim-vriendelijke input, één kolom). Op desktop
 * dekt de ruitjespapier-pagina en blijft de chat op telefoon-breedte.
 */
export default function MattiaMobile() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="fixed inset-0 z-[120] graph-paper text-charcoal flex flex-col animate-fade-in">
      <div className="flex-1 min-h-0 flex flex-col w-full max-w-[430px] mx-auto lg:border-x" style={{ borderColor: "#CCCCCC" }}>
        <MattiaMobileMasthead onClose={() => navigate(-1)} />
        <MattiaMobileChat />
      </div>
    </div>
  );
}