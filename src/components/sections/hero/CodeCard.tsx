"use client";

import { useState } from "react";
import { SITE } from "@/content/site";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

type Token = Readonly<{ children: React.ReactNode }>;
/** Coloration syntaxique : ponctuation, chaîne, mot-clé. */
const P = ({ children }: Token) => <span className="text-d1">{children}</span>;
const S = ({ children }: Token) => <span className="text-amber">{children}</span>;
const K = ({ children }: Token) => <span className="text-pink">{children}</span>;

/** Carte « ameth.ts » : présentation sous forme d'objet TypeScript, avec un bouton Exécuter. */
export function CodeCard() {
  const { notify, goTo } = usePortfolio();
  const { t } = usePreferences();
  const [ran, setRan] = useState(false);

  const run = () => {
    setRan(true);
    notify("→ true");
    setTimeout(() => goTo("contact"), 900);
  };

  return (
    <div data-tilt="1" className="mt-[clamp(28px,3.5vw,48px)] overflow-hidden rounded-md border border-l2 bg-p1 font-mono text-[clamp(11.5px,1.05vw,15px)] leading-[1.95] shadow-[0_30px_80px_rgba(0,0,0,.35)]">
      <div className="flex items-center justify-between border-b border-l2 px-4 py-2.5 text-[11px] text-d1"><span>ameth.ts</span><span>TypeScript</span></div>
      <div className="overflow-x-auto px-[18px] py-4">
        <div data-type="19" className="whitespace-pre"><K>const</K> ameth <K>=</K> <P>{"{"}</P></div>
        <div data-type="35" className="whitespace-pre">  {t("rôle", "role")}<P>:</P> <S>&quot;{t("Développeur Full-Stack", "Full-Stack Developer")}&quot;</S><P>,</P></div>
        <div data-type="31" className="whitespace-pre">  base<P>:</P> <P>[</P><S>&quot;Dakar&quot;</S><P>,</P> <S>&quot;Montréal&quot;</S><P>],</P></div>
        <div data-type="49" className="whitespace-pre">  {t("enProd", "inProd")}<P>:</P> <P>[</P><S>&quot;gogainde.sn&quot;</S><P>,</P> <S>&quot;sunuterrain.com&quot;</S><P>],</P></div>
        <div data-type="19" className="whitespace-pre">  {t("disponible", "available")}<P>:</P> <span className="text-orange">true</span><P>,</P></div>
        <div data-type="2" className="whitespace-pre text-d1">{"};"}</div>
        <div data-type="21" className="mt-2 whitespace-pre">ameth<P>.</P><span className="text-mint">{t("collaborer", "collaborate")}</span><P>(</P>{t("toi", "you")}<P>);</P></div>
        {ran && <div className="whitespace-pre text-mint">→ true <span className="text-d1">{t("// direction contact.sh", "// off to contact.sh")}</span></div>}
      </div>
      <div className="flex flex-wrap gap-2.5 px-[18px] pb-[18px]">
        <button type="button" data-in="" className="flex items-center gap-2.5 rounded border-none bg-mint px-[18px] py-3 font-mono text-xs font-semibold text-bg" onClick={run}>{t("▶ Exécuter", "▶ Run")}</button>
        <a data-in="" href={SITE.cv} target="_blank" rel="noopener" className="flex items-center gap-2.5 rounded border border-l3 px-[18px] py-3 text-xs text-t1">cv-ameth-ba.pdf ↓</a>
      </div>
    </div>
  );
}
