"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getPendingCompanyLogo,
  clearPendingCompanyLogo,
} from "@/lib/pending-company-logo";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?flow=google`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch {
      setError("Unable to connect with Google. Please try again.");
      setLoading(false);
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      
const onboardingResponse = await fetch("/api/onboarding", {
  method: "POST",
});

const onboardingResult = await onboardingResponse.json();

if (!onboardingResponse.ok) {
  setError(
    onboardingResult.error ||
      "Unable to set up your company."
  );
  return;
}
const {
  data: { user },
} = await supabase.auth.getUser();

const companyId = onboardingResult.companyId;

if (user && companyId) {
  const pendingLogo = await getPendingCompanyLogo(user.id);

 if (pendingLogo) {
  const extension = pendingLogo.name
    .split(".")
    .pop()
    ?.toLowerCase();

  const allowedExtensions = ["png", "jpg", "jpeg", "webp"];

  if (
    !extension ||
    !allowedExtensions.includes(extension) ||
    !["image/png", "image/jpeg", "image/webp"].includes(pendingLogo.type) ||
    pendingLogo.size > 2 * 1024 * 1024
  ) {
    setError("Invalid company logo. Please use PNG, JPG or WebP up to 2 MB.");
    return;
  }

  const logoPath = `${companyId}/logo-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(logoPath, pendingLogo, {
      contentType: pendingLogo.type,
      upsert: false,
    });

  if (uploadError) {
    setError(`Unable to upload company logo: ${uploadError.message}`);
    return;
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_path: logoPath })
    .eq("id", companyId);

  if (updateError) {
    setError(`Unable to save company logo: ${updateError.message}`);
    return;
  }

  await clearPendingCompanyLogo(user.id);
}
}
router.replace("/dashboard");
router.refresh();

    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-12 text-[var(--text-primary)]">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            WJR<span className="text-[var(--primary)]">FIN</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">
            Business Finance
          </p>
        </header>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm sm:p-10">
          <div className="mb-8">
            <LockKeyhole
              size={30}
              className="mb-5 text-[var(--primary)]"
            />

            <h2 className="text-3xl font-semibold tracking-tight">
              Welcome back.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Sign in to your business financial workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 pr-12 outline-none transition focus:border-[var(--primary)]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-secondary)]">or</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-6 py-3.5 font-semibold transition hover:border-[var(--primary)] disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 5.38 6.51 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.28 5.48-4.84 7.18l7.73 6C44.34 38.03 46.98 31.89 46.98 24.55z"/>
              <path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-8 border-t border-[var(--border)] pt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              New to WJRFIN?{" "}
              <a
                href="/signup"
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                Create an account
              </a>
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
          <ShieldCheck size={16} />
          Secure business authentication
        </div>
      </div>
    </main>
  );
}
