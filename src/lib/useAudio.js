import { useEffect, useRef } from "react";

/**
 * useAudio — synthetiseert frequentie-bands uit Giulia's audio-output.
 * Leest per frame ElevenLabs getOutputVolume() (een scalar 0–1) en bouwt daaruit
 * een array van ~12 band-amplitudes, met een lichte fase-verschuiving per band
 * zodat de drie SineLayers-golven verschillend bewegen. Bij niet-verbonden
 * status simuleert de hook een rustige ademende beweging.
 *
 * @param {Object} opts
 * @param {Function} [opts.getOutputVolume] - ElevenLabs getOutputVolume()
 * @param {boolean} [opts.connected] - of er een live gesprek is
 * @returns {React.MutableRefObject<number[]>} bandsRef — ref naar 12 amplitudes (0–1)
 */
export function useAudio({ getOutputVolume, connected } = {}) {
  const bandsRef = useRef(new Array(12).fill(0));
  const levelRef = useRef(0);

  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      const raw = connected && typeof getOutputVolume === "function" ? (getOutputVolume() || 0) : 0;
      levelRef.current = levelRef.current * 0.82 + raw * 0.18;
      const level = Math.min(1, levelRef.current);
      const bands = bandsRef.current;
      for (let i = 0; i < bands.length; i++) {
        if (connected) {
          const phase = i * 0.6 + t * 2.2;
          bands[i] = Math.min(1, level * (0.6 + 0.4 * Math.abs(Math.sin(phase))) + 0.05);
        } else {
          bands[i] = 0.12 + 0.08 * Math.sin(t * 1.1 + i * 0.5);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [connected, getOutputVolume]);

  return bandsRef;
}