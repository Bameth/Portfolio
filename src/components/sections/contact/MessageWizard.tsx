"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/content/site";
import { EASE, prefersReducedMotion } from "@/lib/env";
import { openExternal } from "@/lib/navigation";
import { usePreferences } from "@/state/preferences";

type Via = "mail" | "wa";

interface Draft {
  step: 0 | 1 | 2;
  who: number;
  purpose: number;
  name: string;
  message: string;
  edited: boolean;
  sent: Via | null;
}

const EMPTY: Draft = { step: 0, who: -1, purpose: -1, name: "", message: "", edited: false, sent: null };

const WHO = [["Recruteur · RH", "Recruiter · HR"], ["Client", "Client"], ["Développeur", "Developer"], ["Autre", "Other"]] as const;
const PURPOSE = [["Un stage", "An internship"], ["Un poste", "A job"], ["Un projet freelance", "A freelance project"], ["Une question", "A question"]] as const;
const SUBJECT = [["Stage", "Internship"], ["Poste", "Job"], ["Projet", "Project"], ["Question", "Question"]] as const;

/** Assistant de message en trois étapes ; l'envoi ouvre la messagerie ou WhatsApp, déjà rempli. */
export function MessageWizard() {
  const { t, lang } = usePreferences();
  const [d, setD] = useState<Draft>(EMPTY);
  const update = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));
  const arc = useRef<SVGPathElement>(null);
  const packet = useRef<HTMLSpanElement>(null);
  const done = useRef<HTMLDivElement>(null);

  const template = (who: number, purpose: number) => {
    const open = who === 2 ? t("Salut Ameth,", "Hey Ameth,") : t("Bonjour Ameth,", "Hi Ameth,");
    const body = [
      t("je te contacte au sujet d'un stage de développeur.", "I'm reaching out about a developer internship."),
      t("je te contacte au sujet d'un poste de développeur.", "I'm reaching out about a developer position."),
      t("j'ai un projet à te proposer : ", "I have a project for you: "),
      t("j'ai une question : ", "I have a question: "),
    ][purpose] ?? "";
    return open + "\n\n" + body;
  };

  const send = (via: Via) => {
    const msg = (d.message || template(d.who, d.purpose)) + (d.name ? "\n\n" + d.name : "");
    const i = lang === "en" ? 1 : 0;
    if (via === "wa") openExternal(`${SITE.whatsapp}?text=${encodeURIComponent(msg)}`);
    else {
      const subject = ["Portfolio", SUBJECT[d.purpose]?.[i], d.name].filter(Boolean).join(" · ");
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    }
    update({ sent: via });
  };

  // Animation « paquet envoyé » : un point suit l'arc jusqu'à Dakar.
  useEffect(() => {
    if (!d.sent) return;
    const reduce = prefersReducedMotion(), pk = packet.current;
    if (pk?.parentElement) {
      const w = pk.parentElement.getBoundingClientRect().width / 500;
      pk.style.offsetPath = `path('M${60 * w} ${160 * w} Q${250 * w} ${-30 * w} ${440 * w} ${160 * w}')`;
    }
    arc.current?.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 1400, easing: EASE, fill: "both" });
    pk?.animate([{ offsetDistance: "0%", opacity: 1 }, { offsetDistance: "100%", opacity: 1, offset: 0.92 }, { offsetDistance: "100%", opacity: 0 }],
      { duration: reduce ? 1 : 1500, easing: "cubic-bezier(.45,0,.2,1)", fill: "both" });
    done.current?.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
      { duration: 500, delay: reduce ? 0 : 1300, easing: EASE, fill: "both" });
  }, [d.sent]);

  const option = (selected: boolean) =>
    `min-h-[58px] rounded-md border px-4 py-3.5 text-left font-sans text-[17px] transition-colors duration-200 [font-variation-settings:'wdth'_92,'wght'_560] hover:border-mint hover:text-mint ${
      selected ? "border-mint bg-mint/8 text-mint" : "border-l3 bg-transparent text-t1"}`;
  const question = "text-[clamp(24px,2.6vw,36px)] leading-[1.1] [font-variation-settings:'wdth'_86,'wght'_700]";
  const field = "w-full rounded-md border border-l3 bg-bg px-4 py-3.5 font-sans text-[17px] text-t1 outline-none focus:border-mint";

  return (
    <div className="flex min-w-0 flex-col gap-[18px]">
      <div className="overflow-hidden rounded-[10px] border border-l2 bg-p1">
        <div className="flex items-center justify-between gap-3 border-b border-l2 px-[18px] py-3 font-mono text-[11px] text-d1">
          <span>{t("nouveau message", "new message")}</span>
          <span className="flex items-center gap-2.5">
            <span className="flex gap-[5px]">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`h-[3px] w-[18px] rounded-[2px] transition-colors duration-300 ${d.sent || i <= d.step ? "bg-mint" : "bg-l3"}`} />
              ))}
            </span>
            {d.sent ? "✓" : `${d.step + 1} / 3`}
          </span>
        </div>
        <div className="flex flex-col gap-[18px] p-[clamp(18px,2.4vw,28px)]">
          {!d.sent && d.step === 0 && (
            <>
              <div className={question}>{t("Tu es ?", "You are?")}</div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2.5">
                {WHO.map((l, i) => (
                  <button key={l[0]} type="button" className={option(d.who === i)} onClick={() => update({ who: i, step: 1 })}>{t(l[0], l[1])}</button>
                ))}
              </div>
            </>
          )}
          {!d.sent && d.step === 1 && (
            <>
              <div className={question}>{t("C'est pour ?", "It's about?")}</div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2.5">
                {PURPOSE.map((l, i) => (
                  <button
                    key={l[0]}
                    type="button"
                    className={option(d.purpose === i)}
                    onClick={() => update({ purpose: i, step: 2, message: d.edited ? d.message : template(d.who, i) })}
                  >
                    {t(l[0], l[1])}
                  </button>
                ))}
              </div>
            </>
          )}
          {!d.sent && d.step === 2 && (
            <>
              <div className={question}>{t("Ton message", "Your message")}</div>
              <input
                value={d.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder={t("Ton nom (et ton entreprise)", "Your name (and company)")}
                aria-label={t("Nom", "Name")}
                className={field}
              />
              <textarea
                value={d.message}
                onChange={(e) => update({ message: e.target.value, edited: true })}
                rows={5}
                aria-label="Message"
                className={`${field} resize-y leading-normal`}
              />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-2.5">
                <button type="button" onClick={() => send("mail")} className="min-h-[54px] rounded-md border-none bg-pink px-4 py-3.5 font-sans text-base text-bg [font-variation-settings:'wdth'_92,'wght'_700]">
                  {t("Envoyer par email", "Send by email")}
                </button>
                <button type="button" onClick={() => send("wa")} className="min-h-[54px] rounded-md border border-l3 bg-transparent px-4 py-3.5 font-sans text-base text-t1 [font-variation-settings:'wdth'_92,'wght'_700] hover:border-mint hover:text-mint">
                  {t("Envoyer sur WhatsApp", "Send on WhatsApp")}
                </button>
              </div>
            </>
          )}
          {d.sent && (
            <>
              <div className="relative mx-auto aspect-5/2 w-full max-w-[520px]">
                <svg viewBox="0 0 500 200" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
                  <path ref={arc} d="M60 160 Q250 -30 440 160" fill="none" stroke="var(--mint)" strokeWidth="1.5" strokeDasharray="4 6" pathLength={100} />
                  <circle cx="60" cy="160" r="5" fill="var(--t1)" />
                  <circle cx="440" cy="160" r="7" fill="var(--pink)" />
                  <text x="60" y="190" textAnchor="middle" fill="var(--d1)" fontFamily="var(--font-martian)" fontSize="13">{t("toi", "you")}</text>
                  <text x="440" y="190" textAnchor="middle" fill="var(--t1)" fontFamily="var(--font-martian)" fontSize="13">Dakar</text>
                </svg>
                <span ref={packet} className="absolute top-0 left-0 -mt-1.5 -ml-1.5 size-3 rounded-full bg-mint opacity-0 shadow-[0_0_16px_var(--mint)] [offset-rotate:0deg]" />
              </div>
              <div ref={done} className="flex flex-col gap-1.5 text-center">
                <div className="text-[clamp(22px,2.4vw,32px)] text-mint [font-variation-settings:'wdth'_86,'wght'_700]">
                  {d.sent === "wa" ? t("Message prêt sur WhatsApp", "Message ready on WhatsApp") : t("Message prêt dans ta messagerie", "Message ready in your mail app")}
                </div>
                <div className="font-mono text-xs text-d1">{t("il ne reste qu'à appuyer sur envoyer · réponse sous 24 h", "just hit send · reply within 24 h")}</div>
              </div>
              <button type="button" onClick={() => setD(EMPTY)} className="self-center rounded-md border border-l3 bg-transparent px-4 py-3 font-mono text-xs text-d1 hover:border-mint hover:text-mint">
                {t("nouveau message", "new message")}
              </button>
            </>
          )}
          {!d.sent && d.step > 0 && (
            <button type="button" onClick={() => update({ step: (d.step - 1) as Draft["step"] })} className="self-start border-none bg-transparent py-2 font-mono text-xs text-d1 hover:text-mint">
              {t("← retour", "← back")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
