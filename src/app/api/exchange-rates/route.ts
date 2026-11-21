
import { NextResponse } from "next/server";

const currencies = ["EUR", "USD", "GBP", "CNY", "BRL"] as const;

type Currency = (typeof currencies)[number];

type FrankfurterResponse = {
  date: string;
  rates: Record<string, number>;
};

async function getRates(
  url: string
): Promise<FrankfurterResponse> {
  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Exchange API error: ${response.status}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const latest = await getRates(
      "https://api.frankfurter.dev/v1/latest?base=EUR"
    );

    // Busca a referência anterior, considerando finais de semana.
    const previousDate = new Date(
      `${latest.date}T12:00:00Z`
    );

    previousDate.setUTCDate(previousDate.getUTCDate() - 1);

    const previous = await getRates(
      `https://api.frankfurter.dev/v1/${previousDate
        .toISOString()
        .slice(0, 10)}?base=EUR`
    );

    const rates: Record<Currency, number> = {
      EUR: 1,
      USD: 0,
      GBP: 0,
      CNY: 0,
      BRL: 0,
    };

    const previousRates: Record<Currency, number> = {
      EUR: 1,
      USD: 0,
      GBP: 0,
      CNY: 0,
      BRL: 0,
    };

    for (const currency of currencies) {
      if (currency === "EUR") continue;

      const current = Number(latest.rates[currency]);
      const old = Number(previous.rates[currency]);

      if (
        !Number.isFinite(current) ||
        !Number.isFinite(old) ||
        current <= 0 ||
        old <= 0
      ) {
        throw new Error(`Invalid rate for ${currency}`);
      }

      rates[currency] = current;
      previousRates[currency] = old;
    }

    return NextResponse.json({
      base: "EUR",
      rates,
      previousRates,
      date: latest.date,
      previousDate: previous.date,
      source: "Frankfurter",
    });
  } catch (error) {
    console.error("Exchange rate error:", error);

    return NextResponse.json(
      { error: "Exchange rates temporarily unavailable" },
      { status: 503 }
    );
  }
}
