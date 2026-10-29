import type { Section } from "@/types/content";

/** Coordonnées et liens publics, source unique pour tout le site. */
export const SITE = {
  name: "Ameth Ba",
  email: "amethba8826@gmail.com",
  phone: "+221781069049",
  phoneLabel: "+221 78 106 90 49",
  whatsapp: "https://wa.me/221781069049",
  github: { url: "https://github.com/Bameth", handle: "Bameth" },
  linkedin: { url: "https://www.linkedin.com/in/ameth-ba-2920b3253/", handle: "ameth-ba" },
  cv: "/documents/cv-ameth-ba.pdf",
  photo: "/images/ameth.jpg",
  headModel: "/models/ameth.glb",
  /** Modèle de démonstration chargé si `headModel` est introuvable. */
  headModelFallback:
    "https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb",
  coords: "14.69°N · 17.44°W",
  timezones: { dakar: "Africa/Dakar", montreal: "America/Toronto" },
} as const;

export const SECTIONS: Section[] = [
  { id: "index", file: "index.ts", tone: "mint", symbol: { fr: "const ameth", en: "const ameth" } },
  { id: "travaux", file: "travaux.ts", tone: "pink", symbol: { fr: "travaux", en: "travaux" } },
  { id: "stack", file: "stack.yml", tone: "amber", symbol: { fr: "layers[5]", en: "layers[5]" } },
  { id: "parcours", file: "git.log", tone: "violet", symbol: { fr: "git log --graph", en: "git log --graph" } },
  { id: "contact", file: "contact.sh", tone: "mint", symbol: { fr: "contact()", en: "contact()" } },
];
