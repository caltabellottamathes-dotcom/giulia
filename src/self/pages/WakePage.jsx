import React from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { IMAGES } from "@/lib/images";
import { Sunrise, ArrowRight } from "lucide-react";
import WakeMode from "@/life/pages/WakeMode";

const SAGE = "hsl(var(--self-accent))";

/** Wake page — volledige Wake Mode binnen de SELF-laag. */
export default function WakePage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="self-wake" image={IMAGES.selfWake} icon={Sunrise} eyebrow="SELF" title="Wake Mode" subtitle="Ochtend en opstart — je dag beginnen met intentie" />
      <WakeMode />
    </div>
  );
}