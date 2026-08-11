import React, { useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const CIRC = 2 * Math.PI * 31; // r = 31

/**
 * ProgressGauge — editorial photo-card with an animated progress ring.
 * The ring appears small at the top-right corner, then grows and travels
 * to the card centre (responsive measurement via JS). App-aligned: ivory
 * on a darkened photo, Inter body font, charcoal/ivory tokens.
 */
export default function ProgressGauge({
  image, label, percent = 0, title, subtitle, pillLabel, onPillClick, actionIcon: ActionIcon, onAction,
}) {
  const cardRef = useRef(null);
  const wrapRef = useRef(null);
  const [go, setGo] = useState(false);
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const offset = CIRC * (1 - pct / 100);

  useEffect(() => {
    const fire = () => {
      const card = cardRef.current, wrap = wrapRef.current;
      if (!card || !wrap) return;
      const cr = card.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const cx = cr.left + cr.width / 2;
      let targetDia, cy;
      if (cr.width < 340) {
        const labelEl = card.querySelector("[data-g2-label]");
        const titleEl = card.querySelector("[data-g2-title]");
        const top = (labelEl ? labelEl.getBoundingClientRect().bottom : cr.top) + 14;
        const bottom = (titleEl ? titleEl.getBoundingClientRect().top : cr.bottom) - 14;
        const band = Math.max(40, bottom - top);
        targetDia = Math.min(cr.width * 0.56, band);
        cy = (top + bottom) / 2;
      } else {
        targetDia = 230;
        cy = cr.top + cr.height * 0.40;
      }
      const scale = Math.max(1.4, targetDia / wr.width);
      const dx = cx - (wr.left + wr.width / 2);
      const dy = cy - (wr.top + wr.height / 2);
      wrap.style.setProperty("--g2-dx", dx + "px");
      wrap.style.setProperty("--g2-dy", dy + "px");
      wrap.style.setProperty("--g2-scale", scale);
      requestAnimationFrame(() => setGo(true));
    };
    const t = setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(fire)), 120);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <section data-g2 className="g2-section">
      <div ref={cardRef} className="g2-card">
        <div className="absolute inset-0">
          <Image src={image} alt="" fittingType="fill" focalPointY={0.2} className="h-full w-full" />
        </div>
        <div className="g2-gradient" aria-hidden />
        <div className="g2-top">
          <span className="g2-label" data-g2-label>{label}</span>
          <div ref={wrapRef} className={cn("g2-ring-wrap", go && "g2-go")} role="img" aria-label={`${pct} procent voltooid`}>
            <svg className="g2-ring-svg" viewBox="0 0 76 76" aria-hidden>
              <circle className="g2-ring-backdrop" cx="38" cy="38" r="34" />
              <circle className="g2-ring-track" cx="38" cy="38" r="31" />
              <circle className="g2-ring-fill" cx="38" cy="38" r="31" style={{ strokeDasharray: CIRC, strokeDashoffset: go ? offset : CIRC }} />
            </svg>
            <span className="g2-ring-pct">{pct}%</span>
          </div>
        </div>
        <div className="g2-bottom">
          <h2 className="g2-title" data-g2-title>{title}</h2>
          <p className="g2-subtitle">{subtitle}</p>
          <div className="g2-actions">
            <div className="g2-icon-group">
              {ActionIcon && (
                <button className="g2-icon-btn" onClick={onAction} aria-label="Actie">
                  <ActionIcon />
                </button>
              )}
            </div>
            <button className="g2-pill" onClick={onPillClick}>
              {pillLabel} <span className="g2-pill-arrow" aria-hidden="true"><span className="g2-arrow-glyph">→</span></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}