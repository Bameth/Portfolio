/** Distance d'édition entre deux mots, pour suggérer la commande la plus proche. */
export function levenshtein(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

/** Caractères utilisés pour les effets de brouillage et les particules. */
export const GLYPHS = "{}<>/;=()[]#$01*&";

export const randomGlyph = () => GLYPHS[Math.trunc(Math.random() * GLYPHS.length)];

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Police monospace réelle (next/font renomme la famille), pour les rendus canvas. */
export const monoFont = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--font-martian").trim() || "monospace";
