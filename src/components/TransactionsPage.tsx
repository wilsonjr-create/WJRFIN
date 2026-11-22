"use client";
import { translate } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type TransactionType = "Income" | "Expense";

type Transaction = {
  id: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
};

const STORAGE_KEY = "wjrfin-transactions-v1";

const demoTransactions: Transaction[] = [
  {
    id: "demo-1",
    description: "Website Development",
    category: "Services",
    type: "Income",
    amount: 4500,
    date: "2026-11-15",
  },
  {
    id: "demo-2",
    description: "Office Rent",
    category: "Facilities",
    type: "Expense",
    amount: 1200,
    date: "2026-11-12",
  },
  {
    id: "demo-3",
    description: "Consulting Services",
    category: "Services",
    type: "Income",
    amount: 2800,
    date: "2026-11-10",
  },
  {
    id: "demo-4",
    description: "Software Subscription",
    category: "Software",
    type: "Expense",
    amount: 149,
    date: "2026-11-08",
  },
];

const categories = [
  "Sales",
  "Services",
  "Facilities",
  "Marketing",
  "Software",
  "Supplies",
  "Payroll",
  "Other",
];


const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function createId() {
  return crypto.randomUUID();
}


export default function TransactionsPage({
  companyId,
  companyCurrency,
}: {
  companyId: string | null;
  companyCurrency: string;
}) {
  const { language } = useLanguage();
  const t = (key: string) => translate(language, key);
  const money = (value: number) =>
  new Intl.NumberFormat(
    companyCurrency === "BRL" ? "pt-BR" : "en-US",
    {
      style: "currency",
      currency: companyCurrency,
    }
  ).format(value);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [type, setType] = useState<TransactionType>("Income");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Services");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

async function fetchCompanyTransactions() {
  if (!companyId) {
    setTransactionsError("Company not available.");
    return;
  }

  setLoadingTransactions(true);
  setTransactionsError("");

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("id, description, category, type, amount, date")
      .eq("company_id", companyId)
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    
const companyTransactions: Transaction[] = (data ?? []).map(
  (item) => ({
    id: item.id,
    description: item.description,
    category: item.category,
    type: item.type as TransactionType,
    amount: Number(item.amount),
    date: item.date,
  })
);

setTransactions(companyTransactions);

  } catch (error) {
    setTransactionsError(
      error instanceof Error
        ? error.message
        : "Unable to load transactions."
    );
    throw error;
  } finally {
    setLoadingTransactions(false);
  }
}

useEffect(() => {
  if (!companyId) return;

  void fetchCompanyTransactions();

  // Teste inicial da conexão com o Supabase.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [companyId]);


  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "Income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "Expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        const matchesSearch =
          `${item.description} ${item.category}`
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesType =
          filter === "All" || item.type === filter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, filter]);

  function openNewModal(nextType: TransactionType) {
    setEditingId(null);
    setType(nextType);
    setDescription("");
    setCategory(nextType === "Income" ? "Services" : "Facilities");
    setAmount("");
    setDate(new Date().toLocaleDateString("en-CA"));
    setModalOpen(true);
  }

  function openEditModal(item: Transaction) {
    setEditingId(item.id);
    setType(item.type);
    setDescription(item.description);
    setCategory(item.category);
    setAmount(String(item.amount));
    setDate(item.date);
    setModalOpen(true);
  }

  
