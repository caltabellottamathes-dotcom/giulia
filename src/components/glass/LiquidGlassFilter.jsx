/**
 * Mounts the SVG displacement filter once, globally. Every ".liquid-glass-surface"
 * element (see index.css) references filter#liquid-glass to get real refraction —
 * background content visibly bends through the glass, not just blurs.
 */
export default function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <filter id="liquid-glass" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}