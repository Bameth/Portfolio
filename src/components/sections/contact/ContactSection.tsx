"use client";

import { useState } from "react";
import { Terminal } from "@/features/terminal/Terminal";
import { usePreferences } from "@/state/preferences";
import { BuildSummary } from "./BuildSummary";
import { ContactLinks } from "./ContactLinks";
import { MessageWizard } from "./MessageWizard";

/** Section « contact.sh » : liens directs, assistant de message, et terminal pour les curieux. */
export function ContactSection() {
  const { t } = usePreferences();
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <section id="contact" data-sec="contact" className="border-t border-l1 px-(--section-x) pt-[clamp(80px,10vw,150px)] pb-[clamp(80px,8vw,120px)]">
      <div className="mb-6 font-mono text-[13px] text-d1">contact.sh</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-[clamp(40px,5vw,72px)]">
        <ContactLinks />
        <MessageWizard />
      </div>
      <div className="mt-[clamp(36px,4vw,56px)] flex flex-col gap-3.5">
        <button
          type="button"
          onClick={() => setTerminalOpen((o) => !o)}
          aria-expanded={terminalOpen}
          className="flex min-h-11 items-center gap-2.5 self-start rounded-md border border-dashed border-l3 bg-transparent px-3.5 py-2.5 font-mono text-xs text-d1 hover:border-mint hover:text-mint"
        >
          <span className="text-pink">$</span>
          {terminalOpen ? t(" fermer le terminal", " close the terminal") : t(" ouvrir le terminal (pour les devs)", " open the terminal (for devs)")}
        </button>
        {terminalOpen && <Terminal />}
      </div>
      <BuildSummary />
    </section>
  );
}