async function saveTransaction(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (savingTransaction) return;

  setTransactionsError("");

  if (!companyId) {
    setTransactionsError("Company not available.");
    return;
  }

  const numericAmount = Number(amount);

  if (
    !description.trim() ||
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    !date
  ) {
    setTransactionsError("Please enter valid transaction details.");
    return;
  }

  setSavingTransaction(true);

  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to save transactions.");
    }

    const values = {
      description: description.trim(),
      category,
      type,
      amount: numericAmount,
      date,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("transactions")
        .update(values)
        .eq("id", editingId)
        .eq("company_id", companyId)
        .select("id")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Transaction not updated.");
    } else {
      const { error } = await supabase
        .from("transactions")
        .insert({
          ...values,
          company_id: companyId,
          user_id: user.id,
        });

      if (error) throw error;
    }

    await fetchCompanyTransactions();

    setModalOpen(false);
    setEditingId(null);
  } catch (error) {
    setTransactionsError(
      error instanceof Error
        ? error.message
        : "Unable to save transaction."
    );
  } finally {
    setSavingTransaction(false);
  }
}

  async function deleteTransaction(id: string) {
    if (!companyId || !window.confirm(translate(language, "Are you sure you want to delete this transaction?"))) return;
    setTransactionsError("");
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete()
      .eq("id", id).eq("company_id", companyId);
    if (error) {
      setTransactionsError(error.message);
      return;
    }
    await fetchCompanyTransactions();
  }

  return (
    <div className="space-y-7">
      {transactionsError && <p role="alert" className="text-sm text-red-500">{transactionsError}</p>}
      {loadingTransactions && <p className="text-sm text-[var(--text-secondary)]">{t("Loading transactions...")}</p>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-[var(--text-secondary)]">
            {t("Financial Management")}
          </p>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("Transactions")}{" "}
            <span className="text-[var(--primary)]">✦</span>
          </h2>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {t("Record and organize your business income and expenses.")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openNewModal("Income")}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={17} />
            {t("Add Income")}
          </button>

          <button
            onClick={() => openNewModal("Expense")}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold transition hover:bg-[var(--primary-soft)]"
          >
            <Plus size={17} />
            {t("Add Expense")}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
       <SummaryCard
  title={t("Total Income")}
  value={totals.income}
  icon={<ArrowDownLeft size={19} />}
  positive
  money={money}
/>

<SummaryCard
  title={t("Total Expenses")}
  value={totals.expenses}
  icon={<ArrowUpRight size={19} />}
  money={money}
/>

<SummaryCard
  title={t("Net Balance")}
  value={totals.balance}
  icon={<Check size={19} />}
  positive={totals.balance >= 0}
  money={money}
/>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] p-5 md:p-6">
          <div>
            <h3 className="text-lg font-bold">
              {t("Transaction History")}
            </h3>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {filteredTransactions.length} {t("records")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
              <Search
                size={16}
                className="text-[var(--text-secondary)]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search transactions...")}
                className="w-40 bg-transparent text-sm outline-none md:w-52"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
            >
              <option value="All">{t("All Types")}</option>
              <option value="Income">{t("Income")}</option>
              <option value="Expense">{t("Expense")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--sidebar)] text-xs text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-medium">{t("Date")}</th>
                <th className="px-6 py-4 font-medium">{t("Description")}</th>
                <th className="px-6 py-4 font-medium">{t("Category")}</th>
                <th className="px-6 py-4 font-medium">{t("Type")}</th>
                <th className="px-6 py-4 text-right font-medium">
                  {t("Amount")}
                </th>
                <th className="px-6 py-4 text-right font-medium">
                  {t("Actions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-[var(--border)]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                    {new Date(`${item.date}T12:00:00`).toLocaleDateString(language, { day: "numeric", month: "short", year: "numeric" })}
                  </td>

                  <td className="px-6 py-4 font-medium">
                    {item.description}
                  </td>

                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {t(item.category)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        item.type === "Income"
                          ? "bg-[#EAF3E7] text-[#427445]"
                          : "bg-[#FBEAE6] text-[#A54B3B]"
                      }`}
                    >
                      {t(item.type)}
                    </span>
                  </td>

                  <td
                    className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${
                      item.type === "Income"
                        ? "text-[#427445]"
                        : "text-[#A54B3B]"
                    }`}
                  >
                    {item.type === "Income" ? "+" : "−"}
                    {money(item.amount)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        aria-label={`${t("Edit Transaction")}: ${item.description}`}
                        className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteTransaction(item.id)}
                        aria-label={`${t("Delete")}: ${item.description}`}
                        className="rounded-lg p-2 text-[#A54B3B] transition hover:bg-[#FBEAE6]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]"
                  >
                    {t("No transactions found.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-[var(--text-secondary)]">
        {t("Financial tracking only. WJRFIN does not process payments or transfer funds. Records are saved to your company workspace.")}
      </p>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
            className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3
                  id="transaction-modal-title"
                  className="text-xl font-bold"
                >
                  {editingId
                    ? t("Edit Transaction")
                    : type === "Income"
                      ? t("Add Income")
                      : t("Add Expense")}
                </h3>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {t("Manual financial record")}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label={t("Close form")}
                className="rounded-lg p-2 hover:bg-[var(--primary-soft)]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveTransaction} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold">
                  {t("Transaction Type")}
                </label>

                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as TransactionType)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none"
                >
                  <option value="Income">{t("Income")}</option>
                  <option value="Expense">{t("Expense")}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">
                  {t("Description")}
                </label>

                <input
                  required
                  maxLength={120}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder={t("e.g. Client payment, Office rent...")}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                   {t("Amount")} ({companyCurrency})
                  </label>

                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    {t("Date")}
                  </label>

                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">
                  {t("Category")}
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {t(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold"
                >
                  {t("Cancel")}
                </button>

                <button
                  type="submit"
                  disabled={savingTransaction}
                  className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {editingId ? t("Save Changes") : t("Save Transaction")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  positive = false,
  money,
}: {
   title: string;
  value: number;
  icon: React.ReactNode;
  positive?: boolean;
  money: (value: number) => string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_20px_rgba(80,60,35,0.035)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">
          {title}
        </span>

        <div className="rounded-lg bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
          {icon}
        </div>
      </div>

      <h3
        className={`text-2xl font-bold tracking-tight ${
          positive ? "text-[#427445]" : ""
        }`}
      >
        {money(value)}
      </h3>
    </div>
  );
}
