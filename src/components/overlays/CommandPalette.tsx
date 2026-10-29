"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PROJECTS } from "@/content/projects";
import { SECTIONS, SITE } from "@/content/site";
import { EASE } from "@/lib/env";
import { focusTerminal, openExternal } from "@/lib/navigation";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

interface Item { label: string; kind: string; run: () => void }

/** Palette de commandes (⌘K) : navigation, projets, liens et réglages. */
export function CommandPalette() {
  const ui = usePortfolio();
  const prefs = usePreferences();
  const { t, lang } = prefs;
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const tool = t("outil", "tool"), link = t("lien", "link");
    const all: Item[] = [
      ...SECTIONS.map((s) => ({ label: t("Aller à ", "Go to ") + s.file, kind: "section", run: () => ui.goTo(s.id) })),
      ...PROJECTS.map((p, i) => ({ label: `${t("Ouvrir ", "Open ")}${p.file} · ${p.title}`, kind: t("projet", "project"), run: () => { ui.selectProject(i); ui.goTo("travaux"); } })),
      { label: lang === "en" ? "Passer en français" : "Switch to English", kind: "lang", run: () => prefs.setLang(lang === "en" ? "fr" : "en") },
      { label: t("Ouvrir le terminal", "Open the terminal"), kind: "action", run: () => { ui.goTo("contact"); setTimeout(focusTerminal, 700); } },
      { label: t("Copier l'email", "Copy email"), kind: "action", run: ui.copyEmail },
      { label: t("Télécharger le CV", "Download CV"), kind: "action", run: () => openExternal(SITE.cv) },
      { label: t("Thème clair / sombre", "Light / dark theme"), kind: tool, run: prefs.toggleTheme },
      { label: prefs.sound ? t("Couper le son du clavier", "Mute keyboard sounds") : t("Activer le son du clavier", "Enable keyboard sounds"), kind: tool, run: prefs.toggleSound },
      { label: t("Tout replier", "Fold all sections"), kind: tool, run: () => ui.foldAll(true) },
      { label: t("Tout déplier", "Unfold all sections"), kind: tool, run: () => ui.foldAll(false) },
      { label: t("Inspecter la page (⌥ maintenu)", "Inspect the page (hold ⌥)"), kind: tool, run: ui.toggleInspect },
      { label: "GitHub · " + SITE.github.handle, kind: link, run: () => openExternal(SITE.github.url) },
      { label: "LinkedIn", kind: link, run: () => openExternal(SITE.linkedin.url) },
    ];
    const q = query.toLowerCase().trim();
    return q ? all.filter((i) => i.label.toLowerCase().includes(q)) : all;
  }, [query, t, lang, ui, prefs]);

  useEffect(() => {
    if (!ui.paletteOpen) return;
    setQuery("");
    setIndex(0);
    input.current?.focus();
    panel.current?.animate([{ opacity: 0, transform: "translateY(-12px) scale(.98)" }, { opacity: 1, transform: "none" }], { duration: 350, easing: EASE });
  }, [ui.paletteOpen]);

  if (!ui.paletteOpen) return null;

  const close = () => ui.setPaletteOpen(false);
  const current = Math.min(index, Math.max(0, items.length - 1));
  const choose = (item: Item) => { item.run(); close(); };

  const onKey = (e: React.KeyboardEvent) => {
    if (!items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setIndex((current + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIndex((current - 1 + items.length) % items.length); }
    else if (e.key === "Enter") choose(items[current]);
  };

  return (
    <div onClick={close} role="presentation" className="fixed inset-0 z-250 flex items-start justify-center bg-[rgba(7,11,23,.72)] px-4 pt-[12vh] pb-4 backdrop-blur-[6px]">
      <div
        ref={panel}
        data-palette=""
        role="dialog"
        aria-modal="true"
        aria-label={t("Palette de commandes", "Command palette")}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[620px] overflow-hidden rounded-lg border border-l3 bg-p1 font-mono shadow-[0_40px_80px_rgba(0,0,0,.5)]"
      >
        <div className="flex items-center gap-3 border-b border-l2 px-[18px] py-4">
          <span className="text-pink">›</span>
          <input
            ref={input}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
            onKeyDown={onKey}
            placeholder={t("Aller à, ouvrir un projet, copier l'email…", "Go to, open a project, copy email…")}
            className="min-w-0 flex-1 border-none bg-transparent p-0 text-base text-t1 caret-mint outline-none mid:text-[13px]"
          />
          <button type="button" onClick={close} className="rounded-[3px] border border-l3 bg-transparent px-1.5 py-[3px] font-mono text-[10px] text-d1">esc</button>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-1.5">
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={() => choose(item)}
              onMouseEnter={() => setIndex(i)}
              className={`flex w-full items-center justify-between gap-3 rounded border-none px-3.5 py-3 text-left font-mono text-[13px] ${i === current ? "bg-sel text-mint" : "bg-transparent text-t1"}`}
            >
              <span>{item.label}</span>
              <span className="flex-none text-[10px] text-d1">{item.kind}</span>
            </button>
          ))}
          {!items.length && <div className="px-3.5 py-4 text-[13px] text-d1">{t("Aucun résultat.", "No results.")}</div>}
        </div>
        <div className="flex gap-4 border-t border-l2 px-[18px] py-2.5 text-[10px] text-d2">
          <span>{t("↑↓ naviguer", "↑↓ navigate")}</span>
          <span>{t("↵ ouvrir", "↵ open")}</span>
          <span>{t("← → captures", "← → screenshots")}</span>
        </div>
      </div>
    </div>
  );
}
