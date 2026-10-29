"use client";

import { useEffect, useRef } from "react";
import type { SectionId } from "@/types/content";
import { useFrame } from "@/hooks/useFrame";
import { prefersReducedMotion } from "@/lib/env";
import { trackPointer } from "@/lib/pointer";
import { fitTitles, setupReveals, skewTitles } from "@/lib/effects/titles";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

/** Comportements transverses de l'interface : raccourcis, section active, effets des titres. */
export function useShellEffects() {
  const { active, setActive, stepShot, paletteOpen, setPaletteOpen, launch, folded } = usePortfolio();
  const { lang } = usePreferences();
  const scroll = useRef({ y: 0, velocity: 0 });

  useEffect(() => {
    trackPointer();
    scroll.current.y = scrollY;
    const cleanup = setupReveals();
    const refit = () => fitTitles();
    let timer = 0;
    const onResize = () => { clearTimeout(timer); timer = window.setTimeout(refit, 120); };
    addEventListener("resize", onResize);
    document.fonts?.ready.then(refit);
    const late = setTimeout(refit, 700);
    return () => { cleanup(); removeEventListener("resize", onResize); clearTimeout(timer); clearTimeout(late); };
  }, []);

  // La largeur des titres dépend de la langue et des sections dépliées.
  useEffect(() => { const id = setTimeout(fitTitles, 80); return () => clearTimeout(id); }, [lang, folded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
        return;
      }
      if (e.key === "Escape" && paletteOpen) return setPaletteOpen(false);
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || paletteOpen || launch) return;
      if (active === "travaux" && e.key === "ArrowRight") stepShot(1);
      if (active === "travaux" && e.key === "ArrowLeft") stepShot(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [active, paletteOpen, setPaletteOpen, launch, stepShot]);

  useFrame(() => {
    const y = scrollY, s = scroll.current;
    s.velocity += (y - s.y - s.velocity) * 0.2;
    s.y = y;
    if (!prefersReducedMotion()) skewTitles(s.velocity);

    const mid = innerHeight * 0.45;
    let current = active;
    document.querySelectorAll<HTMLElement>("[data-sec]").forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top < mid && r.bottom > mid) current = sec.dataset.sec as SectionId;
    });
    if (current !== active) setActive(current);
  });
}
