export const projectsData = [
    {
        id: 1,
        name: 'SenTerrain - Plateforme de location de terrains',
        description: "Développement d'une application web pour la location de terrains à Dakar.Ce projet inclut la gestion des utilisateurs avec IdentityUser, l'intégration de rôles (admin, gestionnaire, client), et la réservation exclusive pour les clients. J'ai utilisé C# pour le backend et intégré la solution de paiement PayTech. Le frontend est conçu avec Tailwind CSS et JavaScript. En parallèle, j'ai mis en place des fixtures pour peupler la base de données, intégré Twilio pour la gestion des SMS, et implémenté l'envoi d'emails. Le projet est actuellement en cours de développement.",
        tools: ['C#', 'ASP.NET Core', 'Identity Framework', 'Tailwind CSS', 'JavaScript', 'PayTech API', 'Twilio API', 'Entity Framework Core', 'PostgreSQL'],
        role: 'Full Stack Developer',
        code: 'https://github.com/user/SenTerrain',
        demo: '',
        images: [
            '/imageges/home.gif',
            '/imageges/login.jpeg',
            '/imageges/listeTerrain.jpeg',
            '/imageges/reserver.jpeg',
            '/imageges/reserver.gif',
            '/imageges/thanks.jpeg',
            '/imageges/mesreservations.jpeg',
            '/imageges/listeges.jpeg',
            '/image/mesreservations.jpeg',
            '/image/reservationsgestionaire.jpeg',
            '/image/confirm.jpeg',
            '/image/dispo.jpeg',
            '/imageges/info.jpeg',
            '/imageges/twiio.jpg',
            '/imageges/confirmation.jpg',
            '/image/terrain.jpeg',
            '/image/newviewclient.jpeg',
            '/image/infoClient.jpeg',
            '/image/404.jpeg',
        ],
    },
    {
        id: 2,
        name: 'Application de gestion des commandes - NSA',
        description: "Cette application, développée avec ASP.NET MVC et Entity Framework, permet de gérer les commandes, les stocks et les paiements de manière fluide et sécurisée. Elle offre des fonctionnalités pour le suivi des commandes, des livraisons, ainsi que des statistiques et des rapports financiers. L'architecture modulaire et l'utilisation de design patterns comme MVC assurent une maintenance facile et une évolutivité. Les utilisateurs sont gérés avec Identity Framework, offrant une gestion fine des rôles (client, responsable de stock, comptable) et des droits d'accès.",
        tools: ['ASP.NET MVC', 'Entity Framework', 'LINQ', 'Identity Framework', 'Tailwind CSS', 'Postgres'],
        role: 'Full Stack Developer',
        code: '',
        demo: '',
        images: [
            '/image/home.jpeg',
            '/image/login.jpeg',
            '/image/produit.jpeg',
            '/image/ajouterpanier.jpeg',
            '/image/panier.jpeg',
            '/image/commandepasses.jpeg',
            '/image/detailscommandes.jpeg',
            '/image/planifier.jpeg',
            '/image/paiement.jpeg',
            '/image/commandesucces.jpeg',
            '/image/listecom.jpeg',
            '/image/listeproduit.jpeg',
            '/image/delete.jpeg',
            '/image/modifproduit.jpeg',
            '/image/creation.jpeg',
            '/image/solde.jpeg',
            '/image/listeclient.jpeg',
            '/image/detailclient.jpeg',
            '/image/client.jpeg',
            '/image/commandeGes.jpeg',
            '/image/detcom.jpeg',
            '/image/detcomm.jpeg',
            '/image/modpa.jpeg',
            '/image/planifier2.jpeg',
        ],
    },
    {
        id: 3,
        name: 'Gestion de dettes pour une boutique',
        description: "Ce projet est une application Symfony sur WSL(Windows Subsystem for Linux) dédiée à la gestion des dettes d’une boutique, comprenant deux versions : une version avec Twig pour le rendu des vues côté serveur, et une version monolithique distribuée intégrant JavaScript avec une communication via Ajax pour une gestion dynamique et rapide des dettes et la mis en place des fixtures pour remplir la BD. L’application permet de suivre les dettes des clients, gérer les paiements, et consulter l’historique des transactions. Elle offre des interfaces adaptées aux rôles du boutiquier, de l’administrateur et des clients, avec des fonctionnalités de gestion et de suivi en temps réel.",
        tools: ['Symfony', 'Postgres', 'UML Diagrams', 'Twig', 'Tailwind CSS', 'JavaScript', 'HTML', 'WSL'],
        role: 'Full Stack Developer',
        code: '',
        demo: '',
        images: [
            '/imageges/listeclient.jpeg',
            '/imageges/listeclientJS.jpeg',
            '/imageges/showdette.jpeg',
            '/imageges/listedette.jpeg',
            '/imageges/addette.jpeg',
            '/imageges/listeart.jpeg',
            '/imageges/addart.jpeg',
            '/imageges/addClient.jpeg',
        ],
    },
    {
        id: 4,
        name: 'Application de gestion d\'une boutique en ligne',
        description: "Cette application est une solution complète de gestion d'une boutique en ligne, développée avec Spring Boot pour le backend et Angular pour le frontend. Elle permet aux administrateurs de gérer les produits, les commandes, les clients et les paiements, tout en offrant aux utilisateurs une expérience fluide d'achat en ligne.",
        tools: ['Spring Boot', 'Spring MVC ', 'Angular', 'RxJS ', 'Postgres', 'Tailwind CSS',],
        role: 'Full Stack Developer',
        code: '',
        demo: '',
        images: [
            '/image/catalogue.jpeg',
            '/image/panierAngular.jpeg',
            '/image/detail.jpeg',
        ],
    },
    {
        id: 5,
        name: 'Gestion Atelier Couture',
        description: "Ce projet est une application web from-scratch développée en PHP pour gérer les activités d’un atelier de couture, notamment le stock (approvisionnements, articles, fournisseurs), la production (suivi des productions) et la vente (gestion des ventes et clients), avec des rôles spécifiques (Gestionnaire, Responsable de Stock, Responsable de Production, Vendeur) et une authentification sécurisée.",
        tools: ['PHP', 'MYSQL', 'JavaScript', 'Tailwind CSS', 'Composer', 'PhpMyAdmin'],
        role: 'Full Stack Developer',
        code: '',
        demo: '',
        images: [
            '/image/welcome.gif',
            '/image/listearticle.jpeg',
            '/image/listeprod.jpeg',
            '/image/listeventes.jpeg',
            '/image/modif.jpeg',
            '/image/ajouterart.jpeg',
            '/image/ajoutercategorie.jpeg',
            '/image/ajoutertype.jpeg',
            '/image/appro.gif',
            '/image/production.gif',
        ],
    },
    {
        id: 6,
        name: 'Gestion Dette pour une boutique Console-Desktop',
        description: "L'application console en Java pour la gestion du cahier de dettes d'une boutique permet de gérer efficacement clients, dettes, paiements et articles selon trois rôles (Boutiquier, Admin, Client). Elle offre plusieurs versions : gestion en mémoire (LIST), JDBC (MySQL/PostgreSQL), JPA (Hibernate) et JavaFX pour l'interface graphique. Configurable via persistence.xml et config.yaml, elle respecte les principes SOLID avec une structure modulaire. Les fonctionnalités incluent la création et gestion de clients, dettes, paiements, demandes de dettes, articles, et comptes utilisateurs. Facilement installable avec Maven, elle utilise Lombok, JDBC, et Hibernate pour des bases de données MySQL ou PostgreSQL. Conçue par Ameth BA, étudiant en génie logiciel, l'application est maintenable et évolutive.",
        tools: ['JAVA', 'MYSQL', 'PostgreSQL', 'JDBC', 'JPA', 'LIST', 'Hibernate', 'JavaFX', 'Maven', 'Lombok', 'PhpMyAdmin'],
        role: 'Full Stack Developer',
        code: '',
        demo: '',
        images: [
            '/imagesfx/connexion.png',
            '/imagesfx/listeart.png',
            '/imagesfx/connexioncons.png',
            '/imagesfx/consoleliste.png',
            '/imagesfx/createfx.png',
            '/imagesfx/listeuscons.png',
            '/imagesfx/menuad.png',
            '/imagesfx/listeclcons.png',
            '/imagesfx/listedette.png',
            '/imagesfx/dette.png',
            '/imagesfx/lsiteclfx.png',
            '/imagesfx/detteconfir.png',
        ],
    },
];



// Do not remove any property.
// Leave it blank instead as shown below

// {
//     id: 1,
//     name: '',
//     description: "",
//     tools: [],
//     role: '',
//     code: '',
//     demo: '',
// },