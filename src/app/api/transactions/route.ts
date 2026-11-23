import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Email confirmation required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const companyId = body?.companyId;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      typeof companyId !== "string" ||
      !uuidPattern.test(companyId)
    ) {
      return NextResponse.json(
        { error: "Invalid company." },
        { status: 400 }
      );
    }

    const { data: membership, error: membershipError } =
      await supabase
        .from("company_members")
        .select("role")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (membershipError) {
      return NextResponse.json(
        { error: "Unable to verify company permissions." },
        { status: 500 }
      );
    }

    if (
      !membership ||
      !["owner", "manager"].includes(membership.role.toLowerCase())
    ) {
      return NextResponse.json(
        { error: "Permission denied." },
        { status: 403 }
      );
    }

    const { data: company, error: companyError } =
      await supabase
        .from("companies")
        .select("primary_currency")
        .eq("id", companyId)
        .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Unable to load company currency." },
        { status: 404 }
      );
    }

    const targetCurrency = company.primary_currency.toUpperCase();

    if (!["BRL", "USD", "EUR", "CNY"].includes(targetCurrency)) {
      return NextResponse.json(
        { error: "Company currency is not supported for conversion." },
        { status: 400 }
      );
    }

    const transactionId = body?.transactionId ?? null;

    if (
      transactionId !== null &&
      (typeof transactionId !== "string" ||
        !uuidPattern.test(transactionId))
    ) {
      return NextResponse.json(
        { error: "Invalid transaction ID." },
        { status: 400 }
      );
    }

    const description = body?.description;
    const category = body?.category;
    const type = body?.type;
    const amount = body?.amount;
    const originalCurrency = body?.originalCurrency;
    const date = body?.date;

    if (
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 120 ||
      typeof category !== "string" ||
      !category.trim() ||
      !["Income", "Expense"].includes(type) ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isInteger(amount * 100) ||
      typeof originalCurrency !== "string" ||
      !["BRL", "USD", "EUR", "CNY"].includes(originalCurrency) ||
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return NextResponse.json(
        { error: "Invalid transaction details." },
        { status: 400 }
      );
    }

    let existingTransaction: {
      amount: number;
      original_amount: number | null;
      original_currency: string | null;
      exchange_rate: number | null;
      exchange_rate_date: string | null;
    } | null = null;

    if (transactionId) {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "amount, original_amount, original_currency, exchange_rate, exchange_rate_date"
        )
        .eq("id", transactionId)
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { error: "Unable to load transaction." },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Transaction not found." },
          { status: 404 }
        );
      }

      existingTransaction = {
        amount: Number(data.amount),
        original_amount:
          data.original_amount == null ? null : Number(data.original_amount),
        original_currency: data.original_currency,
        exchange_rate:
          data.exchange_rate == null ? null : Number(data.exchange_rate),
        exchange_rate_date: data.exchange_rate_date,
      };
    }

    let exchangeRate = 1;
    let exchangeRateDate: string | null = null;

    const previousOriginalAmount =
      existingTransaction?.original_amount ??
      existingTransaction?.amount;

    const previousOriginalCurrency =
      existingTransaction?.original_currency ?? targetCurrency;

    const preserveHistoricalRate =
      existingTransaction !== null &&
      amount === previousOriginalAmount &&
      originalCurrency === previousOriginalCurrency;

    if (preserveHistoricalRate && existingTransaction) {
      exchangeRate = existingTransaction.exchange_rate ?? 1;
      exchangeRateDate = existingTransaction.exchange_rate_date;
    } else if (originalCurrency !== targetCurrency) {
      const response = await fetch(
        "https://api.frankfurter.dev/v1/latest?base=EUR",
        { next: { revalidate: 300 } }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: "Exchange rates unavailable." },
          { status: 503 }
        );
      }

      const rates = await response.json();

      const sourceRate =
        originalCurrency === "EUR"
          ? 1
          : Number(rates.rates?.[originalCurrency]);

      const destinationRate =
        targetCurrency === "EUR"
          ? 1
          : Number(rates.rates?.[targetCurrency]);

      if (
        !Number.isFinite(sourceRate) ||
        !Number.isFinite(destinationRate) ||
        sourceRate <= 0 ||
        destinationRate <= 0
      ) {
        return NextResponse.json(
          { error: "Invalid exchange rate." },
          { status: 503 }
        );
      }

      exchangeRate = destinationRate / sourceRate;
      exchangeRateDate = rates.date;
    }

    const convertedAmount =
      preserveHistoricalRate && existingTransaction
        ? existingTransaction.amount
        : Math.round((amount * exchangeRate + Number.EPSILON) * 100) / 100;

    if (
      !Number.isFinite(convertedAmount) ||
      convertedAmount <= 0 ||
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid converted amount." },
        { status: 400 }
      );
    }

    const values = {
      description: description.trim(),
      category: category.trim(),
      type,
      amount: convertedAmount,
      original_amount: amount,
      original_currency: originalCurrency,
      exchange_rate: exchangeRate,
      exchange_rate_date: exchangeRateDate,
      date,
    };

    if (transactionId) {
      const { data, error } = await supabase
        .from("transactions")
        .update(values)
        .eq("id", transactionId)
        .eq("company_id", companyId)
        .select("id")
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: error?.message ?? "Unable to update transaction." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        transactionId: data.id,
      });
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...values,
        company_id: companyId,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to create transaction." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, transactionId: data.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to process transaction." },
      { status: 500 }
    );
  }
}
