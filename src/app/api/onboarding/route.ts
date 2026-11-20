
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
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

    const { data: memberships, error: membershipError } =
      await supabase
        .from("company_members")
        .select("company_id, role")
        .eq("user_id", user.id)
        .limit(1);

    if (membershipError) {
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    if (memberships && memberships.length > 0) {
      return NextResponse.json({
        success: true,
        companyId: memberships[0].company_id,
        created: false,
      });
    }

    const metadata = user.user_metadata;

    const name = metadata?.pending_company_name;
    const industry = metadata?.pending_industry;
    const companySize = metadata?.pending_company_size;
    const currency = metadata?.pending_currency;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof industry !== "string" ||
      !industry.trim() ||
      typeof companySize !== "string" ||
      !companySize.trim() ||
      typeof currency !== "string" ||
      !currency.trim()
    ) {
      return NextResponse.json(
        { error: "Company registration details are missing." },
        { status: 400 }
      );
    }

    const { data: companyId, error: createError } =
      await supabase.rpc("create_company", {
        p_name: name.trim(),
        p_industry: industry,
        p_company_size: companySize,
        p_primary_currency: currency,
      });

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      companyId,
      created: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete company setup." },
      { status: 500 }
    );
  }
}
