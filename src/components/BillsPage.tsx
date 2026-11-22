"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { currency, locales } from "@/lib/financial";
import { createClient } from "@/lib/supabase/client";

type BillType = "payable" | "receivable";
type Bill = {
  id: string;
  description: string;
  type: BillType;
  amount: number;
  due_date: string;
  paid: boolean;
};

type Props = { companyId: string | null; companyCurrency: string };

const labels = {
  en: ["Bills", "Manage payable and receivable bills", "New bill", "Description", "Amount", "Due date", "Payable", "Receivable", "Save", "Cancel", "Mark paid", "Mark pending", "Delete", "No bills yet", "Bills are securely stored for your company.", "Pending", "Paid", "Enter a valid description, amount and date.", "Remove this bill?", "Edit", "Save changes", "Unable to load bills.", "Unable to save bill.", "Unable to update bill.", "Unable to delete bill.", "Loading bills...", "Please sign in to continue.", "You do not have permission to perform this action."],
  es: ["Cuentas", "Gestiona cuentas por pagar y cobrar", "Nueva cuenta", "Descripción", "Importe", "Vencimiento", "Por pagar", "Por cobrar", "Guardar", "Cancelar", "Marcar pagada", "Marcar pendiente", "Eliminar", "Todavía no hay cuentas", "Las cuentas se guardan de forma segura para tu empresa.", "Pendiente", "Pagada", "Introduce descripción, importe y fecha válidos.", "¿Eliminar esta cuenta?", "Editar", "Guardar cambios", "No se pudieron cargar las cuentas.", "No se pudo guardar la cuenta.", "No se pudo actualizar la cuenta.", "No se pudo eliminar la cuenta.", "Cargando cuentas...", "Inicia sesión para continuar.", "No tienes permiso para realizar esta acción."],
  "pt-BR": ["Contas", "Gerencie contas a pagar e receber", "Nova conta", "Descrição", "Valor", "Vencimento", "A pagar", "A receber", "Salvar", "Cancelar", "Marcar como paga", "Marcar como pendente", "Excluir", "Nenhuma conta cadastrada", "As contas são armazenadas com segurança para sua empresa.", "Pendente", "Paga", "Informe descrição, valor e data válidos.", "Excluir esta conta?", "Editar", "Salvar alterações", "Não foi possível carregar as contas.", "Não foi possível salvar a conta.", "Não foi possível atualizar a conta.", "Não foi possível excluir a conta.", "Carregando contas...", "Entre na sua conta para continuar.", "Você não tem permissão para realizar esta ação."],
  "pt-PT": ["Contas", "Gerir contas a pagar e receber", "Nova conta", "Descrição", "Valor", "Vencimento", "A pagar", "A receber", "Guardar", "Cancelar", "Marcar como paga", "Marcar como pendente", "Eliminar", "Ainda não existem contas", "As contas são guardadas de forma segura para a sua empresa.", "Pendente", "Paga", "Indique descrição, valor e data válidos.", "Eliminar esta conta?", "Editar", "Guardar alterações", "Não foi possível carregar as contas.", "Não foi possível guardar a conta.", "Não foi possível atualizar a conta.", "Não foi possível eliminar a conta.", "A carregar contas...", "Inicie sessão para continuar.", "Não tem permissão para realizar esta ação."],
} as const;

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default function BillsPage({ companyId, companyCurrency }: Props) {
  const { language } = useLanguage();
  const l = labels[language];
  const locale = locales[language];
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<BillType>("payable");
  const [error, setError] = useState("");

  const loadBills = useCallback(async (id: string) => {
    const supabase = createClient();
    const { data, error: queryError } = await supabase
      .from("bills")
      .select("id, description, type, amount, due_date, paid")
      .eq("company_id", id)
      .order("due_date", { ascending: true });
    if (queryError) throw queryError;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      description: row.description as string,
      type: row.type as BillType,
      amount: Number(row.amount),
      due_date: row.due_date as string,
      paid: row.paid as boolean,
    }));
  }, []);

  useEffect(() => {
    let active = true;
    const id = companyId;
    queueMicrotask(() => {
      if (!active) return;
      setBills([]);
      setError("");
      setLoading(Boolean(id));
    });
    if (id) {
      void loadBills(id)
        .then((rows) => { if (active) setBills(rows); })
        .catch(() => { if (active) setError(labels[language][21]); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [companyId, loadBills, language]);

  const ordered = useMemo(
    () => [...bills].sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [bills]
  );

  function resetForm() {
    setEditingId(null);
    setDescription("");
    setAmount("");
    setDueDate("");
    setType("payable");
    setError("");
    setShowForm(false);
  }

  function editBill(bill: Bill) {
    setEditingId(bill.id);
    setDescription(bill.description);
    setAmount(String(bill.amount));
    setDueDate(bill.due_date);
    setType(bill.type);
    setError("");
    setShowForm(true);
  }

  async function save() {
    if (!companyId || busy) return;
    const value = Number(amount);
    if (!description.trim() || !Number.isFinite(value) || value <= 0 || !isValidDate(dueDate)) {
      setError(l[17]);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const payload = { description: description.trim(), amount: value, due_date: dueDate, type };
      if (editingId) {
        const { error: updateError } = await supabase.from("bills")
          .update(payload).eq("id", editingId).eq("company_id", companyId).select("id").single();
        if (updateError) throw updateError;
      } else {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) { setError(l[26]); return; }
        const { error: insertError } = await supabase.from("bills")
          .insert({ ...payload, company_id: companyId, user_id: authData.user.id, paid: false });
        if (insertError) throw insertError;
      }
      setBills(await loadBills(companyId));
      resetForm();
    } catch (caught) {
      console.error("Bills save failed:", caught);
      setError(editingId ? l[23] : l[22]);
    } finally {
      setBusy(false);
    }
  }

  async function togglePaid(bill: Bill) {
    if (!companyId || busy) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.from("bills")
        .update({ paid: !bill.paid }).eq("id", bill.id).eq("company_id", companyId)
        .select("id").single();
      if (updateError) throw updateError;
      setBills(await loadBills(companyId));
    } catch (caught) {
      console.error("Bills status update failed:", caught);
      setError(l[23]);
    } finally { setBusy(false); }
  }

  async function removeBill(bill: Bill) {
    if (!companyId || busy || !window.confirm(l[18])) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from("bills")
        .delete().eq("id", bill.id).eq("company_id", companyId).select("id").single();
      if (deleteError) throw deleteError;
      setBills(await loadBills(companyId));
      if (editingId === bill.id) resetForm();
    } catch (caught) {
      console.error("Bills deletion failed:", caught);
      setError(l[24]);
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{l[0]}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{l[1]}</p>
        </div>
        <button disabled={!companyId || busy} onClick={() => showForm ? resetForm() : setShowForm(true)}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50">
          {showForm ? l[9] : l[2]}
        </button>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">{l[14]}</p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {showForm && (
        <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:grid-cols-2">
          <label className="text-sm">{l[3]}
            <input maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2" />
          </label>
          <label className="text-sm">{l[4]} ({companyCurrency})
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2" />
          </label>
          <label className="text-sm">{l[5]}
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent p-2" />
          </label>
          <label className="text-sm">{l[0]}
            <select value={type} onChange={(e) => setType(e.target.value as BillType)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
              <option value="payable">{l[6]}</option>
              <option value="receivable">{l[7]}</option>
            </select>
          </label>
          <button disabled={busy} onClick={() => void save()}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-50 md:col-span-2">
            {editingId ? l[20] : l[8]}
          </button>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {loading || !companyId ? (
          <p className="p-6 text-sm">{l[25]}</p>
        ) : ordered.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-secondary)]">{l[13]}</p>
        ) : (
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead><tr className="border-b border-[var(--border)]">
              {[l[3], l[0], l[5], l[4], l[15], ""].map((heading, index) => (
                <th key={index} className="p-4">{heading}</th>
              ))}
            </tr></thead>
            <tbody>{ordered.map((bill) => (
              <tr key={bill.id} className="border-b border-[var(--border)]">
                <td className="p-4">{bill.description}</td>
                <td className="p-4">{bill.type === "payable" ? l[6] : l[7]}</td>
                <td className="p-4">{new Date(`${bill.due_date}T12:00:00`).toLocaleDateString(locale)}</td>
                <td className="p-4">{currency(bill.amount, companyCurrency, locale)}</td>
                <td className="p-4">{bill.paid ? l[16] : l[15]}</td>
                <td className="flex flex-wrap gap-2 p-4">
                  <button disabled={busy} className="underline disabled:opacity-50" onClick={() => void togglePaid(bill)}>
                    {bill.paid ? l[11] : l[10]}
                  </button>
                  <button disabled={busy} className="underline disabled:opacity-50" onClick={() => editBill(bill)}>{l[19]}</button>
                  <button disabled={busy} className="text-red-600 underline disabled:opacity-50" onClick={() => void removeBill(bill)}>{l[12]}</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
