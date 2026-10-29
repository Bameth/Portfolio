"use client";

import type { ReactNode } from "react";
import type { FoldId } from "@/types/content";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

interface Props {
  id: FoldId;
  /** Ligne de code affichée au-dessus de la section (« export const travaux… »). */
  heading: ReactNode;
  /** Résumé affiché quand la section est repliée. */
  summary: string;
  /** Marque l'en-tête comme texte « construit » par la tête 3D. */
  constructHeading?: boolean;
  children: ReactNode;
}

/** Section repliable comme un bloc de code dans un éditeur. */
export function FoldableSection({ id, heading, summary, constructHeading, children }: Readonly<Props>) {
  const { folded, toggleFold } = usePortfolio();
  const { t } = usePreferences();
  const isFolded = folded[id];
  const label = isFolded ? t("déplier", "unfold") : t("replier", "fold");

  return (
    <section id={id} data-sec={id} data-folded={isFolded ? "" : undefined} className="section-fold relative border-t border-l1">
      <div className="mb-6 font-mono text-[13px] text-d1" data-construct={constructHeading ? "" : undefined}>{heading}</div>
      <button
        type="button"
        onClick={() => toggleFold(id)}
        aria-label={label}
        aria-expanded={!isFolded}
        className="absolute top-(--pt) right-(--section-x) flex h-6 items-center gap-1.5 rounded-[3px] border border-l2 bg-bg px-2 font-mono text-[11px] text-d1 hover:border-mint hover:text-mint"
      >
        <span className="text-mint">{isFolded ? "▸" : "▾"}</span>
        <span className="hidden mid:inline">{label}</span>
      </button>
      {isFolded ? (
        <button
          type="button"
          onClick={() => toggleFold(id)}
          className="flex w-full items-center gap-3 rounded border border-dashed border-l3 bg-p1 px-4 py-3.5 text-left font-mono text-xs text-d1"
        >
          <span className="flex-none text-mint">{"{ … }"}</span>
          <span>{summary + t(" · cliquer pour déplier", " · click to unfold")}</span>
        </button>
      ) : (
        <div>{children}</div>
      )}
    </section>
  );
}
