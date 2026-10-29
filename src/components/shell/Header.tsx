"use client";

import { useLayoutEffect, useRef } from "react";
import { SECTIONS } from "@/content/site";
import { tone } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

/** Barre d'onglets de l'éditeur : une section du site par fichier ouvert. */
export function Header() {
  const { active, setPaletteOpen } = usePortfolio();
  const { t, lang } = usePreferences();
  const nav = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const tab = () => nav.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    const place = () => {
      const el = tab();
      if (!el || !bar.current) return;
      bar.current.style.left = el.offsetLeft + "px";
      bar.current.style.width = el.offsetWidth + "px";
      bar.current.style.background = tone(SECTIONS.find((s) => s.id === active)?.tone ?? "mint");
    };
    place();
    const el = tab();
    if (el && nav.current && innerWidth < 1100) nav.current.scrollTo({ left: el.offsetLeft - 24, behavior: "smooth" });
    addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => removeEventListener("resize", place);
  }, [active, lang]);

  return (
    <header className="fixed inset-x-0 top-0 z-120 flex h-header items-stretch border-b border-l2 bg-p1 font-mono text-xs">
      <a href="#index" aria-label="Ameth Ba, accueil" className="flex w-14 flex-none items-center justify-center border-r border-l2 font-sans text-[15px] font-black text-bg hover:text-bg">
        <span className="flex size-[26px] items-center justify-center rounded-[3px] bg-mint">AB</span>
      </a>
      <nav ref={nav} aria-label="Sections" className="relative flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-tab={s.id}
            aria-current={active === s.id ? "true" : undefined}
            className="flex flex-none items-center gap-2 border-r border-l2 px-[18px] text-d1 transition-colors duration-300 hover:text-t1 aria-[current]:bg-bg aria-[current]:text-t1"
          >
            <span className="size-[7px] rounded-[2px]" style={{ background: tone(s.tone) }} />
            {s.file}
          </a>
        ))}
        <span ref={bar} className="absolute top-0 left-0 h-0.5 w-0 bg-mint transition-[left,width,background] duration-500 ease-out-expo" />
      </nav>
      <button type="button" onClick={() => setPaletteOpen(true)} className="flex flex-none items-center gap-2.5 border-l border-l2 px-4 text-xs text-d1">
        <kbd className="rounded border border-l3 px-[7px] py-[3px] font-mono text-t1">
          <span className="hidden mid:inline">⌘K</span>
          <span className="mid:hidden">☰</span>
        </kbd>
        <span className="hidden mid:inline">{t("Rechercher", "Search")}</span>
      </button>
    </header>
  );
}
