import { PROJECTS, domainOf } from "@/content/projects";
import { LAYERS } from "@/content/stack";
import { SITE } from "@/content/site";
import { EMAIL_DOMAINS, HELP, KEYWORDS, MESSAGE_STARTS, SUBJECTS, COMPLETIONS } from "@/content/terminal";
import { levenshtein } from "@/lib/text";
import type { Lang } from "@/types/content";

export type WizardStep = "nom" | "email" | "sujet" | "message" | "ok";
export const WIZARD_STEPS: WizardStep[] = ["nom", "email", "sujet", "message"];

export interface Line { text: string; color: string }

export interface TerminalState {
  lines: Line[];
  input: string;
  wizard: WizardStep | null;
  draft: { name?: string; email?: string; subject?: string; message?: string };
  history: string[];
}

/** Effets de bord déclenchés par les commandes, fournis par l'interface. */
export interface TerminalActions {
  lang: Lang;
  theme: "dark" | "light";
  open: (url: string) => void;
  copyEmail: () => void;
  setLang: (lang: Lang) => void;
  toggleTheme: () => void;
  showProject: (index: number) => void;
  launchProject: (index: number) => void;
  notify: (msg: string) => void;
  sendMail: (subject: string, body: string) => void;
}

const C = { text: "var(--t1)", dim: "var(--d1)", ok: "var(--mint)", err: "var(--pink)", warn: "var(--amber)" };

export const wizardLabel = (step: WizardStep, lang: Lang) =>
  lang === "en" ? ({ nom: "name", sujet: "subject" } as Partial<Record<WizardStep, string>>)[step] ?? step : step;

