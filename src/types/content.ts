/** Langues prises en charge par le site. */
export type Lang = "fr" | "en";

/** Texte disponible dans les deux langues. */
export type Localized = Record<Lang, string>;

/** Teintes du design system, chacune correspond à une variable CSS `--<tone>`. */
export type Tone =
  | "mint"
  | "pink"
  | "amber"
  | "violet"
  | "orange"
  | "blue"
  | "d1";

export type SectionId = "index" | "travaux" | "stack" | "parcours" | "contact";

/** Sections qu'on peut replier comme un bloc de code. */
export type FoldId = "travaux" | "stack" | "parcours";

export interface Section {
  id: SectionId;
  file: string;
  tone: Tone;
  /** Symbole affiché dans le fil d'Ariane quand la section est active. */
  symbol: Localized;
}

export interface Project {
  slug: string;
  file: string;
  tone: Tone;
  title: string;
  category: Localized;
  role: Localized;
  status: "deployed" | "completed";
  /** URL de production, absente pour les projets non déployés. */
  demo?: string;
  summary: Localized;
  description: Localized;
  tools: string[];
  /** Identifiants Cloudinary des captures d'écran. */
  shots: string[];
}

export interface Tech {
  /** Identifiant Simple Icons, vide si aucun logo n'existe. */
  icon: string;
  /** Couleur de marque, hexadécimal sans `#`. */
  color: string;
  /** Slugs des projets qui utilisent cette technologie. */
  projects: string[];
  /** Monogramme affiché à la place du logo. */
  mono?: string;
}

export interface StackLayer {
  label: Localized;
  tone: Tone;
  items: { name: string; note: Localized }[];
}

/** Requête simulée qui parcourt les couches de la stack. */
export interface StackRoute {
  request: string;
  project: string;
  /** Indices des couches traversées, dans l'ordre. */
  path: number[];
  /** Technologie mise en évidence à chaque étape de `path`. */
  hits: string[];
  response: Localized;
  latency: string;
}

export interface Commit {
  hash: string;
  ref?: string;
  tone: Tone;
  type: "feat" | "work" | "release" | "chore" | "init";
  message: Localized;
  where: Localized;
  city: string;
  date: Localized;
}
