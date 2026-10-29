"use client";

import { SectionTitle, TitleAccent } from "@/components/ui/SectionTitle";
import { SITE } from "@/content/site";
import { useClock } from "@/hooks/useClock";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

/** Colonne gauche du contact : email à copier et raccourcis vers chaque canal. */
export function ContactLinks() {
  const { copied, copyEmail } = usePortfolio();
  const { t } = usePreferences();
  const dakar = useClock(SITE.timezones.dakar);
  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(t("Prise de contact via le portfolio", "Hello from your portfolio"))}`;

  const links = [
    { href: SITE.whatsapp, label: "WhatsApp", sub: SITE.phoneLabel, external: true },
    { href: `tel:${SITE.phone}`, label: t("Appeler", "Call"), sub: t("depuis ton téléphone", "from your phone") },
    { href: SITE.linkedin.url, label: "LinkedIn", sub: SITE.linkedin.handle, external: true },
    { href: SITE.github.url, label: "GitHub", sub: SITE.github.handle, external: true },
    { href: SITE.cv, label: t("Mon CV", "My resume"), sub: "PDF", external: true },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-7">
      <SectionTitle reveal={false}>{t("Écris-moi", "Write me")}<TitleAccent>.</TitleAccent></SectionTitle>
      <div className="flex items-center gap-2.5 font-mono text-[13px] text-d1">
        <span className="size-2 flex-none rounded-full bg-mint shadow-[0_0_0_4px_rgba(22,242,179,.15)]" />
        <span>{t("Il est", "It's")}</span>
        <span className="text-t1">{dakar}</span>
        <span>{t("à Dakar · je réponds sous 24 h", "in Dakar · I reply within 24 h")}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <button
          type="button"
          onClick={copyEmail}
          className="max-w-full self-start border-0 border-b-2 border-mint bg-transparent pb-1.5 text-left font-sans text-[clamp(24px,3.6vw,54px)] leading-[1.05] break-all text-t1 [font-variation-settings:'wdth'_78,'wght'_700] hover:text-mint"
        >
          {SITE.email}
        </button>
        <span className="font-mono text-xs text-d1">
          {copied ? t("✓ copié, colle-le où tu veux", "✓ copied, paste it anywhere") : t("clique pour copier l'adresse", "click to copy the address")}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-2.5">
        <a href={mailto} className="link-card border-pink! bg-pink! text-bg! hover:border-mint!">
          <LinkLabel label={t("Écrire un email", "Write an email")} sub={t("ouvre ta messagerie", "opens your mail app")} />
        </a>
        {links.map((l) => (
          <a key={l.label} href={l.href} className="link-card" {...(l.external ? { target: "_blank", rel: "noopener" } : {})}>
            <LinkLabel label={l.label} sub={l.sub} />
          </a>
        ))}
      </div>
    </div>
  );
}

function LinkLabel({ label, sub }: Readonly<{ label: string; sub: string }>) {
  return (
    <>
      <span className="text-[17px] [font-variation-settings:'wdth'_90,'wght'_650]">{label}</span>
      <span className="font-mono text-[11px] opacity-75">{sub}</span>
    </>
  );
}