/** Exécute une ligne saisie et renvoie le nouvel état du terminal. */
export function runCommand(state: TerminalState, raw: string, a: TerminalActions): TerminalState {
  const en = a.lang === "en", T = (fr: string, e: string) => (en ? e : fr);
  const out: Line[] = [];
  const push = (text: string, color = C.text) => out.push({ text, color });
  const next = (patch: Partial<TerminalState>): TerminalState => ({ ...state, input: "", ...patch, lines: [...state.lines, ...out] });
  const subjects = SUBJECTS[a.lang], starts = MESSAGE_STARTS[a.lang];

  // ── Formulaire de contact pas à pas ──
  if (state.wizard) {
    const v = raw.trim(), d = { ...state.draft };
    push(wizardLabel(state.wizard, a.lang) + " › " + raw, C.dim);
    const go = (wizard: WizardStep, input = "") => next({ wizard, draft: d, input });
    if (/^(annuler|cancel|exit|q)$/i.test(v)) {
      push(T("annulé, rien n'a été envoyé.", "cancelled, nothing was sent."), C.dim);
      return next({ wizard: null, draft: {} });
    }
    switch (state.wizard) {
      case "nom":
        if (!v) { push(T("un nom, même court ?", "a name, even a short one?"), C.err); break; }
        d.name = v;
        push(T("enchanté ", "nice to meet you, ") + v + T(". ton email ?", ". your email?"), C.ok);
        return go("email");
      case "email":
        if (!/^\S+@\S+\.\S+$/.test(v)) {
          push(v.includes("@") ? T("il manque le domaine, tab pour compléter.", "the domain is missing, press tab to complete.") : T("cet email ne semble pas valide, réessaie.", "that email doesn't look valid, try again."), C.err);
          break;
        }
        d.email = v;
        push(T("c'est à propos de quoi ? tape un numéro ou clique :", "what's it about? type a number or click:"), C.ok);
        subjects.forEach((s, i) => push(`  ${i + 1}  ${s}`));
        return go("sujet");
      case "sujet": {
        if (!v) { push(T("choisis 1 à 5.", "pick 1 to 5."), C.err); break; }
        const n = parseInt(v, 10), k = n >= 1 && n <= subjects.length ? n - 1 : subjects.findIndex((s) => s.toLowerCase() === v.toLowerCase());
        d.subject = k >= 0 ? subjects[k] : v;
        push("ok : " + d.subject.toLowerCase() + T(". ton message :", ". your message:"), C.ok);
        if (k >= 0 && starts[k]) push(T("  ↳ début pré-rempli, complète-le ou efface-le.", "  ↳ pre-filled start, finish it or clear it."), C.dim);
        return go("message", k >= 0 ? starts[k] : "");
      }
      case "message":
        if (!v) { push(T("le message est vide.", "the message is empty."), C.err); break; }
        d.message = v;
        push(T("récapitulatif :", "summary:"), C.ok);
        push(T("  de       ", "  from     ") + d.name + " <" + d.email + ">");
        push(T("  sujet    ", "  subject  ") + d.subject);
        push("  message  " + d.message);
        push(T("envoyer · modifier · annuler ?", "send · edit · cancel?"), C.ok);
        return go("ok");
      case "ok":
        if (/^(envoyer|o|oui|y|yes|send|s)$/i.test(v)) {
          push(T("✓ message prêt, ouverture de ta messagerie…", "✓ message ready, opening your mail app…"), C.ok);
          push(T("merci ", "thanks ") + d.name + T(", je réponds vite.", ", I'll get back to you soon."), C.dim);
          a.notify(T("✓ message prêt", "✓ message ready"));
          a.sendMail(`Portfolio · ${d.subject} · ${d.name}`, `${d.message}\n\n${d.name} <${d.email}>`);
          return next({ wizard: null, draft: {} });
        }
        if (/^(modifier|m|edit|e)$/i.test(v)) { push(T("ton message :", "your message:"), C.ok); return go("message", d.message); }
        push(T("envoyer, modifier ou annuler ?", "send, edit or cancel?"), C.err);
    }
    return next({});
  }

  // ── Commandes ──
  const history = raw.trim() ? [...state.history, raw.trim()] : state.history;
  const [cmd = "", ...args] = raw.trim().split(/\s+/);
  const c = cmd.toLowerCase();
  push("$ " + raw, C.dim);

  if (!c) return next({ history });
  if (c === "help") HELP[a.lang].forEach((l) => push(l));
  else if (c === "clear") return { ...state, lines: [], input: "", history };
  else if (c === "whoami") push(T("Ameth Ba, développeur full-stack. Dakar ⇄ Montréal. Deux plateformes en production.", "Ameth Ba, full-stack developer. Dakar ⇄ Montréal. Two platforms in production."), C.ok);
  else if (c === "projets" || c === "projects" || c === "ls")
    PROJECTS.forEach((p, i) => push(`  ${i + 1}  ${p.file.padEnd(16)}${p.status === "deployed" ? T("déployé", "deployed") : T("terminé", "completed")}`));
  else if (c === "stack") LAYERS.forEach((l) => push("  " + l.label[a.lang].padEnd(10) + l.items.map((x) => x.name).join(" · ")));
  else if (c === "ouvrir" || c === "open") {
    const n = parseInt(args[0], 10) - 1;
    if (PROJECTS[n]) { push("→ " + PROJECTS[n].file, C.ok); a.showProject(n); }
    else push(T("usage : ouvrir 1…6", "usage: open 1…6"), C.err);
  } else if (c === "cv") { push("→ cv-ameth-ba.pdf", C.ok); a.open(SITE.cv); }
  else if (c === "github") { push("→ github.com/" + SITE.github.handle, C.ok); a.open(SITE.github.url); }
  else if (c === "linkedin") { push("→ linkedin", C.ok); a.open(SITE.linkedin.url); }
  else if (c === "email") { a.copyEmail(); push(SITE.email + " · " + T("copié ✓", "copied ✓"), C.ok); }
  else if (c === "lang") {
    const L = (args[0] || "").toLowerCase();
    if (L === "fr" || L === "en") { push(L === "en" ? "→ English" : "→ français", C.ok); a.setLang(L); }
    else push("usage : lang fr · lang en", C.err);
  } else if (c === "theme" || c === "thème") {
    a.toggleTheme();
    push("→ " + (a.theme === "light" ? T("thème sombre", "dark theme") : T("thème clair", "light theme")), C.ok);
  } else if (c === "contact" || (c === "sudo" && /embaucher|hire/.test(args.join(" ")))) {
    if (c === "sudo") push(T("[sudo] permission accordée.", "[sudo] permission granted."), C.warn);
    push(T("on commence : 4 petites étapes, esc pour annuler. ton nom ?", "let's go: 4 quick steps, esc to cancel. your name?"), C.ok);
    return next({ wizard: "nom", draft: {}, history });
  } else if (c === "curl") {
    const q = args.join(" ").toLowerCase();
    const k = PROJECTS.findIndex((p) => p.demo && q && (domainOf(p).includes(q) || q.includes(p.slug)));
    if (k >= 0) { push("→ https://" + domainOf(PROJECTS[k]), C.ok); a.launchProject(k); }
    else push(T("usage : curl gogainde · curl sunuterrain", "usage: curl gogainde · curl sunuterrain"), C.err);
  } else {
    const [best, dist] = KEYWORDS.map((k) => [k, levenshtein(c, k)] as const).sort((x, y) => x[1] - y[1])[0];
    push(T("commande introuvable : ", "command not found: ") + c, C.err);
    if (dist <= 2) {
      push(T("tu voulais dire « ", "did you mean “") + best + T(" » ? ↵ pour lancer", "”? ↵ to run"), C.warn);
      return next({ history, input: best });
    }
    if (raw.trim().split(/\s+/).length >= 3) {
      push(T("on dirait un message. tape contact et je te guide pour me l'envoyer.", "looks like a message. type contact and I'll walk you through sending it."), C.warn);
      return next({ history, input: "contact" });
    }
    push(T("tape help pour voir les commandes.", "type help to see the commands."), C.dim);
  }
  return next({ history });
}

