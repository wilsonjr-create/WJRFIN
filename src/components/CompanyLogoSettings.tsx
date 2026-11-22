"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Building2, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Language = "en" | "es" | "pt-BR" | "pt-PT";
type Props = {
  companyId: string | null;
  logoPath: string | null;
  logoUrl: string | null;
  isOwner: boolean;
  onLogoChange: (path: string | null, url: string | null) => void;
};

const labels = {
  en: { title: "Company logo", description: "Personalize your company's identity in the sidebar.", help: "PNG, JPG or WebP · Up to 2 MB", upload: "Upload logo", replace: "Replace logo", remove: "Remove logo", owner: "Only the company owner can change its logo.", saving: "Saving...", success: "Company logo updated.", removed: "Company logo removed.", invalid: "Choose a PNG, JPG or WebP image up to 2 MB.", failure: "Unable to update the company logo.", confirm: "Remove this company's logo?", missing: "Company not available.", orphan: "The logo was updated, but the previous file could not be deleted." },
  es: { title: "Logo de la empresa", description: "Personaliza la identidad de tu empresa en la barra lateral.", help: "PNG, JPG o WebP · Hasta 2 MB", upload: "Subir logo", replace: "Cambiar logo", remove: "Eliminar logo", owner: "Solo el propietario puede cambiar el logo.", saving: "Guardando...", success: "Logo actualizado.", removed: "Logo eliminado.", invalid: "Elige una imagen PNG, JPG o WebP de hasta 2 MB.", failure: "No se pudo actualizar el logo.", confirm: "¿Eliminar el logo de esta empresa?", missing: "Empresa no disponible.", orphan: "Se actualizó el logo, pero no se pudo eliminar el archivo anterior." },
  "pt-BR": { title: "Logo da empresa", description: "Personalize a identidade da sua empresa na barra lateral.", help: "PNG, JPG ou WebP · Até 2 MB", upload: "Enviar logo", replace: "Trocar logo", remove: "Remover logo", owner: "Somente o proprietário pode alterar a logo da empresa.", saving: "Salvando...", success: "Logo da empresa atualizada.", removed: "Logo da empresa removida.", invalid: "Selecione uma imagem PNG, JPG ou WebP de até 2 MB.", failure: "Não foi possível atualizar a logo.", confirm: "Remover a logo desta empresa?", missing: "Empresa indisponível.", orphan: "A logo foi atualizada, mas não foi possível excluir o arquivo anterior." },
  "pt-PT": { title: "Logótipo da empresa", description: "Personalize a identidade da sua empresa na barra lateral.", help: "PNG, JPG ou WebP · Até 2 MB", upload: "Carregar logótipo", replace: "Alterar logótipo", remove: "Remover logótipo", owner: "Apenas o proprietário pode alterar o logótipo.", saving: "A guardar...", success: "Logótipo atualizado.", removed: "Logótipo removido.", invalid: "Selecione uma imagem PNG, JPG ou WebP até 2 MB.", failure: "Não foi possível atualizar o logótipo.", confirm: "Remover o logótipo desta empresa?", missing: "Empresa indisponível.", orphan: "O logótipo foi atualizado, mas não foi possível eliminar o ficheiro anterior." },
} satisfies Record<Language, Record<string, string>>;

const validTypes: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

export default function CompanyLogoSettings({ companyId, logoPath, logoUrl, isOwner, onLogoChange }: Props) {
  const { language } = useLanguage();
  const t = labels[language as Language] ?? labels.en;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file || busy || !isOwner) return;
    setMessage(""); setError("");
    if (!companyId) { setError(t.missing); return; }
    const extension = validTypes[file.type];
    if (!extension || file.size === 0 || file.size > 2 * 1024 * 1024) { setError(t.invalid); return; }
    setBusy(true);
    const supabase = createClient();
    const path = `${companyId}/logo-${crypto.randomUUID()}.${extension}`;
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error(t.failure);
      const { error: uploadError } = await supabase.storage.from("company-logos").upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: updated, error: updateError } = await supabase.from("companies").update({ logo_path: path }).eq("id", companyId).select("id").single();
      if (updateError || !updated) {
        await supabase.storage.from("company-logos").remove([path]);
        throw updateError ?? new Error(t.failure);
      }
      const { data: signed, error: signedError } = await supabase.storage.from("company-logos").createSignedUrl(path, 3600);
      onLogoChange(path, signedError ? null : signed?.signedUrl ?? null);
      setMessage(t.success);
      if (logoPath && logoPath !== path && logoPath.startsWith(`${companyId}/`)) {
        const { error: deleteError } = await supabase.storage.from("company-logos").remove([logoPath]);
        if (deleteError) setError(t.orphan);
      }
    } catch (err) {
      setError(err instanceof Error ? `${t.failure} ${err.message}` : t.failure);
    } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  async function remove() {
    if (busy || !isOwner || !companyId || !logoPath || !window.confirm(t.confirm)) return;
    setBusy(true); setError(""); setMessage("");
    const supabase = createClient();
    try {
      const { data, error: updateError } = await supabase.from("companies").update({ logo_path: null }).eq("id", companyId).select("id").single();
      if (updateError || !data) throw updateError ?? new Error(t.failure);
      onLogoChange(null, null);
      setMessage(t.removed);
      if (logoPath.startsWith(`${companyId}/`)) {
        const { error: deleteError } = await supabase.storage.from("company-logos").remove([logoPath]);
        if (deleteError) setError(t.orphan);
      }
    } catch (err) { setError(err instanceof Error ? `${t.failure} ${err.message}` : t.failure); }
    finally { setBusy(false); }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]"><ImagePlus size={22} /></div>
        <div><h2 className="text-xl font-bold text-[var(--text-primary)]">{t.title}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{t.description}</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--sidebar)] p-2">
          {logoUrl ? <img src={logoUrl} alt={t.title} className="h-full w-full object-contain" /> : <Building2 size={32} className="text-[var(--text-secondary)]" />}
        </div>
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">{t.help}</p>
          {isOwner && companyId ? (
            <div className="flex flex-wrap gap-2">
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={t.upload} onChange={(event) => { void upload(event.target.files?.[0]); }} disabled={busy} />
              <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}{busy ? t.saving : logoPath ? t.replace : t.upload}</button>
              {logoPath && <button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-50"><Trash2 size={16} />{t.remove}</button>}
            </div>
          ) : <p className="text-sm text-[var(--text-secondary)]">{companyId ? t.owner : t.missing}</p>}
        </div>
      </div>
      {message && <p role="status" className="mt-4 text-sm text-emerald-600">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </section>
  );
}
