"use client";
import { useState } from "react";
import { TbMailForward } from "react-icons/tb";
import { toast } from "react-toastify";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ContactForm() {
  const [error, setError] = useState({ email: false, required: false });
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    message: "",
  });

  const checkRequired = () => {
    if (userInput.email && userInput.message && userInput.name) {
      setError((e) => ({ ...e, required: false }));
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!userInput.email || !userInput.message || !userInput.name) {
      setError((e) => ({ ...e, required: true }));
      return;
    }
    if (error.email) return;
    setError((e) => ({ ...e, required: false }));

    try {
      setIsLoading(true);
      const res = await fetch("https://formspree.io/f/xzzbjaew", {
        method: "POST",
        body: JSON.stringify(userInput),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success("Message envoyé avec succès !");
        setUserInput({ name: "", email: "", message: "" });
      } else {
        toast.error("Erreur lors de l'envoi.");
      }
    } catch {
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "w-full bg-[#080b1e] border border-[#1b2c68]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:border-[#16f2b3]/50 focus:ring-1 focus:ring-[#16f2b3]/20";

  const labelBase =
    "block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2";

  return (
    <div className="relative rounded-2xl border border-[#1b2c68]/60 bg-[#0d1224] overflow-hidden">
      {/* Gradient lines */}
      <div className="flex flex-row">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600" />
        <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent" />
      </div>

      {/* Terminal header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1b2c68]/40">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-auto text-[10px] text-slate-600 font-mono font-bold tracking-widest uppercase">
          contact.form
        </span>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className={labelBase}>Votre nom</label>
          <input
            className={inputBase}
            type="text"
            placeholder="Prénom Nom"
            maxLength={100}
            value={userInput.name}
            onChange={(e) =>
              setUserInput({ ...userInput, name: e.target.value })
            }
            onBlur={checkRequired}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelBase}>Votre email</label>
          <input
            className={`${inputBase} ${error.email ? "border-red-500/50 focus:border-red-500/70" : ""}`}
            type="email"
            placeholder="vous@exemple.com"
            maxLength={100}
            value={userInput.email}
            onChange={(e) =>
              setUserInput({ ...userInput, email: e.target.value })
            }
            onBlur={() => {
              checkRequired();
              setError((err) => ({
                ...err,
                email: !isValidEmail(userInput.email),
              }));
            }}
          />
          {error.email && (
            <p className="text-xs text-red-400 mt-1.5 font-medium">
              Adresse email invalide.
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className={labelBase}>Votre message</label>
          <textarea
            className={`${inputBase} resize-none`}
            placeholder="Décrivez votre projet, votre idée, ou posez votre question…"
            maxLength={500}
            rows={5}
            value={userInput.message}
            onChange={(e) =>
              setUserInput({ ...userInput, message: e.target.value })
            }
            onBlur={checkRequired}
          />
          <p className="text-right text-[10px] text-slate-700 mt-1 font-mono">
            {userInput.message.length}/500
          </p>
        </div>

        {/* Error + Submit */}
        <div className="flex flex-col items-stretch gap-3">
          {error.required && (
            <p className="text-xs text-red-400 font-medium text-center py-2 px-4 bg-red-500/10 rounded-lg border border-red-500/20">
              Tous les champs sont requis.
            </p>
          )}

          <button
            onClick={handleSendMail}
            disabled={isLoading}
            className="group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-bold text-sm rounded-xl transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.99]"
          >
            {/* Shimmer */}
            <span className="absolute inset-0 bg-white/10 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-500 skew-x-12" />
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  Envoyer le message
                  <TbMailForward size={18} />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
