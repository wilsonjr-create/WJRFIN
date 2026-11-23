"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewCompanyPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [checking, setChecking] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Technology & Software");
  const [companySize, setCompanySize] = useState("1-10");
  const [primaryCurrency, setPrimaryCurrency] = useState("USD");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (!companyLogo) {
      return;
    }

    const url = URL.createObjectURL(companyLogo);
    setLogoPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [companyLogo]);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !user || !user.email_confirmed_at) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function uploadNewCompanyLogo(companyId: string, file: File) {
    const extensions: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
    };

    const extension = extensions[file.type];

    if (!extension || file.size === 0 || file.size > 2 * 1024 * 1024) {
      throw new Error("A logo deve ser PNG, JPG ou WebP de até 2 MB.");
    }

    const supabase = createClient();
    const path = `${companyId}/logo-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: updated, error: updateError } = await supabase
      .from("companies")
      .update({ logo_path: path })
      .eq("id", companyId)
      .select("id")
      .single();

    if (updateError || !updated) {
      await supabase.storage.from("company-logos").remove([path]);
      throw updateError ?? new Error("Não foi possível salvar a logo.");
    }
  }

  async function handleCreateCompany() {
    if (creating || createdCompanyId) return;

    setCreateError("");

    if (companyName.trim().length < 2) {
      setCreateError("Informe um nome de empresa válido.");
      return;
    }

    setCreating(true);

    try {
      const requestKey = "wjrfin-pending-company-request";
      const requestPayload = JSON.stringify({
        name: companyName.trim(),
        industry,
        companySize,
        primaryCurrency,
      });

      let pendingRequest: {
        id: string;
        payload: string;
      } | null = null;

      try {
        const saved = sessionStorage.getItem(requestKey);
        if (saved) pendingRequest = JSON.parse(saved);
      } catch {
        pendingRequest = null;
      }

      const creationRequestId =
        pendingRequest?.payload === requestPayload &&
        typeof pendingRequest.id === "string"
          ? pendingRequest.id
          : crypto.randomUUID();

      sessionStorage.setItem(
        requestKey,
        JSON.stringify({
          id: creationRequestId,
          payload: requestPayload,
        })
      );

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName.trim(),
          industry,
          companySize,
          primaryCurrency,
          creationRequestId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || typeof result.companyId !== "string") {
        throw new Error(result.error ?? "Não foi possível criar a empresa.");
      }

      setCreatedCompanyId(result.companyId);
      sessionStorage.removeItem("wjrfin-pending-company-request");

      if (companyLogo) {
        try {
          await uploadNewCompanyLogo(result.companyId, companyLogo);
        } catch (logoUploadError) {
          setCreateError(
            "Empresa criada com sucesso, mas não foi possível salvar a logo. " +
            "Você poderá adicioná-la depois em Configurações. " +
            (logoUploadError instanceof Error ? logoUploadError.message : "")
          );
          return;
        }
      }
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Erro ao criar empresa."
      );
    } finally {
      setCreating(false);
    }
  }

  const isPortuguese = language === "pt-BR" || language === "pt-PT";

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <LoaderCircle
          size={28}
          className="animate-spin text-[var(--primary)]"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-12 text-[var(--text-primary)]">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-8 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]"
        >
          <ArrowLeft size={18} />
          {isPortuguese ? "Voltar ao painel" : language === "es" ? "Volver al panel" : "Back to dashboard"}
        </button>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--sidebar)] p-8 shadow-sm">
          <div className="mb-6 inline-flex rounded-2xl bg-[var(--primary-soft)] p-4 text-[var(--primary)]">
            <Building2 size={28} />
          </div>

          <h1 className="text-2xl font-bold">
            {isPortuguese ? "Adicionar empresa" : language === "es" ? "Añadir empresa" : "Add company"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {isPortuguese
              ? "Cadastre outra empresa na sua conta WJRFIN."
              : language === "es"
                ? "Registra otra empresa en tu cuenta WJRFIN."
                : "Register another company in your WJRFIN account."}
          </p>
          <div className="mt-8">
            <label htmlFor="company-logo" className="mb-3 block text-sm font-medium">
              Logo da empresa (opcional)
            </label>

            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                {logoPreview ? (
                  <Image
                    unoptimized
                    src={logoPreview}
                    alt="Pré-visualização da logo"
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 size={30} className="text-[var(--text-secondary)]" />
                )}
              </div>

              <input
                id="company-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="min-w-0 text-sm text-[var(--text-secondary)]"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setLogoError("");

                  if (file && (
                    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
                    file.size === 0 ||
                    file.size > 2 * 1024 * 1024
                  )) {
                    setCompanyLogo(null);
                    setLogoPreview(null);
                    setLogoError("Selecione PNG, JPG ou WebP de até 2 MB.");
                    event.target.value = "";
                    return;
                  }

                  setCompanyLogo(file);
                  if (!file) setLogoPreview(null);
                }}
              />
            </div>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              PNG, JPG ou WebP · Máximo de 2 MB
            </p>
            {logoError && <p role="alert" className="mt-2 text-sm text-red-500">{logoError}</p>}
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="company-name" className="mb-2 block text-sm font-medium">
                Nome da empresa
              </label>
              <input
                id="company-name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Ex.: WJR TECH"
                maxLength={120}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="company-industry" className="mb-2 block text-sm font-medium">
                Setor de atuação
              </label>
              <select
                id="company-industry"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                {["Technology & Software", "Retail & E-commerce", "Professional Services", "Construction & Real Estate", "Healthcare", "Manufacturing", "Other"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="company-size" className="mb-2 block text-sm font-medium">
                Porte da empresa
              </label>
              <select
                id="company-size"
                value={companySize}
                onChange={(event) => setCompanySize(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                {["1-10", "11-50", "51-200", "201-500", "500+"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="company-currency" className="mb-2 block text-sm font-medium">
                Moeda principal
              </label>
              <select
                id="company-currency"
                value={primaryCurrency}
                onChange={(event) => setPrimaryCurrency(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                <option value="BRL">BRL — Real brasileiro</option>
                <option value="USD">USD — Dólar americano</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — Libra esterlina</option>
                <option value="PYG">PYG — Guarani paraguaio</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {createError && (
              <p role="alert" className="text-sm text-red-500">
                {createError}
              </p>
            )}

            {createdCompanyId ? (
              <div className="space-y-4">
                <p role="status" className="text-sm text-emerald-500">
                  Empresa criada com sucesso!
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white"
                >
                  Ir para o painel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleCreateCompany()}
                disabled={creating || companyName.trim().length < 2 || Boolean(logoError)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating && <LoaderCircle size={18} className="animate-spin" />}
                {creating ? "Criando empresa..." : "Criar empresa"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
