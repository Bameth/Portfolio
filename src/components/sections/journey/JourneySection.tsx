"use client";

import { useEffect, useRef } from "react";
import { FoldableSection } from "@/components/ui/FoldableSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { COMMITS } from "@/content/journey";
import { DotGlobe } from "@/features/globe/DotGlobe";
import { useFrame } from "@/hooks/useFrame";
import { clamp } from "@/lib/env";
import { tone } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

/** Section « git.log » : le parcours en commits, synchronisé avec un globe Dakar ⇄ Montréal. */
export function JourneySection() {
  const { folded } = usePortfolio();
  const { t, pick } = usePreferences();
  const list = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const globe = useRef<DotGlobe | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const g = new DotGlobe(canvas.current);
    globe.current = g;
    const onResize = () => g.resize();
    addEventListener("resize", onResize);
    return () => { removeEventListener("resize", onResize); g.dispose(); globe.current = null; };
  }, [folded.parcours]);

  useFrame((now) => {
    const box = list.current;
    if (!box) return;
    const vh = innerHeight, line = vh * 0.45;
    const commits = [...box.querySelectorAll<HTMLElement>("[data-commit]")];
    const tops = commits.map((el) => el.getBoundingClientRect().top + 20);
    // Position continue du « HEAD » de lecture entre les commits.
    let f = 0;
    if (line > tops[0]) {
      f = tops.length - 1;
      for (let i = 0; i < tops.length - 1; i++) if (line < tops[i + 1]) { f = i + (line - tops[i]) / (tops[i + 1] - tops[i]); break; }
    }
    const current = Math.round(f);
    commits.forEach((el, i) => { const o = i === current ? "1" : ".35"; if (el.style.opacity !== o) el.style.opacity = o; });
    const r = box.getBoundingClientRect();
    if (fill.current) fill.current.style.height = clamp((vh * 0.5 - r.top) / r.height, 0, 1) * 100 + "%";
    const c = canvas.current?.getBoundingClientRect();
    if (c && c.bottom > 0 && c.top < vh) globe.current?.draw(f, now);
  });

  return (
    <FoldableSection
      id="parcours"
      summary={t(`${COMMITS.length} commits`, `${COMMITS.length} commits`)}
      heading={<><span className="text-pink">$</span> git log --graph --oneline</>}
    >
      <SectionTitle className="mb-[clamp(40px,5vw,72px)]">{t("Parcours", "Journey")}</SectionTitle>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,4vw,64px)] wide:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
        <div ref={list} className="relative min-w-0">
          <div className="absolute top-3.5 bottom-3.5 left-[11px] w-0.5 overflow-hidden bg-l2">
            <div ref={fill} className="h-0 w-full bg-mint" />
          </div>
          {COMMITS.map((c) => (
            <div key={c.hash} data-commit="" className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-[clamp(16px,2.4vw,32px)] pb-[clamp(40px,5vw,72px)] transition-opacity duration-[450ms]">
              <span className="relative z-[1] mt-2 flex size-6 items-center justify-center rounded-full border-2 bg-bg" style={{ borderColor: tone(c.tone) }}>
                <span className="size-2 rounded-full" style={{ background: tone(c.tone) }} />
              </span>
              <div className="flex min-w-0 flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
                  <span className="text-amber">{c.hash}</span>
                  {c.ref && <span className="rounded-[3px] border px-2 py-[3px]" style={{ borderColor: tone(c.tone), color: tone(c.tone) }}>{c.ref}</span>}
                  <span className="text-d1">{pick(c.date)}</span>
                </div>
                <div className="text-[clamp(24px,2.8vw,46px)] leading-[1.02] text-balance [font-variation-settings:'wdth'_82,'wght'_700]">
                  <span className="mr-[.5em] align-middle font-mono text-[.42em] font-medium [font-variation-settings:normal]" style={{ color: tone(c.tone) }}>{c.type}:</span>
                  {pick(c.message)}
                </div>
                <div className="font-mono text-xs text-d1">{pick(c.where)} · <span className="text-t1">{c.city}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative -order-1 min-w-0 wide:sticky wide:top-20 wide:order-none">
          <div className="relative mx-auto aspect-square w-full max-w-[340px] wide:max-w-[560px]">
            <canvas ref={canvas} className="absolute inset-0 size-full touch-pan-y" aria-label={t("Globe : Dakar → Montréal", "Globe: Dakar → Montréal")} />
          </div>
          <div className="mt-2.5 flex justify-between gap-3 font-mono text-[11px] text-d1">
            <span><span className="text-amber">●</span> DKR 14.69°N 17.44°W</span>
            <span><span className="text-pink">●</span> YUL 45.50°N 73.57°W</span>
          </div>
          <div className="mt-1.5 text-center font-mono text-[10px] text-d2">{t("glisser pour tourner le globe", "drag to spin the globe")}</div>
        </div>
      </div>
    </FoldableSection>
  );
}
