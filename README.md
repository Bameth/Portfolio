# Portfolio · Ameth Ba

Portfolio de développeur full-stack (Dakar ⇄ Montréal), présenté comme un éditeur de code : onglets de fichiers, numéros de ligne, minimap, barre d'état, palette de commandes et terminal interactif.

Design : Claude Design, version « v21 tête réelle ».

## Stack

- **Next.js 15** (App Router) et **React 19**, en **TypeScript** strict
- **Tailwind CSS v4** pour les styles. Le CSS pur est réservé à ce que Tailwind n'exprime pas proprement (variables de thème, police variable au survol des titres).
- **three.js** : la tête 3D (`public/models/ameth.glb`) rendue en environ 14 000 glyphes de code via un shader
- **d3-geo** + **world-atlas** : le globe Dakar → Montréal de la section Parcours
- Polices Anybody et Martian Mono (axes `wdth` variables) via `next/font`

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production (sortie standalone)
npm run lint
npm run typecheck
```

Avec Docker :

```bash
docker compose up --build   # http://localhost:3000
```

Variables d'environnement facultatives : voir `.env.example`.

## Organisation

```
src/
├── app/                  Routes Next : layout, page, 404, image Open Graph, favicon
├── components/
│   ├── shell/            Coque « éditeur » : écran de boot, onglets, fil d'Ariane,
│   │                     gouttière, minimap, barre d'état, curseur, inspecteur
│   ├── sections/         Un dossier par section : hero, projects, stack, journey, contact
│   ├── overlays/         Palette de commandes (⌘K) et fenêtre de déploiement
│   └── ui/               Briques réutilisables (titre de section, section repliable)
├── features/             Moteurs autonomes, indépendants de React
│   ├── head3d/           Tête 3D en glyphes (three.js + shaders)
│   ├── globe/            Globe en points (d3-geo, canvas)
│   └── terminal/         Commandes du terminal (logique pure) + composant
├── content/              Toutes les données du site, en français et en anglais
├── config/features.ts    Réglages des animations (écran de boot, effets 3D…)
├── state/                Contextes React : préférences (langue, thème, son) et état de l'interface
├── hooks/                useFrame (boucle d'animation partagée), useClock
├── lib/                  Utilitaires : thème, pointeur, ticker, Cloudinary, effets
└── types/                Types du contenu
public/
├── images/ameth.jpg
├── models/ameth.glb
└── documents/cv-ameth-ba.pdf
```

### Principes

- **Le contenu est séparé de l'interface.** Pour modifier un projet, une technologie ou une étape du parcours, on édite uniquement `src/content/`. Chaque texte existe en `fr` et en `en`.
- **Une seule boucle d'animation.** Les composants animés s'abonnent à `lib/ticker.ts` via `useFrame` au lieu de lancer chacun leur `requestAnimationFrame`. Les valeurs qui changent à chaque image (curseur, numéros de ligne…) sont écrites directement dans le DOM, sans déclencher de rendu React.
- **Thème par variables CSS.** `globals.css` définit les couleurs pour le thème sombre et le thème clair. Tailwind les expose (`bg-p1`, `text-mint`…), donc changer de thème ne demande aucun rendu React.
- **Accessibilité du mouvement.** Avec `prefers-reduced-motion`, l'écran de boot, l'impression 3D et les animations sont désactivés.

## Captures d'écran

Les captures des projets sont hébergées sur Cloudinary (`src/lib/cloudinary.ts`). Pour en ajouter une, on ajoute son identifiant dans `shots` du projet concerné, dans `src/content/projects.ts`.
