
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RefreshCw } from "lucide-react";
import {
  EU,
  US,
  GB,
  CN,
  BR,
} from "country-flag-icons/react/3x2";

type Currency = "EUR" | "USD" | "GBP" | "CNY" | "BRL";

type ExchangeResponse = {
  base: string;
  rates: Record<string, number>;
  previousRates: Record<string, number>;
  date: string;
  previousDate: string;
  source: string;
};

const currencies = [
  { code: "EUR", name: "Euro", Flag: EU },
  { code: "USD", name: "US Dollar", Flag: US },
  { code: "GBP", name: "British Pound", Flag: GB },
  { code: "CNY", name: "Chinese Yuan", Flag: CN },
  { code: "BRL", name: "Brazilian Real", Flag: BR },
] as const;

const rotation: Currency[] = ["USD", "GBP", "CNY", "BRL"];

function CurrencySelect({
  value,
  onChange,
  exclude,
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
  exclude?: Currency;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () =>
      document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selected = currencies.find((item) => item.code === value)!;
  const SelectedFlag = selected.Flag;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs font-bold transition hover:bg-[var(--primary-soft)]"
      >
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-white/10">
          <SelectedFlag className="h-full w-full object-cover" />
        </span>

        <span>{value}</span>

        <ChevronDown
          size={13}
          className={`text-[var(--text-secondary)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select currency"
          className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#B48B4E]/40 bg-[#1C222B] p-1.5 shadow-2xl"
        >
          {currencies
            .filter((item) => item.code !== exclude)
            .map((item) => {
              const Flag = item.Flag;
              const selectedItem = item.code === value;

              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={selectedItem}
                  onClick={() => {
                    onChange(item.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition ${
                    selectedItem
                      ? "bg-[#B48B4E]/15 text-[#D9B77B]"
                      : "text-[#E8E8E8] hover:bg-white/10"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 overflow-hidden rounded-full">
                    <Flag className="h-full w-full object-cover" />
                  </span>

                  <span className="flex-1">
                    <span className="block font-semibold">
                      {item.code}
                    </span>
                    <span className="block text-[10px] text-[#9CA3AF]">
                      {item.name}
                    </span>
                  </span>

                  {selectedItem && (
                    <Check size={15} className="text-[#D9B77B]" />
                  )}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default function CurrencyTicker({
  companyCurrency,
}: {
  companyCurrency: string;
}) {
  const defaultCurrency: Currency = currencies.some(
    (item) => item.code === companyCurrency
  )
    ? (companyCurrency as Currency)
    : "EUR";

  const [data, setData] = useState<ExchangeResponse | null>(null);
  const [from, setFrom] = useState<Currency>(defaultCurrency);
  const [to, setTo] = useState<Currency>("USD");
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadRates = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/exchange-rates", {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Exchange API unavailable");

      const result: ExchangeResponse = await response.json();

      if (
        !result.rates ||
        !currencies.every(
          ({ code }) =>
            Number.isFinite(result.rates[code]) &&
            result.rates[code] > 0
        )
      ) {
        throw new Error("Invalid exchange rates");
      }

      setData(result);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) return loadRates();
    });
    return () => controller.abort();
  }, [loadRates]);

  useEffect(() => {
    if (!manual) {
      setFrom(defaultCurrency);
    }
  }, [defaultCurrency, manual]);

  useEffect(() => {
    if (paused || manual) return;

    const interval = window.setInterval(() => {
      setTo((current) => {
        const index = rotation.indexOf(current);
        return rotation[(index + 1) % rotation.length];
      });
    }, 4500);

    return () => window.clearInterval(interval);
  }, [paused, manual]);

  const sourceRate = data?.rates[from];
  const targetRate = data?.rates[to];

  const rate =
    sourceRate && targetRate ? targetRate / sourceRate : null;
const previousSourceRate = data?.previousRates?.[from];
const previousTargetRate = data?.previousRates?.[to];

const previousRate =
  previousSourceRate && previousTargetRate
    ? previousTargetRate / previousSourceRate
    : null;

const change =
  rate !== null && previousRate !== null && previousRate > 0
    ? ((rate / previousRate) - 1) * 100
    : null;

const formattedChange =
  change !== null && Number.isFinite(change)
    ? `${change >= 0 ? "+" : ""}${change.toFixed(2).replace(".", ",")}%`
    : "—";
  const formattedRate =
    rate !== null && Number.isFinite(rate)
      ? new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        }).format(rate)
      : "—";

  const dateLabel = data?.date
    ? data.date.split("-").reverse().join("/")
    : "—";

  return (
    <div
      className="relative flex h-12 w-full max-w-[520px] items-center justify-between gap-3 rounded-2xl border border-[#B48B4E] bg-[var(--surface)] px-4 shadow-[0_0_18px_rgba(180,139,78,0.08)] sm:w-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <CurrencySelect
          value={from}
          onChange={(currency) => {
            setFrom(currency);
            setManual(true);

            if (currency === to) setTo(from);
          }}
        />

        <span className="text-[var(--text-secondary)]">/</span>

        <CurrencySelect
          value={to}
          exclude={from}
          onChange={(currency) => {
            setTo(currency);
            setManual(true);
          }}
        />

        <span className="mx-1 h-5 w-px bg-[var(--border)]" />

        <span className="whitespace-nowrap text-sm font-bold">
          {formattedRate}
        </span>
        <span
  className={`whitespace-nowrap text-xs font-bold ${
    change === null
      ? "text-[var(--text-secondary)]"
      : change > 0
      ? "text-emerald-500"
      : change < 0
      ? "text-red-500"
      : "text-[var(--text-secondary)]"
  }`}
>
  {change === null ? "" : change > 0 ? "▲ " : change < 0 ? "▼ " : ""}
  {formattedChange}
</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-[10px] text-[var(--text-secondary)] lg:block">
         {error ? "Indisponível" : `Última cotação: ${dateLabel}`}
        </span>

        <button
          type="button"
          onClick={() => void loadRates()}
          disabled={loading}
          aria-label="Atualizar cotações"
          title="Atualizar cotações"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition hover:text-[var(--primary)] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>
    </div>
  );
}
