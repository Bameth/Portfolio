"use client";

import { PROJECTS } from "@/content/projects";
import { SECTIONS } from "@/content/site";
import { tone } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

/** Fil d'Ariane de l'éditeur : fichier et symbole de la section visible. */
export function Breadcrumb() {
  const { active, projectIndex } = usePortfolio();
  const { pick } = usePreferences();
  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const project = PROJECTS[projectIndex];
  const isProjects = active === "travaux";
  const color = tone(isProjects ? project.tone : section.tone);
  const sep = <span className="text-d2">›</span>;

  return (
    <div className="fixed top-header right-(--minimap-w) left-(--gutter-w) z-59 flex h-crumb items-center gap-2 overflow-hidden border-b border-l1 bg-bar px-4 font-mono text-[11px] whitespace-nowrap text-d1 backdrop-blur-[6px]">
      <span>portfolio</span>{sep}<span>src</span>{sep}
      <span className="flex items-center gap-1.5 text-t1">
        <span className="size-[7px] rounded-[2px]" style={{ background: color }} />
        {section.file}
      </span>
      {sep}
      <span style={{ color }}>{isProjects ? `${project.file} › ${project.title}` : pick(section.symbol)}</span>
    </div>
  );
}
