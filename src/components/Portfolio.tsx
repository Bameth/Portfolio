"use client";

import { PreferencesProvider } from "@/state/preferences";
import { PortfolioProvider } from "@/state/portfolio";
import { AppShell } from "./shell/AppShell";

/** Point d'entrée client : fournit l'état global puis monte l'interface « éditeur de code ». */
export function Portfolio() {
  return (
    <PreferencesProvider>
      <PortfolioProvider>
        <AppShell />
      </PortfolioProvider>
    </PreferencesProvider>
  );
}
