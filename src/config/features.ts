/**
 * Réglages des animations, repris des paramètres du design Claude (v21).
 * Les valeurs par défaut correspondent à la version validée du design.
 */
export const FEATURES = {
  /** Écran de démarrage : durée longue, courte, ou désactivé. */
  splash: "long" as "long" | "court" | "off",
  /** N'afficher l'écran de démarrage qu'à la première visite. */
  introOnce: true,
  /** Inclinaison 3D et extrusion du titre selon le curseur. */
  effects3d: true,
  /** Glyphes projetés au clic. */
  particles: true,
  /** La tête 3D s'imprime en glyphes à l'arrivée. */
  headPrint: true,
  /** Au défilement, les glyphes de la tête construisent le texte de la section suivante. */
  headExplode: true,
  /** La tête suit le curseur (ou le gyroscope sur mobile). */
  headFollowsCursor: true,
} as const;
