"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS, domainOf } from "@/content/projects";
import { EASE } from "@/lib/env";
import { pad2 } from "@/lib/text";
import { tone } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

/** Fiche du projet sélectionné : description, rôle, statut, stack et liens. */
export function ProjectDetails() {
  const { projectIndex, launchProject, notify } = usePortfolio();
  const { t, pick } = usePreferences();
  const [more, setMore] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const p = PROJECTS[projectIndex];

  useEffect(() => {
    setMore(false);
    if (first.current) { first.current = false; return; }
    root.current?.animate([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { duration: 650, easing: EASE });
  }, [projectIndex]);

  const share = () => {
    const url = location.href.split("#")[0] + "#" + p.slug;
    void navigator.clipboard?.writeText(url);
    notify(t("✓ lien copié : #", "✓ link copied: #") + p.slug);
  };

  const launch = (e: React.MouseEvent) => {
    e.preventDefault();
    launchProject(projectIndex, document.querySelector('[data-card="0"]'));
  };

  return (
    <div ref={root} className="flex min-w-0 flex-col gap-[22px] border-r border-l2 p-[clamp(22px,3vw,44px)]">
      <div className="font-mono text-[11px] text-d1">{pad2(projectIndex + 1)} / {pad2(PROJECTS.length)} · {pick(p.category)}</div>
      <h3
        className="m-0 text-[clamp(44px,6vw,104px)] leading-[.85] break-words uppercase [font-variation-settings:'wdth'_68,'wght'_900]"
        style={{ color: tone(p.tone) }}
      >
        {p.title}
      </h3>
      <p className="m-0 text-[clamp(16px,1.4vw,20px)] leading-normal text-pretty text-t2 [font-variation-settings:'wdth'_96,'wght'_400]">
        {pick(more ? p.description : p.summary)}
      </p>
      <button type="button" onClick={() => setMore((m) => !m)} className="self-start border-none bg-transparent p-0 font-mono text-xs text-mint">
        {more ? t("− réduire", "− collapse") : t("+ lire le détail", "+ read more")}
      </button>
      <div className="rounded border border-l2 bg-bg px-4 py-3.5 font-mono text-xs leading-loose">
        <div><span className="text-d1">{t("rôle:", "role:")}</span> <span className="text-amber">&quot;{pick(p.role)}&quot;</span></div>
        <div>
          <span className="text-d1">{t("statut:", "status:")}</span>{" "}
          <span className={p.status === "deployed" ? "text-mint" : "text-amber"}>
            &quot;{p.status === "deployed" ? t("Déployé", "Deployed") : t("Terminé", "Completed")}&quot;
          </span>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <span className="text-d1">stack:</span>
          {p.tools.map((tool) => <span key={tool} className="text-mint">{tool}</span>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {p.demo && (
          <a
            href={p.demo}
            target="_blank"
            rel="noopener"
            onClick={launch}
            className="flex items-center gap-2.5 rounded bg-pink px-[18px] py-[13px] font-mono text-xs font-semibold text-bg hover:text-bg"
          >
            {t("Ouvrir", "Open")} {domainOf(p)} ↗
          </a>
        )}
        <button type="button" onClick={share} className="flex items-center gap-2 rounded border border-l3 bg-transparent px-4 py-[13px] font-mono text-xs text-t1">
          {t("Copier le lien", "Copy link")}
        </button>
      </div>
    </div>
  );
}
