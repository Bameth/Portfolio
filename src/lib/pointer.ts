/**
 * Position du pointeur partagée par toutes les animations. Mise à jour par un seul
 * écouteur global, lue à chaque image sans provoquer de rendu React.
 */
export const pointer = {
  x: 0,
  y: 0,
  /** Horodatage (performance.now) du dernier mouvement. */
  lastMove: 0,
  /** Élément survolé, pour l'inspecteur. */
  over: null as Element | null,
  /** Lien ou bouton survolé, pour le curseur qui l'encadre. */
  target: null as Element | null,
  /** Touche ⌥ maintenue : active l'inspecteur temporairement. */
  altDown: false,
};

let started = false;

export function trackPointer() {
  if (started) return;
  started = true;
  pointer.x = innerWidth * 0.6;
  pointer.y = innerHeight * 0.4;
  addEventListener("mousemove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.lastMove = performance.now();
  }, { passive: true });
  addEventListener("mouseover", (e) => {
    const el = e.target as Element;
    if (!el.closest?.("[data-inspector],[data-palette]")) pointer.over = el;
    const t = el.closest?.("a,button,[data-caret-skip]");
    pointer.target = t && !t.closest("[data-palette]") && !t.hasAttribute("data-caret-skip") ? t : null;
  });
  addEventListener("keydown", (e) => { if (e.key === "Alt") pointer.altDown = true; });
  addEventListener("keyup", (e) => { if (e.key === "Alt") pointer.altDown = false; });
  addEventListener("blur", () => { pointer.altDown = false; });
}

/** Le visiteur n'a pas bougé la souris depuis `ms` millisecondes. */
export const isIdle = (now: number, ms = 2500) => now - pointer.lastMove > ms;
