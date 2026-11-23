
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  const origin = appUrl || url.origin;
  const code = url.searchParams.get("code");

  let response = NextResponse.redirect(
    new URL("/login?error=missing_code", origin)
  );

  if (!code) {
    return response;
  }

  response = NextResponse.redirect(
  new URL("/login?confirmed=true", origin)
);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    response.headers.set(
      "Location",
      new URL(
        "/login?error=confirmation_failed",
        origin
      ).toString()
    );
  }

  if (!error && url.searchParams.get("flow") === "google") {
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (!userError && user) {
      const { data: memberships, error: membershipError } =
        await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id)
          .limit(1);

      if (membershipError) {
        response.headers.set(
          "Location",
          new URL("/login?error=company_check_failed", origin).toString()
        );
      } else {
        response.headers.set(
          "Location",
          new URL(
            memberships?.length ? "/dashboard" : "/dashboard/new-company",
            origin
          ).toString()
        );
      }
    }
  }

  return response;
}
