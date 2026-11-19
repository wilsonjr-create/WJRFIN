
"use client";

import { Check, Palette } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProvider";

const themes: {
  id: Theme;
  name: string;
  description: string;
  background: string;
  primary: string;
  surface: string;
}[] = [
  {
    id: "champagne",
    name: "Champagne Gold",
    description: "Elegante e sofisticado",
    background: "#F8F6F2",
    primary: "#B48B4E",
    surface: "#FFFFFF",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Moderno e natural",
    background: "#F3F8F5",
    primary: "#287A60",
    surface: "#FFFFFF",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Escuro e refinado",
    background: "#15191F",
    primary: "#C8A76B",
    surface: "#20262E",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Profissional e equilibrado",
    background: "#F3F7FB",
    primary: "#4179AD",
    surface: "#FFFFFF",
  },
  {
    id: "rose",
    name: "Rose Sand",
    description: "Suave e minimalista",
    background: "#FBF6F4",
    primary: "#B98279",
    surface: "#FFFFFF",
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
          <Palette size={22} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Aparência
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Personalize as cores da sua plataforma.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((item) => {
          const selected = theme === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setTheme(item.id)}
              className={`overflow-hidden rounded-2xl border-2 text-left transition-all hover:-translate-y-1 ${
                selected
                  ? "border-[var(--primary)]"
                  : "border-[var(--border)]"
              }`}
            >
              <div
                className="flex h-32 gap-3 p-4"
                style={{ background: item.background }}
              >
                <div
                  className="w-10 rounded-lg"
                  style={{ background: item.primary }}
                />

                <div className="flex flex-1 flex-col gap-3">
                  <div
                    className="h-5 rounded-md"
                    style={{ background: item.surface }}
                  />

                  <div className="flex flex-1 gap-2">
                    <div
                      className="flex-1 rounded-lg"
                      style={{ background: item.surface }}
                    />
                    <div
                      className="flex-1 rounded-lg"
                      style={{
                        background: item.primary,
                        opacity: 0.65,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 bg-[var(--surface)] p-4">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>

                {selected && (
                  <div className="rounded-full bg-[var(--primary)] p-1 text-white">
                    <Check size={16} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-[var(--text-secondary)]">
        Sua preferência é salva automaticamente neste navegador.
      </p>
    </section>
  );
}
