"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/content/site";
import { TERMINAL_INTRO } from "@/content/terminal";
import { focusTerminal, openExternal } from "@/lib/navigation";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";
import { WIZARD_STEPS, ghostFor, quickActions, runCommand, wizardLabel, type TerminalActions, type TerminalState } from "./commands";

/** Terminal « contact.sh » : vraies commandes, autocomplétion, historique et formulaire guidé. */
export function Terminal() {
  const portfolio = usePortfolio();
  const prefs = usePreferences();
  const { lang, t, click } = prefs;
  const [state, setState] = useState<TerminalState>(() => ({
    lines: [{ text: TERMINAL_INTRO[lang], color: "var(--d1)" }], input: "", wizard: null, draft: {}, history: [],
  }));
  const scroller = useRef<HTMLDivElement>(null);
  const historyIndex = useRef<number | null>(null);

  // Tant que seul le message d'accueil est affiché, il suit la langue.
  useEffect(() => {
    setState((s) => (s.lines.length === 1 && !s.wizard ? { ...s, lines: [{ text: TERMINAL_INTRO[lang], color: "var(--d1)" }] } : s));
  }, [lang]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [state.lines.length]);

  const actions: TerminalActions = {
    lang, theme: prefs.theme, open: openExternal, copyEmail: portfolio.copyEmail, setLang: prefs.setLang, toggleTheme: prefs.toggleTheme,
    notify: portfolio.notify,
    showProject: (i) => { portfolio.selectProject(i); setTimeout(() => portfolio.goTo("travaux"), 300); },
    launchProject: (i) => setTimeout(() => portfolio.launchProject(i, scroller.current), 250),
    sendMail: (subject, body) => setTimeout(() => {
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 700),
  };

  // Hors d'un updater : les commandes ont des effets de bord (ouvrir un lien, copier…).
  const run = (raw: string) => setState(runCommand(state, raw, actions));
  const ghost = ghostFor(state, lang);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") click(e.key === "Enter" ? "enter" : "key");
    const atEnd = e.currentTarget.selectionStart === state.input.length;
    if ((e.key === "Tab" || (e.key === "ArrowRight" && atEnd)) && ghost) {
      e.preventDefault();
      setState((s) => ({ ...s, input: s.input + ghost }));
      return;
    }
    if (e.key === "Tab") { e.preventDefault(); return; }
    if (e.key === "Escape" && state.wizard) { e.preventDefault(); e.stopPropagation(); run("annuler"); return; }
    if (state.wizard) return;
    const h = state.history;
    if (e.key === "ArrowUp" && h.length) {
      e.preventDefault();
      historyIndex.current = historyIndex.current == null ? h.length - 1 : Math.max(0, historyIndex.current - 1);
      setState((s) => ({ ...s, input: h[historyIndex.current!] }));
    } else if (e.key === "ArrowDown" && historyIndex.current != null) {
      e.preventDefault();
      historyIndex.current += 1;
      const value = historyIndex.current >= h.length ? "" : h[historyIndex.current];
      if (historyIndex.current >= h.length) historyIndex.current = null;
      setState((s) => ({ ...s, input: value }));
    } else if (e.key === "Enter") historyIndex.current = null;
  };

  const placeholder = {
    nom: t("Prénom Nom", "First Last"), email: t("toi@exemple.com", "you@example.com"), message: t("une ligne suffit", "one line is enough"),
    sujet: "1 à 5", ok: t("envoyer", "send"),
  }[state.wizard ?? "ok"];
  const hint = state.wizard === "ok"
    ? t("récap · esc annuler", "summary · esc to cancel")
    : state.wizard
      ? t("étape ", "step ") + (WIZARD_STEPS.indexOf(state.wizard) + 1) + t("/4 · esc annuler", "/4 · esc to cancel")
      : t("tab ⇥ compléter · ↑ historique", "tab ⇥ complete · ↑ history");

  return (
    <div onClick={focusTerminal} className="overflow-hidden rounded-md border border-l2 bg-p2 font-mono text-[13px]">
      <div className="flex justify-between border-b border-l2 px-4 py-3 text-[11px] text-d1">
        <span>contact.sh · zsh</span>
        <span>{hint}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 px-3.5 pt-2.5">
        {quickActions(state, lang).map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={(e) => { e.stopPropagation(); run(q.value); focusTerminal(); }}
            className={`flex items-center gap-1.5 rounded-[3px] border bg-p1 px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-200 hover:border-mint hover:text-mint ${q.hot ? "border-l3 text-t1" : "border-l2 text-d1"}`}
          >
            {q.num ? <span className="text-pink">{q.num}</span> : null}
            {q.label}
          </button>
        ))}
      </div>
      <div ref={scroller} className="h-[340px] overflow-y-auto px-[18px] pt-3.5 pb-[18px] leading-[1.85] mid:h-[400px]">
        {state.lines.map((l, i) => <div key={i} className="break-words whitespace-pre-wrap" style={{ color: l.color }}>{l.text}</div>)}
        <form onSubmit={(e) => { e.preventDefault(); run(state.input); }} className="flex items-baseline gap-2.5">
          <span className="flex-none text-pink">{state.wizard ? wizardLabel(state.wizard, lang) + " ›" : "~ $"}</span>
          <div className="relative flex min-w-0 flex-1 text-base leading-[1.85] mid:text-[13px]">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden whitespace-pre text-transparent">
              {state.input}<span className="text-d2">{ghost}</span>
            </span>
            <input
              data-term-input=""
              value={state.input}
              onChange={(e) => setState((s) => ({ ...s, input: e.target.value }))}
              onKeyDown={onKey}
              placeholder={state.wizard ? placeholder : state.lines.length < 2 ? "contact" : ""}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Terminal"
              className="relative min-w-0 flex-1 border-none bg-transparent p-0 text-t1 caret-mint outline-none"
            />
          </div>
          {ghost && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setState((s) => ({ ...s, input: s.input + ghost })); focusTerminal(); }}
              className="flex flex-none items-center rounded-[3px] border border-l3 bg-transparent px-[7px] py-px text-[10px] text-d1"
            >
              tab ⇥
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
