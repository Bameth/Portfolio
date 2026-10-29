import type { Tone } from "@/types/content";

export type Theme = "dark" | "light";

/** Référence CSS à une teinte du design system, résolue selon le thème actif. */
export const tone = (t: Tone) => `var(--${t})`;

/** Couleur de fond par thème, pour `<meta name="theme-color">`. */
export const THEME_COLOR: Record<Theme, string> = { dark: "#0D1224", light: "#F3EFE6" };

/**
 * Valeurs brutes pour les rendus canvas et WebGL, qui ne lisent pas les variables CSS.
 * Doivent rester alignées sur `globals.css`.
 */
export const RAW = {
  dark: { base: "#D3D8E8", mint: "#16F2B3", pink: "#F626AF", amber: "#FCD34D", violet: "#A78BFA", dim: "#2A3560", bg: "#0D1224" },
  light: { base: "#1B1E2B", mint: "#0A8F69", pink: "#C8137F", amber: "#A66F00", violet: "#6B4CD6", dim: "#B4BACD", bg: "#F3EFE6" },
} as const;

/** Dégradé de l'extrusion du grand titre (14 couches, de la plus proche à la plus lointaine). */
const ramp = (from: number[], to: number[]) =>
  Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    return `rgb(${from.map((v, k) => Math.round(v + (to[k] - v) * t)).join(",")})`;
  });

export const EXTRUSION: Record<Theme, string[]> = {
  dark: ramp([58, 69, 112], [11, 16, 34]),
  light: ramp([185, 176, 157], [234, 229, 217]),
};
