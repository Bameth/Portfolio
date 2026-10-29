"use client";

import { FoldableSection } from "@/components/ui/FoldableSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { LANGUAGES, LAYERS } from "@/content/stack";
import { usePreferences } from "@/state/preferences";
import { StackPipeline } from "./StackPipeline";

/** Section « stack.yml » : langages actifs et schéma des couches traversées par une requête. */
export function StackSection() {
  const { t } = usePreferences();
  return (
    <FoldableSection
      id="stack"
      summary={t(`${LAYERS.length} couches`, `${LAYERS.length} layers`)}
      heading={<>stack.yml <span className="text-d2">{t("# ce que je fais tourner aujourd'hui, de bout en bout", "# what I run today, end to end")}</span></>}
    >
      <div className="mb-[clamp(36px,4vw,56px)] flex flex-wrap items-end justify-between gap-6">
        <SectionTitle>Stack</SectionTitle>
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {LANGUAGES.map((l) => <span key={l} className="rounded-[3px] border border-l3 px-[11px] py-[7px] text-t1">{l}</span>)}
        </div>
      </div>
      <StackPipeline />
    </FoldableSection>
  );
}
