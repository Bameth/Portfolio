"use client";

import { useRef } from "react";
import { SITE } from "@/content/site";
import { useClock } from "@/hooks/useClock";
import { useFrame } from "@/hooks/useFrame";
import { pointer } from "@/lib/pointer";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

const BUTTON = "hidden h-status items-center border-none bg-transparent px-0.5 text-[11px] font-medium text-bg mid:flex";

/** Barre d'état de l'éditeur : branche, position du curseur, réglages et disponibilité. */
export function StatusBar() {
  const { toast, inspect, toggleInspect } = usePortfolio();
  const { lang, setLang, theme, toggleTheme, sound, toggleSound, t } = usePreferences();
  const dakar = useClock(SITE.timezones.dakar);
  const ln = useRef<HTMLSpanElement>(null);
  const col = useRef<HTMLSpanElement>(null);

  useFrame(() => {
    if (ln.current) ln.current.textContent = String(Math.floor((scrollY + pointer.y) / 24) + 1);
    if (col.current) col.current.textContent = String(Math.max(1, Math.floor(pointer.x / 9)));
  });

  return (
    <footer className="fixed inset-x-0 bottom-0 z-120 flex h-status items-center justify-between gap-3 overflow-hidden bg-pink font-mono text-[11px] font-medium whitespace-nowrap text-bg">
      <div className="flex h-full min-w-0 items-stretch">
        <span className="flex items-center gap-1.5 bg-bg px-3.5 text-mint">⎇ main</span>
        <span className="hidden items-center px-3.5 mid:flex">Ln&nbsp;<span ref={ln}>1</span>,&nbsp;Col&nbsp;<span ref={col}>1</span></span>
        <span
          role="status"
          data-visible={toast ? "" : undefined}
          className="flex translate-y-2.5 items-center gap-1.5 bg-bg px-3 text-amber opacity-0 transition-[opacity,translate] duration-[300ms,400ms] ease-out-expo data-visible:translate-y-0 data-visible:opacity-100"
        >
          {toast || " "}
        </span>
      </div>
      <div className="flex items-center gap-4 pr-3.5">
        <button type="button" onClick={toggleInspect} className={`${BUTTON} ${inspect ? "bg-bg px-2.5! text-mint!" : ""}`}>
          {t("⌥ inspecter", "⌥ inspect")}
        </button>
        <button type="button" onClick={toggleSound} className={BUTTON}>♪ {sound ? t("son", "sound") : t("muet", "muted")}</button>
        <button type="button" onClick={toggleTheme} className={BUTTON}>◐ {theme === "light" ? t("clair", "light") : t("sombre", "dark")}</button>
        <span className="hidden desk:inline">UTF-8</span>
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "fr" : "en")}
          aria-label="FR / EN"
          className="flex h-status flex-none items-center gap-1 border-none bg-bg px-[9px] text-[11px] font-semibold"
        >
          <span className={lang === "fr" ? "text-mint" : "text-d1"}>FR</span>
          <span className="text-d2">/</span>
          <span className={lang === "en" ? "text-mint" : "text-d1"}>EN</span>
        </button>
        <span>Dakar {dakar}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-[7px] rounded-full bg-bg" />
          {t("disponible", "available")}
          <span className="hidden desk:inline">&nbsp;{t("· stage · poste · mission", "· internship · job · freelance")}</span>
        </span>
      </div>
    </footer>
  );
}
