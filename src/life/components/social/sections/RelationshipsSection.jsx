import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlassPanel from "@/system/components/glass/GlassPanel";
import NetworkGraph from "../v2/NetworkGraph";
import { closeCircle } from "@/lib/domainUtils";
import { EmptyState } from "../v2/primitives";

/** RelationshipsSection v2 — §2 interactieve force-directed netwerkgrafiek
 *  met cluster-filters. Hover → signal popover; click → detail drawer. */
export default function RelationshipsSection({ contacts = [], whatsapps = [], planContactIds = [], onOpenPerson }) {
  const [hovered, setHovered] = useState(null);
  const [cluster, setCluster] = useState("all");
  const circle = useMemo(() => closeCircle(contacts, { whatsapps, planContactIds }), [contacts, whatsapps, planContactIds]);

  const clusters = useMemo(() => {
    const types = new Set(circle.map((c) => (c.relationship_type || "other").toLowerCase()));
    return ["all", ...Array.from(types)];
  }, [circle]);
  const filtered = cluster === "all" ? circle : circle.filter((c) => (c.relationship_type || "other").toLowerCase() === cluster);
  const changing = contacts.filter((c) => c.relationship_pattern_note).slice(0, 4);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="space-y-4">
      <motion.div variants={fadeUp} className="flex flex-wrap gap-1.5">
        {clusters.map((c) => (
          <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setCluster(c)} className={`text-[11px] capitalize rounded-full px-3.5 py-1.5 transition-colors ${cluster === c ? "bg-olive text-white" : "glass-1 text-muted-foreground"}`}>{c}</motion.button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassPanel level={2} className="relative overflow-hidden p-0" >
          <div className="absolute top-4 left-5 z-10 pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Relationship Map</p>
            <p className="text-xs text-foreground/60 mt-0.5">{filtered.length} people · click to open · drag rotates</p>
          </div>
          {filtered.length ? (
            <div className="flex items-center justify-center" style={{ height: 460 }}>
              <NetworkGraph contacts={filtered} whatsapps={whatsapps} onHover={setHovered} onSelect={onOpenPerson} width={600} height={460} />
            </div>
          ) : (
            <div className="h-[460px] flex items-center justify-center"><EmptyState title="YOUR NETWORK" subtitle="Start adding people, or let Giulia discover relationships from context." /></div>
          )}
        </GlassPanel>
      </motion.div>

      {changing.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
          {changing.map((c) => (
            <motion.span key={c.id} whileHover={{ scale: 1.04 }} onClick={() => onOpenPerson?.(c)} className="text-[11px] rounded-full px-3.5 py-1.5 glass-1 text-foreground/70 cursor-pointer">{c.name}: {c.relationship_pattern_note}</motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };