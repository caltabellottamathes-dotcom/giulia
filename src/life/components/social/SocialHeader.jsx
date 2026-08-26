import React from "react";
import { IMAGES } from "@/lib/images";
import StatusBadge from "@/system/components/glass/StatusBadge";
import { PULSE_LABEL } from "@/lib/domainUtils";

/** SocialHeader — same sticky hero-photo anatomy as ProjectHeader, so the
 *  Social page reads exactly like an individual project page. */
export default function SocialHeader({ mi, state, urgentCount }) {
  return (
    <div className="overflow-hidden float-shadow fixed top-0 left-0 right-0 z-0 rounded-none lg:left-10 lg:right-10 lg:rounded-[24px]">
      <div className="h-[50vh] lg:h-[52vh] relative">
        <img src={IMAGES.lifeSocialPulse} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8 pb-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge variant={urgentCount ? "urgent" : "active"} className="bg-white/20 border-white/30 text-white">{PULSE_LABEL[state] || "Unknown"}</StatusBadge>
            <span className="hidden lg:inline text-[11px] uppercase tracking-wider text-white/40">·</span>
            <span className="hidden lg:inline text-[11px] uppercase tracking-wider text-white/80">Social</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight drop-shadow-sm">What Social Life?</h1>
          <p className="hidden lg:block text-sm text-white/85 max-w-2xl leading-relaxed mt-2">Relationships, plans and personal time — in one view.</p>
          <div className="flex items-center gap-x-5 mt-4 lg:mt-5 text-xs text-white/80">
            <span className="inline-flex items-center gap-2">
              <span className="uppercase tracking-wider text-white/50">Meaningful · 7d</span>
              <span className="text-white font-semibold text-sm">{mi.total}</span>
            </span>
            {urgentCount > 0 && (
              <span className="inline-flex items-center gap-2">
                <span className="uppercase tracking-wider text-white/50">Needs attention</span>
                <span className="text-white font-semibold text-sm">{urgentCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}