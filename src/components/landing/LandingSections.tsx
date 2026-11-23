"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { landingSectionsTranslations } from "@/lib/i18n/landing-sections";

export default function LandingSections() {
  const { language } = useLanguage();
  const t = landingSectionsTranslations[language] ?? landingSectionsTranslations.en!;
  return (
    <>
      <section
        id="solutions"
        className="scroll-mt-24 min-h-[calc(100dvh-88px)] flex flex-col justify-center border-t border-white/10 bg-[#101215] px-6 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A765]">
            {t.solutions.label}
          </p>

          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#F7F5F1] md:text-5xl">
            {t.solutions.title}
            <span className="block text-[#D1A765]">
              {t.solutions.highlight}
            </span>
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/55">
            {t.solutions.description}
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {t.solutions.cards.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-[#B48B4E]/20 bg-[#191B1E] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#D1A765]/60"
              >
                <h3 className="mt-7 text-xl font-semibold text-[#F7F5F1]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/50">
                  {item.description}
                </p>

                <div className="mt-8 h-px w-12 bg-[#B48B4E]/50 transition-all duration-300 group-hover:w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="scroll-mt-24 flex min-h-[calc(100dvh-88px)] flex-col justify-center border-t border-white/10 bg-[#15171A] px-6 py-16 lg:py-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A765]">
            {t.pricing.label}
          </p>

          <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#F7F5F1] md:text-5xl">
            {t.pricing.title}
            <span className="block text-[#D1A765]">
              {t.pricing.highlight}
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/55">
            {t.pricing.description}
          </p>

          <div className="mt-10 max-w-2xl rounded-2xl border border-[#B48B4E]/30 bg-[#1C1E21] p-7 md:p-9">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">
                {t.pricing.workspace}
              </h3>
              <span className="text-xs font-medium text-[#D1A765]">
                {t.pricing.availability}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/55">
              {t.pricing.workspaceDescription}
            </p>

            <div className="mt-7 space-y-4 border-t border-white/10 pt-7">
              {t.pricing.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="text-[#D1A765]">✓</span>
                  <span className="text-sm text-white/75">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-24 flex min-h-[calc(100dvh-88px)] flex-col justify-center border-t border-white/10 bg-[#101215] px-6 py-16 lg:py-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A765]">
            {t.about.label}
          </p>

          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#F7F5F1] md:text-5xl">
            {t.about.title}
            <span className="block text-[#D1A765]">
              {t.about.highlight}
            </span>
          </h2>

          <div className="mt-8 max-w-2xl space-y-5 text-base leading-8 text-white/55">
            {t.about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <p className="mt-8 text-sm font-medium tracking-wide text-[#D1A765]">
            {t.about.tagline}
          </p>

          <a
            href="/signup"
            className="mt-10 inline-flex items-center justify-center rounded-xl bg-[#D1A765] px-8 py-4 text-sm font-semibold text-[#171717] transition duration-300 hover:-translate-y-1 hover:bg-[#E4BD7C]"
          >
            {t.about.button}
            <span className="ml-3">→</span>
          </a>
        </div>
      </section>
    </>
  );
}
