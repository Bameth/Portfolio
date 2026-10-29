"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@/hooks/useFrame";
import { isCoarsePointer } from "@/lib/env";
import { pointer } from "@/lib/pointer";

/** Curseur en forme de caret de texte, qui encadre les liens et boutons survolés. */
export function Caret() {
  const el = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const blink = useRef<Animation | null>(null);

  useEffect(() => {
    if (isCoarsePointer() || !el.current) return;
    el.current.style.display = "block";
    pos.current = { x: pointer.x, y: pointer.y };
    blink.current = el.current.animate(
      [{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.51 }, { opacity: 0 }],
      { duration: 1000, iterations: Infinity });
    return () => blink.current?.cancel();
  }, []);

  useFrame((now) => {
    const c = el.current, a = blink.current;
    if (!c || !a) return;
    const p = pos.current, target = pointer.target;
    if (target && document.contains(target)) {
      const r = target.getBoundingClientRect(), pad = 6;
      p.x += (r.left - pad - p.x) * 0.3;
      p.y += (r.top - pad - p.y) * 0.3;
      c.dataset.boxed = "";
      c.style.width = r.width + pad * 2 + "px";
      c.style.height = r.height + pad * 2 + "px";
      a.pause();
      a.currentTime = 0;
    } else {
      p.x += (pointer.x - p.x) * 0.35;
      p.y += (pointer.y - 11 - p.y) * 0.35;
      delete c.dataset.boxed;
      c.style.width = "";
      c.style.height = "";
      if (now - pointer.lastMove < 500) { a.pause(); a.currentTime = 0; }
      else if (a.playState !== "running") a.play();
    }
    c.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
  });

  return <div ref={el} className="pointer-events-none fixed top-0 left-0 z-290 hidden h-[22px] w-0.5 rounded-[1px] border-0 border-mint bg-mint transition-[width,height,background,border-width,border-radius] duration-[280ms,280ms,200ms,200ms,200ms] data-boxed:rounded data-boxed:border data-boxed:bg-mint/12" aria-hidden="true" />;
}
