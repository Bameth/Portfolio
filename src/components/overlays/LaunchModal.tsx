"use client";

import { useCallback, useEffect, useRef } from "react";
import { PROJECTS, domainOf } from "@/content/projects";
import { shotUrl } from "@/lib/cloudinary";
import { EASE } from "@/lib/env";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

const STEP_START = 500, STEP_MS = 300;

/** Simulation d'un déploiement (git push → docker → nginx → DNS) avant d'ouvrir le site en production. */
export function LaunchModal() {
  const { launch, closeLaunch } = usePortfolio();
  const { t } = usePreferences();
  const win = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    win.current?.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(40px) rotateX(-14deg) scale(.9)", opacity: 0 }],
      { duration: 450, easing: "cubic-bezier(.7,0,.84,0)", fill: "forwards" });
    const a = backdrop.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, fill: "forwards" });
    const done = () => { closing.current = false; closeLaunch(); };
    if (a) a.onfinish = done;
    else done();
  }, [closeLaunch]);

  useEffect(() => {
    if (!launch) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [launch, close]);

  // Chorégraphie : fenêtre qui s'ouvre depuis la capture, logs ligne par ligne, maquette puis capture réelle.
  useEffect(() => {
    const w = win.current;
    if (!launch || !w) return;
    const q = <T extends Element>(s: string) => w.querySelector<T>(s);
    const A = (el: Element | null, k: Keyframe[], o: KeyframeAnimationOptions) => el?.animate(k, { easing: EASE, fill: "both", ...o });
    backdrop.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: "ease-out", fill: "both" });
    const to = w.getBoundingClientRect(), fr = launch.from ?? { left: to.left + to.width * 0.3, top: to.top + to.height * 0.3, width: to.width * 0.4, height: to.height * 0.4 };
    w.style.transformOrigin = "0 0";
    A(w, [
      { transform: `translate(${fr.left - to.left}px,${fr.top - to.top}px) scale(${Math.max(0.05, fr.width / to.width)},${Math.max(0.05, fr.height / to.height)})`, opacity: 0.3, borderRadius: "18px" },
      { transform: "none", opacity: 1, borderRadius: "10px" },
    ], { duration: 750 });

    const lines = [...w.querySelectorAll("[data-dl]")], end = STEP_START + lines.length * STEP_MS;
    lines.forEach((l, i) => A(l, [{ opacity: 0, transform: "translateX(-10px)" }, { opacity: 1, transform: "none" }], { duration: 260, delay: STEP_START + i * STEP_MS }));
    const pct = q<HTMLElement>("[data-dpct]"), bar = q<HTMLElement>("[data-dbar]"), t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.max(0, Math.min(1, (performance.now() - t0 - STEP_START) / (end - STEP_START))), e = 1 - Math.pow(1 - p, 1.6);
      if (pct) pct.textContent = String(Math.round(e * 100));
      if (bar) bar.style.width = e * 100 + "%";
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    A(q("[data-dskel]"), [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: end - 600, delay: 700, easing: "linear" });
    const ghost = "grayscale(1) contrast(.5) brightness(1.3) blur(5px)", span = end - STEP_START;
    A(q("[data-dimg]"), [
      { opacity: 0, clipPath: "inset(0 0 100% 0)", filter: ghost },
      { opacity: 0.9, clipPath: "inset(0 0 0% 0)", filter: ghost, offset: 0.5 },
      { opacity: 1, clipPath: "inset(0 0 0% 0)", filter: "none" },
    ], { duration: span * 0.62, delay: STEP_START + span * 0.38 });
    A(q("[data-dscan]"), [{ top: "0%", opacity: 1 }, { top: "100%", opacity: 1, offset: 0.95 }, { top: "100%", opacity: 0 }], { duration: span * 0.32, delay: STEP_START + span * 0.38, easing: "linear" });
    const timer = setTimeout(() => {
      const st = q<HTMLElement>("[data-dst]");
      if (st) { st.dataset.live = ""; }
      A(q("[data-dgo]"), [{ opacity: 0, transform: "translateY(8px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 500 });
    }, end);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [launch]);

  if (!launch) return null;
  const p = PROJECTS[launch.projectIndex], domain = domainOf(p);
  const steps: [string, string, string?, string?][] = [
    ["$ git push origin main", "", "var(--d1)", "var(--t1)"],
    ["vite build", "✓ 2,1 s"],
    ["docker build api", "✓ 14 s"],
    ["docker push registry", "✓"],
    ["ssh vps · compose up -d", "✓"],
    ["nginx -s reload", "✓"],
    ["certbot · TLS", t("✓ valide", "✓ valid")],
    ["DNS " + domain, "✓"],
    [t("en ligne", "live") + " → " + domain, "200", "var(--pink)", "var(--pink)"],
  ];
  const skeleton = "absolute rounded-[2px] border border-dashed";

  return (
    <div onClick={close} role="presentation" className="fixed inset-0 z-280 flex items-center justify-center p-[clamp(12px,3vw,40px)] perspective-[1800px]">
      <div ref={backdrop} className="absolute inset-0 bg-[rgba(7,11,23,.96)] backdrop-blur-[10px]" />
      <button
        type="button"
        onClick={close}
        aria-label={t("Fermer", "Close")}
        className="absolute top-3.5 right-3.5 z-[3] flex size-11 items-center justify-center rounded-full border border-l3 bg-p1 text-base text-t1 hover:border-mint hover:text-mint"
      >
        ✕
      </button>
      <div
        ref={win}
        role="dialog"
        aria-modal="true"
        aria-label={t("Déploiement de ", "Deploying ") + domain}
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[calc(100vh-32px)] w-[min(1240px,100%)] grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] overflow-auto rounded-[10px] border border-l3 bg-p3 shadow-[0_60px_140px_rgba(0,0,0,.6)]"
      >
        <div className="flex min-w-0 flex-col border-r border-l2 bg-p2">
          <div className="flex justify-between gap-3 border-b border-l2 px-4 py-3 font-mono text-[11px] text-d1">
            <span>deploy.sh · zsh</span>
            <span data-dst="" className="group text-amber data-live:text-mint">
              <span className="group-data-live:hidden">{t("● déploiement", "● deploying")}</span>
              <span className="hidden group-data-live:inline">{t("● en ligne", "● live")}</span>
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-[7px] p-[18px] font-mono text-[clamp(11px,1vw,13px)] leading-normal">
            {steps.map(([a, b, c, ac]) => (
              <div key={a} data-dl="" className="flex min-w-0 items-baseline opacity-0">
                <span className="flex-none" style={{ color: ac ?? "var(--t1)" }}>{a}</span>
                <span className="mx-2 min-w-3 flex-1 border-b border-dotted border-l3" />
                <span className="flex-none" style={{ color: c ?? "var(--mint)" }}>{b}</span>
              </div>
            ))}
          </div>
          <div className="flex items-end justify-between gap-4 border-t border-l2 px-[18px] py-4">
            <div className="text-[clamp(44px,5vw,72px)] leading-[.8] text-t1 [font-variation-settings:'wdth'_70,'wght'_800]">
              <span data-dpct="">0</span><span className="text-mint">%</span>
            </div>
            <div className="mb-1.5 h-[3px] max-w-[220px] flex-1 overflow-hidden rounded-[2px] bg-l1"><div data-dbar="" className="h-full w-0 bg-mint" /></div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2.5 border-b border-l2 bg-p1 px-3.5 py-2.5 font-mono text-xs text-d1">
            <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-[9px] rounded-full bg-l3" />)}</span>
            <span className="min-w-0 flex-1 overflow-hidden rounded border border-l2 bg-bg px-3 py-1.5 text-ellipsis whitespace-nowrap">
              🔒 https://<span className="text-t1">{domain}</span>
            </span>
          </div>
          <div className="relative aspect-16/10 overflow-hidden bg-p3">
            <div data-dskel="" className="absolute inset-0 opacity-0">
              <div className="absolute inset-x-0 top-0 h-[9%] border-b border-dashed border-mint/35" />
              <div className={`${skeleton} top-[3%] left-[6%] h-[3%] w-[14%] border-mint/45`} />
              <div className={`${skeleton} top-[3%] right-[6%] h-[3%] w-[30%] border-mint/30`} />
              <div className={`${skeleton} top-[20%] left-[6%] h-[12%] w-[52%] border-mint/50`} />
              <div className={`${skeleton} top-[36%] left-[6%] h-[3%] w-[40%] border-mint/30`} />
              <div className={`${skeleton} top-[41%] left-[6%] h-[3%] w-[34%] border-mint/30`} />
              <div className={`${skeleton} top-[49%] left-[6%] h-[6%] w-[16%] border-pink/55`} />
              <div className={`${skeleton} top-[18%] right-[6%] h-[40%] w-[30%] border-mint/40`} />
              <div className="absolute inset-x-[6%] top-[66%] bottom-[6%] grid grid-cols-3 gap-[3%]">
                {[0, 1, 2].map((i) => <div key={i} className="rounded border border-dashed border-mint/30" />)}
              </div>
            </div>
            <img data-dimg="" src={shotUrl(p.shots[launch.shotIndex] ?? p.shots[0], 1400)} alt={domain} className="absolute inset-0 size-full object-cover object-top opacity-0" />
            <div data-dscan="" className="absolute inset-x-0 top-0 h-0.5 bg-mint opacity-0 shadow-[0_0_16px_var(--mint)]" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-l2 px-4 py-3.5">
            <span className="font-mono text-[11px] text-d1">{p.title} · production</span>
            <a
              data-dgo=""
              href={p.demo}
              target="_blank"
              rel="noopener"
              onClick={(e) => { e.stopPropagation(); setTimeout(close, 350); }}
              className="flex items-center gap-2.5 rounded-[5px] bg-pink px-5 py-3.5 font-mono text-[13px] font-semibold whitespace-nowrap text-bg opacity-0 hover:text-bg hover:brightness-110"
            >
              {t("Ouvrir", "Open")} {domain} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
