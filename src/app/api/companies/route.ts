import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedCurrencies = ["USD", "BRL", "EUR", "GBP", "PYG"];

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

    const name = body?.name;
    const industry = body?.industry;
    const companySize = body?.companySize;
    const primaryCurrency = body?.primaryCurrency;
    const creationRequestId = body?.creationRequestId;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 120 ||
      typeof industry !== "string" ||
      !industry.trim() ||
      typeof companySize !== "string" ||
      !companySize.trim() ||
      typeof primaryCurrency !== "string" ||
      !allowedCurrencies.includes(primaryCurrency) ||
      typeof creationRequestId !== "string" ||
      !uuidPattern.test(creationRequestId)
    ) {
      return NextResponse.json(
        { error: "Invalid company details." },
        { status: 400 }
      );
    }

    const { data: companyId, error: createError } =
      await supabase.rpc("create_company", {
        p_name: name.trim(),
        p_industry: industry.trim(),
        p_company_size: companySize.trim(),
        p_primary_currency: primaryCurrency,
        p_creation_request_id: creationRequestId,
      });

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, companyId },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to create company." },
      { status: 500 }
    );
  }
}
