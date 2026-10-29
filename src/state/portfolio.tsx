"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FoldId, SectionId } from "@/types/content";
import { PROJECTS } from "@/content/projects";
import { SITE } from "@/content/site";
import { scrollToSection } from "@/lib/navigation";
import { usePreferences } from "./preferences";

export interface LaunchState {
  projectIndex: number;
  shotIndex: number;
  /** Position de l'élément d'origine, pour l'animation d'ouverture. */
  from: { left: number; top: number; width: number; height: number } | null;
}

interface Portfolio {
  active: SectionId;
  setActive: (id: SectionId) => void;
  projectIndex: number;
  shotIndex: number;
  selectProject: (index: number) => void;
  stepShot: (delta: number) => void;
  toast: string;
  notify: (message: string) => void;
  copied: boolean;
  copyEmail: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  launch: LaunchState | null;
  launchProject: (index: number, origin?: Element | null) => void;
  closeLaunch: () => void;
  folded: Record<FoldId, boolean>;
  toggleFold: (id: FoldId) => void;
  foldAll: (folded: boolean) => void;
  inspect: boolean;
  toggleInspect: () => void;
  /** Délai (ms) avant l'animation d'entrée ; `null` tant que l'écran de démarrage est affiché. */
  introDelay: number | null;
  startIntro: (delay: number) => void;
  goTo: (id: SectionId) => void;
}

const PortfolioContext = createContext<Portfolio | null>(null);

const NO_FOLD: Record<FoldId, boolean> = { travaux: false, stack: false, parcours: false };

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { t } = usePreferences();
  const [active, setActive] = useState<SectionId>("index");
  const [projectIndex, setProjectIndex] = useState(0);
  const [shotIndex, setShotIndex] = useState(0);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [launch, setLaunch] = useState<LaunchState | null>(null);
  const [folded, setFolded] = useState(NO_FOLD);
  const [inspect, setInspect] = useState(false);
  const [introDelay, setIntroDelay] = useState<number | null>(null);
  const timers = useRef<{ toast?: number; copied?: number }>({});

  const notify = useCallback((message: string) => {
    setToast(message);
    clearTimeout(timers.current.toast);
    timers.current.toast = window.setTimeout(() => setToast(""), 2400);
  }, []);

  const selectProject = useCallback((index: number) => {
    setProjectIndex(index);
    setShotIndex(0);
    history.replaceState(null, "", "#" + PROJECTS[index].slug);
  }, []);

  const stepShot = useCallback((delta: number) => {
    const n = PROJECTS[projectIndex].shots.length;
    if (n > 1) setShotIndex((i) => (i + delta + n) % n);
  }, [projectIndex]);

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(SITE.email);
    setCopied(true);
    notify(t("✓ email copié", "✓ email copied"));
    clearTimeout(timers.current.copied);
    timers.current.copied = window.setTimeout(() => setCopied(false), 2000);
  }, [notify, t]);

  const launchProject = useCallback((index: number, origin?: Element | null) => {
    const project = PROJECTS[index];
    if (!project?.demo) return;
    const r = origin?.getBoundingClientRect();
    setLaunch({
      projectIndex: index,
      shotIndex: index === projectIndex ? shotIndex : 0,
      from: r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null,
    });
  }, [projectIndex, shotIndex]);

  const toggleFold = useCallback((id: FoldId) => setFolded((f) => ({ ...f, [id]: !f[id] })), []);
  const foldAll = useCallback((value: boolean) => setFolded({ travaux: value, stack: value, parcours: value }), []);

  // Lien direct vers un projet : #sunuterrain, #nsa…
  useEffect(() => {
    const hash = location.hash.slice(1).toLowerCase();
    const index = PROJECTS.findIndex((p) => p.slug === hash);
    if (index >= 0) setProjectIndex(index);
  }, []);

  const value = useMemo<Portfolio>(() => ({
    active, setActive, projectIndex, shotIndex, selectProject, stepShot, toast, notify, copied, copyEmail,
    paletteOpen, setPaletteOpen, launch, launchProject, closeLaunch: () => setLaunch(null),
    folded, toggleFold, foldAll, inspect, toggleInspect: () => setInspect((v) => !v),
    introDelay, startIntro: setIntroDelay, goTo: scrollToSection,
  }), [active, projectIndex, shotIndex, selectProject, stepShot, toast, notify, copied, copyEmail, paletteOpen,
    launch, launchProject, folded, toggleFold, foldAll, inspect, introDelay]);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio doit être utilisé dans <PortfolioProvider>");
  return ctx;
}
