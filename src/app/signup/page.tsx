"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { savePendingCompanyLogo } from "@/lib/pending-company-logo";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Crown,
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";

const industries = [
  "Technology & Software",
  "Retail & E-commerce",
  "Professional Services",
  "Construction & Real Estate",
  "Healthcare",
  "Manufacturing",
  "Other",
];

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)]";

export default function SignupPage() {
  const [step, setStep] = useState(1);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState(industries[0]);
  const [size, setSize] = useState("1-10");
  const [role, setRole] = useState<"Owner" | "Manager">("Owner");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

useEffect(() => {
  if (!companyLogo) {
    setLogoPreview(null);
    return;
  }

  const url = URL.createObjectURL(companyLogo);
  setLogoPreview(url);

  return () => {
    URL.revokeObjectURL(url);
  };
}, [companyLogo]);
  const canContinue =
    step === 1
      ? company.trim().length >= 2
      : step === 2
        ? name.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
          password.length >= 8 &&
          password === confirmPassword
        : true;

  function nextStep() {
    if (canContinue && step < 3) {
      setStep(step + 1);
    }
  }

async function handleCreateWorkspace() {
  if (loading) return;

  setError("");
  setSuccess("");

  if (role !== "Owner") {
    setError("Managers must join through an invitation.");
    return;
  }

  if (
    company.trim().length < 2 ||
    name.trim().length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8 ||
    password !== confirmPassword
  ) {
    setError("Please review your account details.");
    return;
  }

  setLoading(true);

  try {
    const supabase = createClient();

    const { data, error: signupError } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            pending_company_name: company.trim(),
            pending_industry: industry,
            pending_company_size: size,
            pending_currency: currency,
          },
        },
      });

    if (signupError) {
      setError(signupError.message);
      return;
    }
if (companyLogo && data.user) {
  await savePendingCompanyLogo(data.user.id, companyLogo);
}
    if (!data.session) {
      setSuccess(
        "Check your email to confirm your account. Sign in afterward to finish setting up your company."
      );
      return;
    }

    setSuccess(
      "Account created. Company setup is the next step."
    );
  } catch {
    setError("Unable to create your account. Please try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-xl">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              WJR<span className="text-[var(--primary)]">FIN</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Business Finance
            </p>
          </div>

          <span className="text-sm text-[var(--text-secondary)]">
            Step {step} of 3
          </span>
        </header>

        <div className="mb-10 flex gap-2">
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              className={`h-1.5 flex-1 rounded-full ${
                number <= step
                  ? "bg-[var(--primary)]"
                  : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-10">
          {step === 1 && (
            <div className="space-y-7">
              <div>
                <Building2 className="mb-5 text-[var(--primary)]" size={30} />
                <h2 className="text-3xl font-semibold tracking-tight">
                  Create your workspace.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Tell us about your business to personalize your experience.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Company name
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Acme Technologies"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  maxLength={100}
                />
              </div>


                <div>
  <label className="mb-2 block text-sm font-medium">
    Company Logo (Optional)
  </label>

  <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-5">
    <div className="flex items-center gap-4">
{logoPreview ? (
  <img
    src={logoPreview}
    alt="Company logo preview"
    className="h-16 w-16 rounded-xl object-contain"
  />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--surface)]">
          <Building2 size={28} className="text-[var(--primary)]" />
        </div>
      )}

      <div className="flex-1">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-xs text-[var(--text-secondary)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-3 file:py-2 file:font-medium file:text-white"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;

            if (file && file.size > 2 * 1024 * 1024) {
              setError("Logo must be smaller than 2 MB.");
              event.target.value = "";
              return;
            }

            setError("");
            setCompanyLogo(file);
          }}
        />

        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          PNG, JPG or WebP. Maximum 2 MB.
        </p>
      </div>
    </div>
  </div>
</div>

<div>
  <label className="mb-2 block text-sm font-medium">
    Industry
  </label>
  <select
    className={inputClass}
    value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                >
                  {industries.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Company size
                </label>
                <select
                  className={inputClass}
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                >
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium">
                  Your role
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "Owner", icon: Crown },
                    { value: "Manager", icon: BriefcaseBusiness },
                  ] as const).map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        role === value
                          ? "border-[var(--primary)] bg-[var(--background)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <Icon className="mb-4 text-[var(--primary)]" size={24} />
                      <span className="block font-semibold">{value}</span>
                      <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                        {value === "Owner"
                          ? "Business administrator"
                          : "Invited team member"}
                      </span>
                    </button>
                  ))}
                </div>

                {role === "Manager" && (
                  <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
                    Managers will join an existing company through a verified invitation.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold">
                  Your account details.
                </h2>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Set up your professional WJRFIN account.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm">Full name</label>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Work email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Password</label>
                <input
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Confirm password</label>
                <input
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600">
                  Passwords do not match.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div>
                <ShieldCheck
                  className="mb-5 text-[var(--primary)]"
                  size={32}
                />
                <h2 className="text-3xl font-semibold">
                  Your workspace is almost ready.
                </h2>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Review your preferences before creating your account.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Primary currency
                </label>
                <select
                  className={inputClass}
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="BRL">BRL — Brazilian Real</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="PYG">PYG — Paraguayan Guaraní</option>
                </select>
              </div>

              <div className="space-y-3 rounded-2xl bg-[var(--background)] p-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--text-secondary)]">Company</span>
                  <strong>{company}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--text-secondary)]">Role</span>
                  <strong>{role}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--text-secondary)]">Email</span>
                  <strong className="break-all text-right">{email}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--text-secondary)]">Currency</span>
                  <strong>{currency}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check size={16} />
                Your information will be protected by workspace permissions.
              </div>
            </div>
          )}

{error && (
  <p role="alert" className="mt-5 text-sm text-red-500">
    {error}
  </p>
)}

{success && (
  <p role="status" className="mt-5 text-sm text-green-500">
    {success}
  </p>
)}

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-7">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 text-sm disabled:opacity-30"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canContinue}
                className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white disabled:opacity-40"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            ) : (
              
<button
  type="button"
  onClick={handleCreateWorkspace}
  disabled={loading || role !== "Owner"}
  className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? "Creating account..." : "Create workspace"}
</button>

            )}
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-[var(--text-secondary)]">
          WJRFIN — Business Financial Intelligence
        </p>
      </div>
    </main>
  );
}
