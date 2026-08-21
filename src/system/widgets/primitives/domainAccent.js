// domein → accent-token map. Eén stijl over alle widgets; kleur als
// domein-markering, getrokken uit de bestaande tokens.
// urgent (#d5e24a) verschijnt alleen wanneer iets urgent wordt — niet als vaste kleur.

export const URGENT = "hsl(var(--giulia-urgent))"; // #d5e24a

export const DOMAIN_ACCENT = {
  system: { accent: "hsl(var(--d-system-deep))", on: "hsl(var(--ivory))",     soft: "hsl(var(--d-system-light))", mid: "hsl(var(--d-system-mid))" },
  giulia: { accent: "hsl(var(--giulia-coral))",   on: "hsl(var(--ivory))",     soft: "hsl(var(--giulia-pistachio))", mid: "hsl(var(--giulia-dust))" },
  focus:  { accent: "hsl(var(--d-focus-deep))",   on: "hsl(var(--ivory))",     soft: "hsl(var(--d-focus-light))",  mid: "hsl(var(--d-focus-light))" },
  life:   { accent: "hsl(var(--d-life-deep))",    on: "hsl(var(--charcoal))",  soft: "hsl(var(--d-life-light))",  mid: "hsl(var(--d-life-mid))" },
  self:   { accent: "hsl(var(--d-life-deep))",    on: "hsl(var(--charcoal))",  soft: "hsl(var(--d-life-light))",  mid: "hsl(var(--d-life-mid))" },
  now:    { accent: "hsl(var(--d-giulia-deep))",  on: "hsl(var(--ivory))",     soft: "hsl(var(--d-giulia-light))", mid: "hsl(var(--d-giulia-mid))" },
};

export function accentFor(domain) {
  return DOMAIN_ACCENT[domain] || DOMAIN_ACCENT.system;
}