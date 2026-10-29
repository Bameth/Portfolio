"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang, Localized } from "@/types/content";
import { THEME_COLOR, type Theme } from "@/lib/theme";
import { STORAGE_KEYS, storage } from "@/lib/storage";
import { keyClick } from "@/lib/sound";

interface Preferences {
  lang: Lang;
  theme: Theme;
  sound: boolean;
  setLang: (lang: Lang) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  /** Choisit le texte selon la langue active. */
  t: (fr: string, en: string) => string;
  pick: (text: Localized) => string;
  /** Joue un clic de clavier si le son est activé. */
  click: (kind: "key" | "enter") => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

const TITLES: Record<Lang, string> = {
  fr: "Ameth Ba · Développeur Full-Stack · Dakar ⇄ Montréal",
  en: "Ameth Ba · Full-Stack Developer · Dakar ⇄ Montréal",
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Valeurs serveur par défaut ; les préférences enregistrées sont lues après l'hydratation.
  const [lang, setLangState] = useState<Lang>("fr");
  const [theme, setTheme] = useState<Theme>("dark");
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const savedLang = storage.get(STORAGE_KEYS.lang);
    setLangState(savedLang === "en" || savedLang === "fr" ? savedLang : /^en/i.test(navigator.language) ? "en" : "fr");
    setTheme(storage.get(STORAGE_KEYS.theme) === "light" ? "light" : "dark");
    setSound(storage.get(STORAGE_KEYS.sound) === "1");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = TITLES[lang];
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  const setLang = useCallback((next: Lang) => {
    storage.set(STORAGE_KEYS.lang, next);
    setLangState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      storage.set(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSound((current) => {
      storage.set(STORAGE_KEYS.sound, current ? "0" : "1");
      if (!current) setTimeout(() => keyClick("enter"), 30);
      return !current;
    });
  }, []);

  const value = useMemo<Preferences>(() => ({
    lang, theme, sound, setLang, toggleTheme, toggleSound,
    t: (fr, en) => (lang === "en" ? en : fr),
    pick: (text) => text[lang],
    click: (kind) => { if (sound) keyClick(kind); },
  }), [lang, theme, sound, setLang, toggleTheme, toggleSound]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences doit être utilisé dans <PreferencesProvider>");
  return ctx;
}
