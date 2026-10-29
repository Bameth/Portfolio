import type { Project } from "@/types/content";

const FULL_STACK = { fr: "Full Stack Developer", en: "Full Stack Developer" };

export const PROJECTS: Project[] = [
  {
    slug: "gogainde",
    file: "gogainde.ts",
    tone: "mint",
    title: "GoGainde",
    category: { fr: "Plateforme sportive", en: "Sports platform" },
    role: { fr: "Développeur Frontend et Backend", en: "Frontend & Backend Developer" },
    status: "deployed",
    demo: "https://gogainde.sn/",
    summary: {
      fr: "Matchs des Lions, profils et statistiques des joueurs, historique des transferts, quiz et pronostics. La plateforme des supporters de l'équipe nationale.",
      en: "Senegal national team matches, player profiles and stats, transfer history, quizzes and predictions. The Lions' fan platform.",
    },
    description: {
      fr: "Plateforme web dédiée au football sénégalais : suivre les matchs de l'équipe nationale, explorer les compétitions et consulter les profils détaillés des joueurs (statistiques, performances, historique des transferts). Des quiz interactifs et un système de pronostics permettent aux supporters de tester leurs connaissances et de prédire les résultats.",
      en: "Web platform dedicated to Senegalese football: follow the national team's matches, explore competitions and browse detailed player profiles (stats, performance, transfer history). Interactive quizzes and a prediction system let fans test their knowledge and forecast results.",
    },
    tools: ["Angular", "Spring Boot", "Redis", "PostgreSQL", "Tailwind", "Docker"],
    shots: ["fa7f4be0-c035-4577-8b0a-44c7867e3d51.png"],
  },
  {
    slug: "sunuterrain",
    file: "sunuterrain.cs",
    tone: "pink",
    title: "SunuTerrain",
    category: { fr: "Réservation & paiement", en: "Booking & payments" },
    role: FULL_STACK,
    status: "deployed",
    demo: "https://sunuterrain.com/",
    summary: {
      fr: "Trouver un terrain à Dakar, le réserver, payer via Wave ou Orange Money, recevoir la confirmation par SMS. Trois rôles, un VPS, aucun intermédiaire.",
      en: "Find a pitch in Dakar, book it, pay with Wave or Orange Money, get an SMS confirmation. Three roles, one VPS, no middleman.",
    },
    description: {
      fr: "Recherche et réservation de terrains sportifs à Dakar. Utilisateurs gérés avec ASP.NET Identity et trois rôles (administrateur, gestionnaire, client). Backend C# avec ASP.NET Core et Entity Framework Core ; interface Razor, Tailwind et JavaScript. Paiement via Wave API, notifications SMS (Twilio, Orange SMS API) et email, images sur Cloudinary. Déployée sur un VPS Contabo.",
      en: "Search and booking of sports pitches in Dakar. Users managed with ASP.NET Identity and three roles (admin, manager, customer). C# backend with ASP.NET Core and Entity Framework Core; Razor, Tailwind and JavaScript front end. Payments through the Wave API, SMS (Twilio, Orange SMS API) and email notifications, images on Cloudinary. Deployed on a Contabo VPS.",
    },
    tools: ["ASP.NET Core", "C#", "Next.js", "Flutter", "PostgreSQL", "Redis", "Docker", "Nginx", "Wave API", "Orange Money", "Twilio", "Cloudinary", "Cloudflare", "JWT"],
    shots: [
      "4bb6150d-f1a1-4dc2-ab5c-e4cf2a72c914.png",
      "801cdbe4-ff57-40ce-9ad3-f57ffebd43e5.png",
      "3ade2d9a-221e-49c2-8514-d533a977fb3a.png",
      "61a8c368-dadc-4159-8c85-febd456f8af6.png",
      "81b88bd9-92ce-4319-9aa3-1085909886aa.png",
      "4738c7ad-6eb5-4bc9-9a6e-c2cf656fbac6.png",
      "bd7a0758-04f3-4afb-b463-6f33685fcfd6.png",
      "737e2b57-96f8-43e5-9e3f-b22da446b9c6.png",
      "0117ef00-0555-479b-86b7-652f8d9d968a.png",
      "4b5b06db-7ca5-4c4c-8e4a-244e51ac7e56.png",
    ],
  },
  {
    slug: "nsa",
    file: "nsa.cs",
    tone: "violet",
    title: "NSA",
    category: { fr: "Gestion des commandes", en: "Order management" },
    role: FULL_STACK,
    status: "completed",
    summary: {
      fr: "Commandes, stocks, livraisons et paiements dans une seule application, avec des rapports financiers et trois rôles aux droits distincts.",
      en: "Orders, stock, deliveries and payments in one app, with financial reports and three roles with distinct permissions.",
    },
    description: {
      fr: "Application ASP.NET MVC et Entity Framework pour gérer commandes, stocks et paiements. Suivi des commandes et des livraisons, statistiques et rapports financiers. Architecture modulaire fondée sur le pattern MVC. Utilisateurs gérés avec Identity Framework : client, responsable de stock et comptable, avec des droits d'accès fins.",
      en: "ASP.NET MVC and Entity Framework application to manage orders, stock and payments. Order and delivery tracking, statistics and financial reports. Modular architecture built on the MVC pattern. Users managed with Identity Framework (customer, stock manager and accountant) with fine-grained access rights.",
    },
    tools: ["ASP.NET MVC", "Entity Framework", "LINQ", "Identity", "Tailwind", "PostgreSQL"],
    shots: [
      "produit_il74la.jpg", "detailsproduit_jqcvoo.jpg", "ajouterpanier_xhikg9.jpg", "panier_ld7a3n.jpg",
      "detcom_vfsdqg.jpg", "planifier2_jwve4u.jpg", "detcomm_oubyws.jpg", "modpa_z7oy4e.jpg",
      "detailscommandes_djleh6.jpg", "client_a9dd2n.jpg", "livraisonsucces_xweeqh.jpg", "listeproduit_bd9our.jpg",
      "delete_biwax9.jpg", "creation_yf3980.jpg", "commandeGes_vt2qi0.jpg", "login_dm2slf.jpg",
    ],
  },
  {
    slug: "dettes",
    file: "dettes.php",
    tone: "amber",
    title: "Cahier de dettes",
    category: { fr: "Boutique · web", en: "Shop · web" },
    role: FULL_STACK,
    status: "completed",
    summary: {
      fr: "Le cahier de dettes d'une boutique de quartier, passé au numérique : clients, paiements, historique. En Twig, puis en JavaScript/Ajax.",
      en: "A neighbourhood shop's credit ledger, gone digital: customers, payments, history. In Twig, then JavaScript/Ajax.",
    },
    description: {
      fr: "Application Symfony sous WSL, en deux versions : rendu serveur avec Twig, et monolithe distribué en JavaScript avec Ajax, plus des fixtures pour alimenter la base. Suivi des dettes clients, paiements et historique des transactions, avec des interfaces dédiées au boutiquier, à l'administrateur et aux clients.",
      en: "Symfony app under WSL, in two versions: server-side rendering with Twig, and a distributed monolith in JavaScript with Ajax, plus fixtures to seed the database. Tracks customer debts, payments and transaction history, with dedicated interfaces for the shopkeeper, the admin and customers.",
    },
    tools: ["Symfony", "Twig", "PostgreSQL", "JavaScript", "Tailwind", "UML", "WSL"],
    shots: [
      "showdette_iol6ge.jpg", "listedette_fmf1xf.jpg", "listeclientJS_jnqkgv.jpg", "listeclient_uu7pim.jpg",
      "listeart_juazvu.jpg", "addette_jozemu.jpg", "addClient_hxhjuf.jpg", "addart_jyxpae.jpg",
    ],
  },
  {
    slug: "atelier",
    file: "atelier.php",
    tone: "orange",
    title: "Atelier Couture",
    category: { fr: "Stock & production", en: "Stock & production" },
    role: FULL_STACK,
    status: "completed",
    summary: {
      fr: "Un atelier de couture piloté de l'approvisionnement à la vente. PHP natif, sans framework, quatre rôles.",
      en: "A tailoring workshop run from procurement to sale. Plain PHP, no framework, four roles.",
    },
    description: {
      fr: "Application web écrite from scratch en PHP : stock (approvisionnements, articles, fournisseurs), production et vente (ventes, clients). Quatre rôles (gestionnaire, responsable de stock, responsable de production, vendeur) et une authentification sécurisée.",
      en: "Web app written from scratch in PHP: stock (procurement, items, suppliers), production and sales (sales, customers). Four roles (manager, stock manager, production manager, seller) and secure authentication.",
    },
    tools: ["PHP", "MySQL", "JavaScript", "Tailwind", "Composer"],
    shots: [
      "listearticle_nb7yfb.jpg", "ajouterart_thsnin.jpg", "deleteart_tuvjpg.jpg", "modif_lel3te.jpg",
      "listeprod_pk4xrj.jpg", "listeventes_da1zra.jpg", "production_eak4zx.gif", "detailsventes_dh3xs1.jpg",
      "detailsappro_yzhcaw.jpg", "appro_azcodr.gif", "ajoutertype_jzrsy5.jpg", "ajoutercategorie_oiknoo.jpg",
    ],
  },
  {
    slug: "dettes-desktop",
    file: "Dettes.java",
    tone: "blue",
    title: "Dettes Desktop",
    category: { fr: "Console & JavaFX", en: "Console & JavaFX" },
    role: FULL_STACK,
    status: "completed",
    summary: {
      fr: "Le même problème, quatre persistances : en mémoire, JDBC, JPA/Hibernate, puis une interface JavaFX. Un exercice de SOLID grandeur nature.",
      en: "Same problem, four persistence layers: in-memory, JDBC, JPA/Hibernate, then a JavaFX UI. SOLID at full scale.",
    },
    description: {
      fr: "Application Java de gestion du cahier de dettes, trois rôles (boutiquier, admin, client). Couches de persistance interchangeables : en mémoire, JDBC (MySQL/PostgreSQL), JPA avec Hibernate, et une interface JavaFX. Configurable via persistence.xml et config.yaml, structurée selon SOLID, installable avec Maven.",
      en: "Java app managing the credit ledger, three roles (shopkeeper, admin, customer). Swappable persistence layers: in-memory, JDBC (MySQL/PostgreSQL), JPA with Hibernate, and a JavaFX interface. Configurable via persistence.xml and config.yaml, structured with SOLID, installable with Maven.",
    },
    tools: ["Java", "JavaFX", "Hibernate", "JPA", "JDBC", "Maven", "Lombok", "MySQL"],
    shots: [
      "connexion_pozsvy.png", "listeart_sm8iox.png", "listedette_tdhjtt.png", "detteconfir_bi85jk.png",
      "dette_kubkbz.png", "createfx_zi9dmw.png", "consoleliste_qkr8kl.png", "connexioncons_swhrs8.png",
      "listeclcons_tiyuyj.png", "listeclconso_z0tuqg.png",
    ],
  },
];

export const domainOf = (project: Project) => (project.demo ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Nom de fichier lisible d'une capture : retire le suffixe Cloudinary ou l'UUID. */
export const shotName = (id: string) => id.replace(/_[a-z0-9]{6}\./i, ".").replace(/^[0-9a-f-]{36}\./, "ecran.");
