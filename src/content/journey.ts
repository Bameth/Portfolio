import type { Commit } from "@/types/content";

const same = (s: string) => ({ fr: s, en: s });

/** Parcours, présenté comme un `git log` : du plus récent au premier commit. */
export const COMMITS: Commit[] = [
  {
    hash: "a3f9c1e", ref: "HEAD → montréal", tone: "pink", type: "feat",
    message: { fr: "Maîtrise en génie logiciel", en: "Master's in software engineering" },
    where: same("Université du Québec à Montréal"), city: "Montréal",
    date: { fr: "2026 → en cours", en: "2026 → in progress" },
  },
  {
    hash: "7be21d4", tone: "mint", type: "work",
    message: { fr: "Développeur Full-Stack chez Accel Tech", en: "Full-Stack Developer at Accel Tech" },
    where: { fr: "Expérience professionnelle", en: "Professional experience" }, city: "Dakar",
    date: { fr: "sept. 2025 → déc. 2025", en: "Sep 2025 → Dec 2025" },
  },
  {
    hash: "e4d0a77", ref: "tag: licence", tone: "mint", type: "release",
    message: { fr: "Licence en génie logiciel", en: "Bachelor's in software engineering" },
    where: same("Institut Supérieur de Management"), city: "Dakar", date: same("2022 → 2025"),
  },
  {
    hash: "19c6b02", tone: "d1", type: "chore",
    message: { fr: "Baccalauréat", en: "High school diploma (Baccalauréat)" },
    where: same("Collège Notre-Dame du Liban"), city: "Dakar", date: same("2019 → 2022"),
  },
  {
    hash: "0b8e5f3", tone: "d1", type: "chore",
    message: { fr: "Brevet de fin d'études moyennes", en: "Middle school diploma (BFEM)" },
    where: same("Collège Notre-Dame du Liban"), city: "Dakar", date: same("2015 → 2019"),
  },
  {
    hash: "0000001", ref: "origin/dakar", tone: "amber", type: "init",
    message: { fr: "Premier commit", en: "First commit" },
    where: { fr: "École Kawabata Yasunari (CFEE)", en: "Kawabata Yasunari primary school (CFEE)" }, city: "Dakar",
    date: same("2009 → 2015"),
  },
];

/** Coordonnées [longitude, latitude] des deux villes reliées sur le globe. */
export const DAKAR: [number, number] = [-17.44, 14.69];
export const MONTREAL: [number, number] = [-73.57, 45.5];
