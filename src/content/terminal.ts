import type { Lang } from "@/types/content";

type ByLang<T> = Record<Lang, T>;

export const TERMINAL_INTRO: ByLang<string> = {
  fr: "contact.sh v3 : commence à taper, tab complète. ou clique une commande.",
  en: "contact.sh v3: start typing, tab completes. or click a command.",
};

export const HELP: ByLang<string[]> = {
  fr: [
    "commandes disponibles :",
    "  curl SITE   ouvrir gogainde ou sunuterrain",
    "  contact     écrire un message, pas à pas",
    "  whoami      qui je suis",
    "  projets     lister les projets",
    "  ouvrir N    afficher le projet N",
    "  stack       ce que j'utilise aujourd'hui",
    "  cv · github · linkedin · email",
    "  lang fr|en  changer de langue",
    "  theme       clair / sombre",
    "  clear       vider le terminal",
    "",
    "  tab ⇥  compléter · ↑↓ historique · esc annuler le formulaire",
  ],
  en: [
    "available commands:",
    "  curl SITE   open gogainde or sunuterrain",
    "  contact     write me a message, step by step",
    "  whoami      who I am",
    "  projects    list the projects",
    "  open N      show project N",
    "  stack       what I use today",
    "  cv · github · linkedin · email",
    "  lang fr|en  switch language",
    "  theme       light / dark",
    "  clear       clear the terminal",
    "",
    "  tab ⇥  complete · ↑↓ history · esc cancel the form",
  ],
};

/** Commandes complètes proposées en autocomplétion. */
export const COMPLETIONS: ByLang<string[]> = {
  fr: ["help", "contact", "projets", "ouvrir 1", "ouvrir 2", "ouvrir 3", "ouvrir 4", "ouvrir 5", "ouvrir 6", "stack", "whoami", "cv", "github", "linkedin", "email", "curl gogainde", "curl sunuterrain", "sudo embaucher-moi", "lang en", "theme", "clear"],
  en: ["help", "contact", "projects", "open 1", "open 2", "open 3", "open 4", "open 5", "open 6", "stack", "whoami", "cv", "github", "linkedin", "email", "curl gogainde", "curl sunuterrain", "sudo hire-me", "lang fr", "theme", "clear"],
};

/** Mots-clés reconnus, pour suggérer une correction en cas de faute de frappe. */
export const KEYWORDS = ["help", "contact", "projets", "ouvrir", "stack", "whoami", "cv", "github", "linkedin", "email", "curl", "clear", "sudo", "projects", "open", "lang", "theme"];

export const EMAIL_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.fr", "icloud.com", "proton.me"];

export const SUBJECTS: ByLang<string[]> = {
  fr: ["Stage / alternance", "Poste", "Mission freelance", "Question technique", "Autre chose"],
  en: ["Internship", "Job", "Freelance project", "Technical question", "Something else"],
};

/** Début de message pré-rempli pour chaque sujet (même ordre que `SUBJECTS`). */
export const MESSAGE_STARTS: ByLang<string[]> = {
  fr: ["Bonjour Ameth, nous cherchons un(e) stagiaire développeur pour ", "Bonjour Ameth, votre profil nous intéresse pour un poste de ", "Bonjour Ameth, j'ai un projet à confier : ", "Salut Ameth, petite question technique : ", ""],
  en: ["Hi Ameth, we're looking for a developer intern for ", "Hi Ameth, your profile caught our eye for a position as ", "Hi Ameth, I have a project for you: ", "Hey Ameth, quick technical question: ", ""],
};

/** Le code dont les caractères composent le portrait 3D. */
export const PORTRAIT_CODE = [
  'const ameth = { base: ["Dakar", "Montréal"], role: "full-stack" };',
  'git commit -m "première ligne, Dakar"',
  "while (curieux) { apprendre(); construire(); partager(); }",
  'await deploy("gogainde.sn"); await deploy("sunuterrain.com");',
  "SELECT passion FROM ameth WHERE ville IN ('Dakar', 'Montréal');",
  '@GetMapping("/lions") public Equipe lions() { return equipe; }',
  "docker compose up -d && git push origin main",
  "if (toi.cherches(dev)) { return ameth.collaborer(toi); }",
];
