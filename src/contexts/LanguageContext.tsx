
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "es" | "pt-BR" | "pt-PT";

type LanguageContextType = {
  language: Language;
  changeLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("wjrfin-language");

    if (
      saved === "en" ||
      saved === "es" ||
      saved === "pt-BR" ||
      saved === "pt-PT"
    ) {
      queueMicrotask(() => setLanguage(saved));
    }
  }, []);

  function changeLanguage(newLanguage: Language) {
    setLanguage(newLanguage);
    localStorage.setItem("wjrfin-language", newLanguage);
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
