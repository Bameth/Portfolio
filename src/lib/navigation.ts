import type { SectionId } from "@/types/content";

export function scrollToSection(id: SectionId) {
  const el = document.getElementById(id);
  if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "smooth" });
}

/** Ouvre un lien externe dans un nouvel onglet, sans exposer `window.opener`. */
export function openExternal(url: string) {
  window.open(url, "_blank", "noopener");
}

export const focusTerminal = () =>
  document.querySelector<HTMLInputElement>("[data-term-input]")?.focus({ preventScroll: true });
