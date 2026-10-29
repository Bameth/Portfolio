"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { isCoarsePointer } from "@/lib/env";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";
import { GlyphHead } from "./GlyphHead";

/** Colonne portrait du héros : tête 3D en glyphes, photo, et étiquettes flottantes. */
export function HeadPortrait() {
  const { introDelay } = usePortfolio();
  const { t, theme, lang } = usePreferences();
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const scan = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const head = useRef<GlyphHead | null>(null);
  const prefs = useRef({ theme, lang });
  prefs.current = { theme, lang };
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    setCoarse(isCoarsePointer());
    if (!canvas.current || !photo.current || !scan.current || !label.current) return;
    const engine = new GlyphHead(
      { canvas: canvas.current, photo: photo.current, scan: scan.current, label: label.current },
      { modelUrl: SITE.headModel, fallbackUrl: SITE.headModelFallback, getTheme: () => prefs.current.theme, getLang: () => prefs.current.lang },
    );
    head.current = engine;
    const onResize = () => engine.resize();
    addEventListener("resize", onResize);
    return () => { removeEventListener("resize", onResize); engine.dispose(); head.current = null; };
  }, []);

  // L'impression en glyphes accompagne l'animation d'entrée.
  useEffect(() => {
    if (introDelay == null) return;
    head.current?.print();
    const id = setTimeout(() => head.current?.print(), introDelay);
    return () => clearTimeout(id);
  }, [introDelay]);

  useFrame((now) => head.current?.tick(now));

  return (
    <div data-in="" className="w-full max-w-[300px] justify-self-start mid:max-w-[380px] mid:justify-self-end">
      <div className="flex justify-between pb-2.5 font-mono text-[11px] text-d1">
        <span ref={label}>ameth.ts</span>
        <span className="text-d2">{coarse ? t("toucher → 3D ⇄ photo", "tap → 3D ⇄ photo") : t("survol → 3D · clic ⇄ photo", "hover → 3D · click ⇄ photo")}</span>
      </div>
      <div data-tilt="1.7" className="relative transform-3d">
        <div data-photo="" className="relative aspect-4/5 overflow-hidden rounded border border-l2 bg-p1 shadow-[0_40px_90px_rgba(22,242,179,.08)]">
          <canvas ref={canvas} className="absolute inset-0 size-full touch-pan-y" />
          <img
            ref={photo}
            src={SITE.photo}
            alt="Ameth Ba"
            draggable={false}
            className="pointer-events-none absolute inset-0 size-full origin-[29.2%_-2.7%] object-cover opacity-0 select-none will-change-[transform,mask-image]"
          />
          <div ref={scan} className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-mint opacity-0 shadow-[0_0_14px_var(--mint),0_0_40px_var(--mint)]" />
        </div>
        <div className="absolute bottom-6 -left-3.5 translate-z-[60px] rounded-[3px] border border-l2 bg-bg px-[11px] py-[7px] font-mono text-[11px] text-mint">
          {SITE.coords}
        </div>
        <div className="absolute top-[22px] -right-3 translate-z-[90px] rounded-[3px] bg-mint px-[11px] py-[7px] font-mono text-[11px] font-semibold text-bg">
          build ✓
        </div>
      </div>
    </div>
  );
}
