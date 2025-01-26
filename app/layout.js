import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/footer";
import ScrollToTop from "./components/helper/scroll-to-top";
import Navbar from "./components/navbar";
import "./css/card.scss";
import "./css/globals.scss";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Portfolio of Ameth BA - Développeur Full-Stack",
  description:
    "Je suis un étudiant en génie logiciel passionné par la programmation et l’ingénierie informatique, actuellement basé au Sénégal. Ma spécialité réside dans le développement web, les systèmes backend et la gestion des bases de données. Fort d'une solide expérience dans des technologies variées comme PHP, Java, C#, Python, SQL, Javascript et des frameworks backend comme Spring Boot, Symfony, ainsi que des frameworks frontend comme Tailwind CSS et Bootstrap, j'aime créer des solutions innovantes, sécurisées et performantes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/ameth.jpg" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <ToastContainer />
        <main className="min-h-screen relative mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
          <Navbar />
          {children}
          <ScrollToTop />
        </main>
        <Footer />
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
    </html>
  );
}
