import type { Metadata, Viewport } from "next";
import { Anybody, Martian_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { STORAGE_KEYS } from "@/lib/storage";
import { THEME_COLOR } from "@/lib/theme";
import "./globals.css";

const anybody = Anybody({ subsets: ["latin"], axes: ["wdth"], variable: "--font-anybody", display: "swap" });
const martianMono = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-martian", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description =
  "Ameth Ba, développeur full-stack entre Dakar et Montréal. GoGainde et SunuTerrain sont en production. Angular, Spring Boot, ASP.NET Core, Next.js, Flutter.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ameth Ba · Développeur Full-Stack · Dakar ⇄ Montréal",
  description,
  authors: [{ name: "Ameth Ba", url: "https://github.com/Bameth" }],
  openGraph: {
    type: "website",
    title: "Ameth Ba · Développeur Full-Stack",
    description: "Du code qui part en production. Dakar ⇄ Montréal.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: THEME_COLOR.dark, width: "device-width", initialScale: 1 };

/** Applique le thème enregistré avant le premier rendu, pour éviter un flash clair/sombre. */
const themeScript = `try{if(localStorage.getItem("${STORAGE_KEYS.theme}")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gtm = process.env.NEXT_PUBLIC_GTM;
  return (
    <html lang="fr" className={`${anybody.variable} ${martianMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
      {gtm ? <GoogleTagManager gtmId={gtm} /> : null}
    </html>
  );
}
