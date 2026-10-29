export type FrameCallback = (now: number) => void;

/**
 * Une seule boucle requestAnimationFrame pour tout le site : chaque composant animé
 * s'y abonne au lieu de lancer la sienne.
 */
const subscribers = new Set<FrameCallback>();
let handle = 0;

const loop = (now: number) => {
  subscribers.forEach((fn) => fn(now));
  handle = subscribers.size ? requestAnimationFrame(loop) : 0;
};

export function onFrame(fn: FrameCallback): () => void {
  subscribers.add(fn);
  if (!handle) handle = requestAnimationFrame(loop);
  return () => {
    subscribers.delete(fn);
    if (!subscribers.size && handle) {
      cancelAnimationFrame(handle);
      handle = 0;
    }
  };
}