/** Suite proposée en gris pour l'autocomplétion (tab ou →). */
export function ghostFor(state: TerminalState, lang: Lang): string {
  const v = state.input, lv = v.toLowerCase();
  if (!v) return "";
  const pick = (list: string[]) => list.find((x) => x.toLowerCase().startsWith(lv) && x.length > v.length)?.slice(v.length) ?? "";
  switch (state.wizard) {
    case null: return pick(COMPLETIONS[lang]);
    case "email": {
      const at = v.indexOf("@");
      if (at < 1) return "";
      const dm = lv.slice(at + 1), m = EMAIL_DOMAINS.find((x) => x.startsWith(dm) && x !== dm);
      return m ? m.slice(dm.length) : "";
    }
    case "sujet": return pick(SUBJECTS[lang]);
    case "ok": return pick(lang === "en" ? ["send", "edit", "cancel"] : ["envoyer", "modifier", "annuler"]);
    default: return "";
  }
}

export interface QuickAction { label: string; value: string; num?: number; hot?: boolean }

/** Raccourcis cliquables adaptés à l'étape en cours. */
export function quickActions(state: TerminalState, lang: Lang): QuickAction[] {
  const en = lang === "en", cancel = { label: en ? "cancel" : "annuler", value: en ? "cancel" : "annuler" };
  switch (state.wizard) {
    case "sujet": return SUBJECTS[lang].map((s, i) => ({ label: s, value: String(i + 1), num: i + 1, hot: true }));
    case "email": {
      const at = state.input.indexOf("@");
      return at > 0
        ? [...EMAIL_DOMAINS.slice(0, 4).map((dm) => { const val = state.input.slice(0, at + 1) + dm; return { label: val, value: val, hot: true }; }), cancel]
        : [cancel];
    }
    case "ok": {
      const s = en ? "send" : "envoyer", e = en ? "edit" : "modifier";
      return [{ label: s + " ↵", value: s, hot: true }, { label: e, value: e }, cancel];
    }
    case null:
      return ["help", "contact", en ? "projects" : "projets", "stack", "curl sunuterrain", en ? "lang fr" : "lang en"].map((q) => ({ label: q, value: q, hot: q === "contact" }));
    default: return [cancel];
  }
}
