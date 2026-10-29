/** Capacités de l'appareil, évaluées une seule fois côté client. */
let cache: { reducedMotion: boolean; coarse: boolean } | null = null;

const read = () => {
  if (!cache) {
    cache = {
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      coarse: matchMedia("(pointer: coarse)").matches,
    };
  }
  return cache;
};

export const prefersReducedMotion = () => read().reducedMotion;

/** Écran tactile (pas de survol, pas de curseur personnalisé). */
export const isCoarsePointer = () => read().coarse;

export const EASE = "cubic-bezier(.16,1,.3,1)";

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
