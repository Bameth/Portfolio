// @flow strict
import { personalData } from "@/utils/data/personal-data";
import Image from "next/image";
import Link from "next/link";
import { BiLogoLinkedin } from "react-icons/bi";
import { CiLocationOn } from "react-icons/ci";
import { FaFacebook, FaStackOverflow } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoGithub, IoMdCall } from "react-icons/io";
import { MdAlternateEmail } from "react-icons/md";
import ContactForm from "./contact-form";

const socialLinks = [
  { href: "github", Icon: IoLogoGithub, label: "GitHub" },
  { href: "linkedIn", Icon: BiLogoLinkedin, label: "LinkedIn" },
  { href: "twitter", Icon: FaXTwitter, label: "Twitter / X" },
  { href: "stackOverflow", Icon: FaStackOverflow, label: "Stack Overflow" },
  { href: "facebook", Icon: FaFacebook, label: "Facebook" },
];

function ContactSection() {
  return (
    <div
      id="contact"
      className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]"
    >
      <Image
        src="/section.svg"
        alt=""
        width={1572}
        height={795}
        className="absolute top-0 -z-10"
      />

      {/* Gradient top line */}
      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent w-full" />
        </div>
      </div>

      {/* Section title */}
      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex items-center">
          <span className="w-24 h-[2px] bg-[#1a1443]" />
          <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
            Contact
          </span>
          <span className="w-24 h-[2px] bg-[#1a1443]" />
        </div>
      </div>

      {/* Side label (desktop) */}
      <div className="hidden lg:flex flex-col items-center absolute top-36 -right-6 z-10">
        <span className="bg-[#1a1443] w-fit text-white rotate-90 p-2 px-5 text-xl rounded-md">
          CONTACT
        </span>
        <span className="h-36 w-[2px] bg-[#1a1443]" />
      </div>

      {/* Main grid */}
      <div className="py-8 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* ── LEFT: Form ── */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#16f2b3] font-bold mb-1">
                Envoyez-moi un message
              </p>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Parlons de votre projet
              </h2>
            </div>
            <ContactForm />
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="flex flex-col gap-8">
            {/* Intro card */}
            <div className="relative rounded-2xl border border-[#1b2c68]/60 bg-[#0d1224] p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#16f2b3]/3 to-transparent pointer-events-none" />
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#16f2b3]/30 to-transparent mb-5" />
              <p className="text-slate-400 text-sm leading-relaxed">
                Disponible pour tout projet ambitieux — qu'il s'agisse d'une
                application web, d'une API ou d'un produit complet. Réponse
                garantie sous 24h.
              </p>
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-3">
              {[
                {
                  Icon: MdAlternateEmail,
                  value: personalData.email,
                  label: "Email",
                },
                {
                  Icon: IoMdCall,
                  value: personalData.phone,
                  label: "WhatsApp",
                },
                {
                  Icon: CiLocationOn,
                  value: personalData.address,
                  label: "Localisation",
                },
              ].map(({ Icon, value, label }) => (
                <div
                  key={label}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-[#1b2c68]/50 bg-[#0d1224] hover:border-[#16f2b3]/30 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1b2c68]/50 group-hover:bg-[#16f2b3]/10 border border-[#1b2c68]/60 group-hover:border-[#16f2b3]/30 flex items-center justify-center transition-all duration-300">
                    <Icon
                      className="text-slate-400 group-hover:text-[#16f2b3] transition-colors duration-300"
                      size={18}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm text-slate-300 font-medium">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold mb-4">
                Retrouvez-moi sur
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ href, Icon, label }) => (
                  <Link
                    key={label}
                    href={personalData[href]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1b2c68]/50 bg-[#0d1224] hover:border-[#16f2b3]/30 hover:bg-[#16f2b3]/5 transition-all duration-300"
                    aria-label={label}
                  >
                    <Icon
                      className="text-slate-500 group-hover:text-[#16f2b3] transition-colors duration-300"
                      size={18}
                    />
                    <span className="text-xs text-slate-500 group-hover:text-slate-300 font-medium transition-colors duration-300">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSection;
