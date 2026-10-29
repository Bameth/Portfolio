"use client";

import { useLayoutEffect, useRef } from "react";
import { PROJECTS } from "@/content/projects";
import { tone } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";

/** Onglets « fichiers » des projets, avec l'indicateur coloré sous l'onglet actif. */
export function ProjectTabs() {
  const { projectIndex, selectProject } = usePortfolio();
  const row = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const place = () => {
      const tab = row.current?.querySelector<HTMLElement>(`[data-ptab="${projectIndex}"]`);
      if (!tab || !bar.current) return;
      bar.current.style.left = tab.offsetLeft + "px";
      bar.current.style.width = tab.offsetWidth + "px";
      bar.current.style.background = tone(PROJECTS[projectIndex].tone);
    };
    place();
    if (!first.current) {
      const tab = row.current?.querySelector<HTMLElement>(`[data-ptab="${projectIndex}"]`);
      if (tab) row.current?.scrollTo({ left: tab.offsetLeft - 24, behavior: "smooth" });
    }
    first.current = false;
    addEventListener("resize", place);
    void document.fonts?.ready.then(place);
    return () => removeEventListener("resize", place);
  }, [projectIndex]);

  return (
    <div ref={row} role="tablist" className="relative flex overflow-x-auto border-b border-l2 font-mono text-xs [scrollbar-width:none]">
      {PROJECTS.map((p, i) => (
        <button
          key={p.slug}
          type="button"
          role="tab"
          aria-selected={i === projectIndex}
          data-ptab={i}
          onClick={() => selectProject(i)}
          className="flex flex-none items-center gap-2 border-r border-l2 bg-transparent px-[18px] py-3.5 text-xs text-d1 transition-colors duration-300 aria-selected:bg-bg aria-selected:text-t1"
        >
          <span className="size-[7px] rounded-[2px]" style={{ background: tone(p.tone) }} />
          {p.file}
          {p.demo && <span className="rounded-[3px] bg-mint/14 px-[5px] py-0.5 text-[9px] text-mint">live</span>}
        </button>
      ))}
      <span ref={bar} className="absolute bottom-0 left-0 h-0.5 w-0 bg-mint transition-[left,width,background] duration-500 ease-out-expo" />
    </div>
  );
}
