import type { StackLayer, StackRoute, Tech } from "@/types/content";

/** Langages utilisés au quotidien. */
export const LANGUAGES = ["Java", "C#", "TypeScript", "Dart", "SQL"];

export const TECH: Record<string, Tech> = {
  Angular: { icon: "angular", color: "DD0031", projects: ["gogainde.ts"] },
  "Next.js": { icon: "nextdotjs", color: "FFFFFF", projects: ["sunuterrain.cs"] },
  Flutter: { icon: "flutter", color: "44D1FD", projects: ["sunuterrain.cs"] },
  Cloudflare: { icon: "cloudflare", color: "F38020", projects: ["sunuterrain.cs"] },
  Nginx: { icon: "nginx", color: "22C55E", projects: ["sunuterrain.cs"] },
  "Spring Boot": { icon: "springboot", color: "6DB33F", projects: ["gogainde.ts"] },
  "ASP.NET Core": { icon: "dotnet", color: "A78BFA", projects: ["sunuterrain.cs", "nsa.cs"] },
  PostgreSQL: { icon: "postgresql", color: "6C8EF0", projects: ["gogainde.ts", "sunuterrain.cs", "nsa.cs", "dettes.php"] },
  Redis: { icon: "redis", color: "FF4438", projects: ["gogainde.ts", "sunuterrain.cs"] },
  Wave: { icon: "", color: "1DC4FF", projects: ["sunuterrain.cs"], mono: "W" },
  "Orange Money": { icon: "orange", color: "FF7900", projects: ["sunuterrain.cs"], mono: "OM" },
  Twilio: { icon: "", color: "F22F46", projects: ["sunuterrain.cs"], mono: "Tw" },
  Cloudinary: { icon: "cloudinary", color: "5B7CFA", projects: ["sunuterrain.cs"] },
};

const same = (s: string) => ({ fr: s, en: s });

/** Couches de la stack, du client vers les services tiers. */
export const LAYERS: StackLayer[] = [
  { label: same("Client"), tone: "mint", items: [
    { name: "Angular", note: same("SPA · GoGainde") },
    { name: "Next.js", note: same("web · SunuTerrain") },
    { name: "Flutter", note: same("mobile · SunuTerrain") },
  ] },
  { label: same("Edge"), tone: "amber", items: [
    { name: "Cloudflare", note: same("DNS · cache · WAF") },
    { name: "Nginx", note: same("reverse proxy · TLS") },
  ] },
  { label: same("API"), tone: "pink", items: [
    { name: "Spring Boot", note: same("REST · JWT") },
    { name: "ASP.NET Core", note: same("Identity · EF Core") },
  ] },
  { label: { fr: "Données", en: "Data" }, tone: "violet", items: [
    { name: "PostgreSQL", note: { fr: "base principale", en: "main database" } },
    { name: "Redis", note: same("cache · sessions") },
  ] },
  { label: same("Services"), tone: "orange", items: [
    { name: "Wave", note: { fr: "paiement", en: "payments" } },
    { name: "Orange Money", note: { fr: "paiement", en: "payments" } },
    { name: "Twilio", note: same("SMS") },
    { name: "Cloudinary", note: { fr: "médias", en: "media" } },
  ] },
];

/** Requêtes rejouées en boucle sur le schéma de la stack. */
export const ROUTES: StackRoute[] = [
  {
    request: "POST /api/reservations",
    project: "sunuterrain.cs",
    path: [0, 1, 2, 3, 2, 4, 2, 1, 0],
    hits: ["Next.js", "Cloudflare", "ASP.NET Core", "PostgreSQL", "ASP.NET Core", "Wave", "ASP.NET Core", "Cloudflare", "Next.js"],
    response: same("201 Created"),
    latency: "84 ms",
  },
  {
    request: "GET /api/joueurs/10/stats",
    project: "gogainde.ts",
    path: [0, 1, 2, 3, 2, 1, 0],
    hits: ["Angular", "Nginx", "Spring Boot", "Redis", "Spring Boot", "Nginx", "Angular"],
    response: same("200 OK · cache Redis"),
    latency: "12 ms",
  },
  {
    request: "POST /webhooks/wave",
    project: "sunuterrain.cs",
    path: [4, 2, 3, 2, 4],
    hits: ["Wave", "ASP.NET Core", "PostgreSQL", "ASP.NET Core", "Twilio"],
    response: { fr: "200 OK → SMS Twilio envoyé", en: "200 OK → Twilio SMS sent" },
    latency: "41 ms",
  },
];
