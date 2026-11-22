"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  Menu,
  X,
} from "lucide-react";

type Language = "en" | "es" | "pt-BR" | "pt-PT";

const languages: {
  code: Language;
  flag: string;
  label: string;
}[] = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "pt-BR", flag: "🇧🇷", label: "Português BR" },
  { code: "pt-PT", flag: "🇵🇹", label: "Português PT" },
];

const translations = {
  en: {
    home: "Home",
    features: "Features",
    solutions: "Solutions",
    pricing: "Pricing",
    about: "About",
    signIn: "Sign In",
    start: "Start Managing",
    eyebrow: "BUSINESS FINANCE, SIMPLIFIED",
    headline: ["Your business.", "Your numbers.", "Your control."],
    description:
      "Manage income, expenses, cash flow and business performance in one intelligent workspace.",
    benefits: ["Fast Setup", "Secure & Reliable", "Built for Businesses"],
  
  

mobile: {
  eyebrow: "WORK ANYWHERE",
  title: "Full control of your business,",
  highlight: "anytime, anywhere.",
  description: "A secure and flexible platform to manage your company's finances from the office, at home or on the go.",
  features: [
    { title: "Financial Control", description: "Track income, expenses and balance." },
    { title: "Business Insights", description: "Clear reports for smarter decisions." },
    { title: "Built for Growth", description: "A workspace that grows with you." },
  ],
},
},

  es: {
    home: "Inicio",
    features: "Funciones",
    solutions: "Soluciones",
    pricing: "Precios",
    about: "Nosotros",
    signIn: "Iniciar sesión",
    start: "Empezar a gestionar",
    eyebrow: "FINANZAS EMPRESARIALES, SIMPLIFICADAS",
    headline: ["Tu empresa.", "Tus números.", "Tu control."],
    description:
      "Gestiona ingresos, gastos, flujo de caja y resultados empresariales en una plataforma inteligente.",
    benefits: ["Configuración rápida", "Seguro y fiable", "Para empresas"],
    mobile: {
  eyebrow: "TRABAJA DESDE CUALQUIER LUGAR",
  title: "Control total de tu empresa,",
  highlight: "en cualquier momento y lugar.",
  description: "Una plataforma segura y flexible para gestionar las finanzas de tu empresa desde la oficina, en casa o desde cualquier lugar.",
  features: [
    { title: "Control Financiero", description: "Controla ingresos, gastos y saldos." },
    { title: "Análisis Empresarial", description: "Informes claros para tomar mejores decisiones." },
    { title: "Diseñado para Crecer", description: "Una plataforma que crece contigo." },
  ],
},
  },
  "pt-BR": {
    home: "Início",
    features: "Funcionalidades",
    solutions: "Soluções",
    pricing: "Planos",
    about: "Sobre",
    signIn: "Entrar",
    start: "Começar a gerenciar",
    eyebrow: "GESTÃO FINANCEIRA EMPRESARIAL SIMPLIFICADA",
    headline: ["Seu negócio.", "Seus números.", "Seu controle."],
    description:
      "Gerencie receitas, despesas, fluxo de caixa e resultados da sua empresa em uma plataforma inteligente.",
    benefits: ["Configuração rápida", "Seguro e confiável", "Feito para empresas"],
    mobile: {
  eyebrow: "TRABALHE DE QUALQUER LUGAR",
  title: "Controle total do seu negócio,",
  highlight: "a qualquer hora, em qualquer lugar.",
  description: "Uma plataforma segura e flexível para gerenciar as finanças da sua empresa no escritório, em casa ou onde estiver.",
  features: [
    { title: "Controle Financeiro", description: "Acompanhe receitas, despesas e saldo." },
    { title: "Análises Empresariais", description: "Relatórios claros para decisões inteligentes." },
    { title: "Feito para Crescer", description: "Uma plataforma que cresce com seu negócio." },
  ],
},
  },
  "pt-PT": {
    home: "Início",
    features: "Funcionalidades",
    solutions: "Soluções",
    pricing: "Preços",
    about: "Sobre",
    signIn: "Iniciar sessão",
    start: "Começar a gerir",
    eyebrow: "GESTÃO FINANCEIRA EMPRESARIAL SIMPLIFICADA",
    headline: ["A sua empresa.", "Os seus números.", "O seu controlo."],
    description:
      "Faça a gestão de receitas, despesas, fluxo de caixa e resultados da sua empresa numa plataforma inteligente.",
    benefits: ["Configuração rápida", "Seguro e fiável", "Para empresas"],
    mobile: {
  eyebrow: "TRABALHE A PARTIR DE QUALQUER LUGAR",
  title: "Controlo total da sua empresa,",
  highlight: "a qualquer hora, em qualquer lugar.",
  description: "Uma plataforma segura e flexível para gerir as finanças da sua empresa no escritório, em casa ou onde estiver.",
  features: [
    { title: "Controlo Financeiro", description: "Acompanhe receitas, despesas e saldo." },
    { title: "Análises Empresariais", description: "Relatórios claros para melhores decisões." },
    { title: "Preparado para Crescer", description: "Uma plataforma que cresce com a sua empresa." },
  ],
},
  },
};

