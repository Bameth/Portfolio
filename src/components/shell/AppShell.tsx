"use client";

import { HeroSection } from "@/components/sections/hero/HeroSection";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";
import { StackSection } from "@/components/sections/stack/StackSection";
import { JourneySection } from "@/components/sections/journey/JourneySection";
import { ContactSection } from "@/components/sections/contact/ContactSection";
import { CommandPalette } from "@/components/overlays/CommandPalette";
import { LaunchModal } from "@/components/overlays/LaunchModal";
import { useShellEffects } from "./useShellEffects";
import { BootScreen } from "./BootScreen";
import { Header } from "./Header";
import { Breadcrumb } from "./Breadcrumb";
import { Gutter } from "./Gutter";
import { Minimap } from "./Minimap";
import { StatusBar } from "./StatusBar";
import { Caret } from "./Caret";
import { Inspector } from "./Inspector";
import { FxLayer } from "./FxLayer";

export function AppShell() {
  useShellEffects();
  return (
    <div className="relative min-h-screen bg-bg text-t1">
      <BootScreen />
      <Inspector />
      <FxLayer />
      <Caret />
      <Header />
      <Breadcrumb />
      <Gutter />
      <Minimap />
      <StatusBar />
      <main className="pr-(--minimap-w) pl-(--gutter-w)">
        <HeroSection />
        <ProjectsSection />
        <StackSection />
        <JourneySection />
        <ContactSection />
      </main>
      <LaunchModal />
      <CommandPalette />
    </div>
  );
}
