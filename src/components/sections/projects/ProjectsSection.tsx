"use client";

import { FoldableSection } from "@/components/ui/FoldableSection";
import { SectionTitle, TitleAccent } from "@/components/ui/SectionTitle";
import { PROJECTS } from "@/content/projects";
import { usePreferences } from "@/state/preferences";
import { ProjectTabs } from "./ProjectTabs";
import { ProjectDetails } from "./ProjectDetails";
import { ShotDeck } from "./ShotDeck";

/** Section « travaux.ts » : les projets, présentés comme un tableau TypeScript. */
export function ProjectsSection() {
  const { t } = usePreferences();
  return (
    <FoldableSection
      id="travaux"
      constructHeading
      summary={t(`${PROJECTS.length} projets`, `${PROJECTS.length} projects`)}
      heading={<><span className="text-pink">export const</span> <span className="text-t1">travaux</span>: <span className="text-mint">Projet</span>[] = [</>}
    >
      <SectionTitle construct className="mb-[clamp(32px,4vw,56px)]">
        {t("Travaux", "Work")}
        <TitleAccent variant="count">{PROJECTS.length}</TitleAccent>
      </SectionTitle>
      <div data-construct="" className="overflow-hidden rounded-md border border-l2 bg-p1">
        <ProjectTabs />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))]">
          <ProjectDetails />
          <ShotDeck />
        </div>
      </div>
      <div className="mt-6 font-mono text-[13px] text-d1">];</div>
    </FoldableSection>
  );
}
