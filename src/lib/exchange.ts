export const supportedCurrencies = [
  "BRL",
  "USD",
  "EUR",
  "CNY",
] as const;

export type SupportedCurrency =
  (typeof supportedCurrencies)[number];

type ExchangeResponse = {
  base: string;
  rates: Record<string, number>;
  date: string;
};

export type ConversionResult = {
  originalAmount: number;
  originalCurrency: SupportedCurrency;
  convertedAmount: number;
  targetCurrency: SupportedCurrency;
  exchangeRate: number;
  exchangeRateDate: string | null;
};

export async function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency
): Promise<ConversionResult> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid amount.");
  }

  if (
    !supportedCurrencies.includes(from) ||
    !supportedCurrencies.includes(to)
  ) {
    throw new Error("Unsupported currency.");
  }

  if (from === to) {
    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount: amount,
      targetCurrency: to,
      exchangeRate: 1,
      exchangeRateDate: null,
    };
  }

  const response = await fetch("/api/exchange-rates", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Exchange rates unavailable.");
  }

  const data: ExchangeResponse = await response.json();

  if (data.base !== "EUR") {
    throw new Error("Unexpected exchange rate base.");
  }

  const sourceRate = Number(data.rates[from]);
  const targetRate = Number(data.rates[to]);

  if (
    !Number.isFinite(sourceRate) ||
    !Number.isFinite(targetRate) ||
    sourceRate <= 0 ||
    targetRate <= 0
  ) {
    throw new Error("Invalid exchange rate.");
  }

  const exchangeRate = targetRate / sourceRate;

  return {
    originalAmount: amount,
    originalCurrency: from,
    convertedAmount:
      Math.round((amount * exchangeRate + Number.EPSILON) * 100) / 100,
    targetCurrency: to,
    exchangeRate,
    exchangeRateDate: data.date,
  };
}