export default function HomePage() {
  const { language, changeLanguage } = useLanguage();
  
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[language];
  const currentLanguage = languages.find(
    (item) => item.code === language
  )!;

  const navigation = [
    { label: t.home, href: "#home" },
    { label: t.features, href: "#features" },
    { label: t.solutions, href: "#solutions" },
    { label: t.pricing, href: "#pricing" },
    { label: t.about, href: "#about" },
  ];

  return (
    <main className="min-h-screen bg-[#101215] text-[#F7F5F1]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#15171A]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5">
          <a href="#home" className="shrink-0">
            <div className="text-2xl font-extrabold tracking-tight">
              WJR<span className="text-[#D1A765]">FIN</span>
            </div>
            <div className="text-[9px] tracking-[0.22em] text-[#D1A765]">
              BUSINESS FINANCE
            </div>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-white/75 transition hover:text-[#D1A765]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen(!languageOpen)}
                aria-expanded={languageOpen}
                aria-label="Select language"
                className="flex items-center gap-2 rounded-xl border border-[#B48B4E]/40 px-3 py-2 text-sm transition hover:border-[#D1A765]"
              >
                <span className="text-sm">{currentLanguage.flag}</span>
                <span>{language.toUpperCase()}</span>
                <ChevronDown size={14} />
              </button>

              {languageOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-[#B48B4E]/30 bg-[#1C1E22] p-1 shadow-2xl">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                     onClick={() => {
  changeLanguage(item.code);
  setLanguageOpen(false);
}}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition hover:bg-[#B48B4E]/15"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-sm">{item.flag}</span>
                        {item.label}
                      </span>
                      {language === item.code && (
                        <Check size={15} className="text-[#D1A765]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/login"
              className="hidden rounded-xl border border-white/25 px-5 py-2.5 text-sm transition hover:border-[#D1A765] sm:inline-flex"
            >
              {t.signIn}
            </Link>

            <Link
              href="/signup"
              className="hidden items-center gap-2 rounded-xl bg-[#D1A765] px-5 py-2.5 text-sm font-semibold text-[#151515] transition hover:bg-[#E4BD7C] md:inline-flex"
            >
              {t.start}
              <ArrowRight size={17} />
            </Link>

            <button
              type="button"
              className="rounded-lg border border-white/15 p-2 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-6 py-4 lg:hidden">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}

            <Link
              href="/login"
              className="rounded-lg px-3 py-3 text-sm hover:bg-white/5"
            >
              {t.signIn}
            </Link>

            <Link
              href="/signup"
              className="mt-2 rounded-lg bg-[#D1A765] px-4 py-3 text-center text-sm font-semibold text-black"
            >
              {t.start}
            </Link>
          </nav>
        )}
      </header>

      
       <section
  id="home"
  className="relative flex min-h-[560px] items-center overflow-hidden bg-[#101215] lg:min-h-[620px]"
  style={{
    backgroundImage:
      "linear-gradient(90deg, rgba(10,11,13,0.98) 0%, rgba(10,11,13,0.90) 27%, rgba(10,11,13,0.35) 55%, rgba(10,11,13,0.05) 100%), url('/images/landing/executive-office-final.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(180,139,78,0.16),transparent_55%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
          <div>
            <p className="mb-6 text-xs font-semibold tracking-[0.18em] text-[#D1A765]">
              {t.eyebrow}
            </p>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">
              {t.headline[0]}
              <br />
              {t.headline[1]}
              <br />
              <span className="text-[#D1A765]">
                {t.headline[2]}
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-white/65">
              {t.description}
            </p>

            <Link
              href="/signup"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#D1A765] px-8 py-4 font-semibold text-[#171717] shadow-lg shadow-[#B48B4E]/10 transition duration-300 hover:-translate-y-1 hover:bg-[#E4BD7C]"
            >
              {t.start}
              <ArrowRight size={20} />
            </Link>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {t.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="flex items-center gap-2 text-xs text-white/70"
                >
                  <Check size={15} className="text-[#D1A765]" />
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* {t.mobile.eyebrow} — BEACH SECTION */}
      <section
        id="features"
        className="relative overflow-hidden bg-[#141618]"
      >
        <div className="grid min-h-[480px] lg:grid-cols-2">
          <div
            className="min-h-[360px] bg-cover bg-center lg:min-h-[480px]"
            style={{
              backgroundImage:
                "url('/images/landing/beach-mobile-final.png')",
            }}
          />

          <div className="flex flex-col justify-center px-8 py-14 lg:px-14">
            <p className="mb-4 text-sm font-semibold tracking-widest text-[#D1A765]">
              {t.mobile.eyebrow}
            </p>

            <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
              {t.mobile.title}
              <span className="text-[#D1A765]">
                {" "}{t.mobile.highlight}
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
              A secure and flexible platform to manage your
              company's finances from the office, at home
              or on the go.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {t.mobile.features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#B48B4E]/20 bg-[#1B1D20] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#D1A765]/60"
                >
                  <div className="mb-4 h-1 w-9 rounded-full bg-[#D1A765]" />
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-xs leading-5 text-white/55">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
            {/* FOOTER */}
      <footer className="border-t border-[#B48B4E]/25 bg-[#101215] px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <p className="text-center text-xs tracking-widest text-white/45">
            © 2026{" "}
            <span className="font-semibold text-[#D1A765]">
              WJRFIN
            </span>
            . All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
