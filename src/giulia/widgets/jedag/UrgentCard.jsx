import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DOMAIN_META } from "@/lib/unifiedStream";

const EASE = [0.22, 1, 0.36, 1];

/**
 * UrgentCard — groot aantal dringende items + een lijstje van de meest
 * tijdsgevoelige zaken, domein-gekleurd. Antwoordt: "Wat vraagt nu aandacht?"
 */
export default function UrgentCard({ items = [] }) {
  const count = items.length;

  return (
    <div className="space-y-3">
      {/* Big count */}
      <div className="flex items-baseline gap-2">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[2.75rem] font-display font-light leading-none tabular-nums text-current tracking-[-0.04em]"
        >
          {count}
        </motion.span>
        <span className="text-[11px] text-current/55 leading-none pb-1">dringend</span>
      </div>

      {/* Urgent items list */}
      <div className="space-y-1.5 pt-1">
        {items.slice(0, 4).map((item, i) => {
          const meta = DOMAIN_META[item.domain] || DOMAIN_META.focus;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.35, ease: EASE }}
            >
              <Link to={item.to} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 group">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                <span className="text-[11px] text-current/75 group-hover:text-current truncate flex-1 leading-snug transition-colors">{item.label}</span>
                <span className="text-[8px] uppercase tracking-wider font-bold shrink-0" style={{ color: meta.color }}>{meta.label}</span>
              </Link>
            </motion.div>
          );
        })}
        {count === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-giulia-coral shrink-0" />
            <span className="text-[12px] font-display text-current/80">Niets dringends.</span>
            <span className="text-[10px] text-current/45">Een rustige dag.</span>
          </motion.div>
        )}
        {count > 4 && (
          <p className="text-[10px] text-current/40 pt-0.5">+{count - 4} meer</p>
        )}
      </div>
    </div>
  );
}