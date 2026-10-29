import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Apparition floutée à l'entrée dans l'écran (désactivée pour les titres déjà visibles). */
  reveal?: boolean;
  /** Le titre fait partie du texte « construit » par les glyphes de la tête 3D. */
  construct?: boolean;
  className?: string;
}

/** Grand titre de section en police variable : brouillé à l'apparition, élargi au survol (voir `.section-title`). */
export function SectionTitle({ children, reveal = true, construct = false, className = "" }: Readonly<Props>) {
  return (
    <h2
      className={`section-title ${className}`}
      data-title=""
      data-reveal={reveal ? "" : undefined}
      data-construct={construct ? "" : undefined}
    >
      {children}
    </h2>
  );
}

/** Ponctuation ou compteur coloré à l'intérieur d'un titre. */
export function TitleAccent({ children, variant = "dot" }: Readonly<{ children: ReactNode; variant?: "dot" | "count" }>) {
  return variant === "count" ? (
    <span className="ml-[.3em] align-top font-mono text-[.14em] text-mint [font-variation-settings:normal]">{children}</span>
  ) : (
    <span className="text-mint">{children}</span>
  );
}
