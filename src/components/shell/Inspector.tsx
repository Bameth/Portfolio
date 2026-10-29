"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@/hooks/useFrame";
import { pointer } from "@/lib/pointer";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

type Box = { left: number; top: number; width: number; height: number };

const place = (el: HTMLElement | null, b: Box) => {
  if (!el) return;
  el.style.left = b.left + "px";
  el.style.top = b.top + "px";
  el.style.width = Math.max(0, b.width) + "px";
  el.style.height = Math.max(0, b.height) + "px";
};

/** Inspecteur façon DevTools : marges, bordure, contenu et typographie de l'élément survolé. */
export function Inspector() {
  const { inspect, notify } = usePortfolio();
  const { t } = usePreferences();
  const root = useRef<HTMLDivElement>(null);
  const margin = useRef<HTMLDivElement>(null);
  const border = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (inspect) notify(t("inspecteur actif : survole un élément", "inspector on: hover any element"));
    // Notification uniquement au changement d'état.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspect]);

  useFrame(() => {
    const box = root.current;
    if (!box) return;
    const el = inspect || pointer.altDown ? pointer.over : null;
    if (!el || !document.contains(el)) {
      if (box.style.display !== "none") box.style.display = "none";
      return;
    }
    box.style.display = "block";
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el), n = (v: string) => parseFloat(v) || 0;
    const mt = n(cs.marginTop), mr = n(cs.marginRight), mb = n(cs.marginBottom), ml = n(cs.marginLeft);
    const pt = n(cs.paddingTop) + n(cs.borderTopWidth), pr = n(cs.paddingRight) + n(cs.borderRightWidth);
    const pb = n(cs.paddingBottom) + n(cs.borderBottomWidth), pl = n(cs.paddingLeft) + n(cs.borderLeftWidth);
    place(margin.current, { left: r.left - ml, top: r.top - mt, width: r.width + ml + mr, height: r.height + mt + mb });
    place(border.current, { left: r.left, top: r.top, width: r.width, height: r.height });
    place(content.current, { left: r.left + pl, top: r.top + pt, width: r.width - pl - pr, height: r.height - pt - pb });
    const lb = label.current;
    if (!lb) return;
    const family = (cs.fontFamily.split(",")[0] || "").replace(/["']/g, "").replace(/^__|_[0-9a-f]+$/g, "").replace(/_/g, " ");
    const key = [el.tagName, Math.round(r.width), Math.round(r.height), family, cs.fontSize, cs.color].join("|");
    if (lb.dataset.key !== key) {
      lb.dataset.key = key;
      const [tag, w, h, size] = [el.tagName.toLowerCase(), Math.round(r.width), Math.round(r.height), Math.round(parseFloat(cs.fontSize))];
      lb.replaceChildren(
        Object.assign(document.createElement("span"), { className: "text-pink", textContent: tag }),
        Object.assign(document.createElement("span"), { className: "text-amber", textContent: `${w} × ${h}` }),
        Object.assign(document.createElement("span"), { className: "text-d1", textContent: `${family} ${size}px` }),
      );
      const swatch = document.createElement("span");
      swatch.className = "inline-block size-2.5 rounded-[2px] border border-l3";
      swatch.style.background = cs.color;
      lb.append(swatch);
    }
    const y = r.top - mt - 30 > 74 ? r.top - mt - 30 : r.bottom + mb + 8;
    lb.style.left = Math.max(8, Math.min(innerWidth - 300, r.left)) + "px";
    lb.style.top = y + "px";
  });

  return (
    <div ref={root} className="pointer-events-none fixed top-0 left-0 z-284 hidden" data-inspector="" aria-hidden="true">
      <div ref={margin} className="fixed bg-amber/22" />
      <div ref={border} className="fixed bg-mint/22 outline-1 outline-mint outline-dashed" />
      <div ref={content} className="fixed bg-blue/32" />
      <div ref={label} className="fixed flex gap-2 rounded-[3px] border border-l3 bg-p2 px-2 py-[5px] font-mono text-[10.5px] whitespace-nowrap text-t1 shadow-[0_10px_30px_rgba(0,0,0,.5)]" />
    </div>
  );
}
