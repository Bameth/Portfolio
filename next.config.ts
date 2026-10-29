import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Un package-lock.json existe aussi dans le dossier personnel : on fixe la racine du projet.
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Le modèle 3D et le CV ne changent qu'au déploiement.
        source: "/:dir(models|documents|images)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
