import React from "react";

const SAND = "hsl(var(--life-sand))";
const BLUE_DEEP = "hsl(var(--life-blue-deep))";
const initials = (n) => (n || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/** SocialPersonCard — foto/initiaal + naam + reden + mogelijke tijd + PLAN-actie. */
export default function SocialPersonCard({ person, reason, suggestedTime, onPlan, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: dark ? "rgba(120,122,128,0.12)" : "hsl(var(--card))", boxShadow: dark ? "none" : "0 14px 34px -26px rgba(0,0,0,0.28)" }}
    >
      <div className="h-12 w-12 rounded-full flex items-center justify-center text-base font-display font-semibold text-charcoal shrink-0 overflow-hidden" style={{ background: person.avatar ? "transparent" : SAND }}>
        {person.avatar ? <img src={person.avatar} alt="" className="h-full w-full object-cover" /> : initials(person.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-base font-display font-semibold leading-none truncate ${dark ? "text-ivory" : "text-foreground"}`}>{person.name}</p>
        <p className={`text-[12px] mt-1 italic ${dark ? "text-ivory/55" : "text-foreground/55"}`}>{reason}</p>
        {suggestedTime && <p className={`text-[10px] uppercase tracking-[0.18em] mt-1.5 font-semibold`} style={{ color: BLUE_DEEP }}>{suggestedTime}</p>}
      </div>
      {onPlan && (
        <button onClick={() => onPlan(person)} className="shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition" style={{ background: SAND, color: "hsl(var(--charcoal))" }}>
          Plan
        </button>
      )}
    </div>
  );
}