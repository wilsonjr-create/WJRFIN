"use client";
import { translate } from "@/lib/i18n";

import ThemeSelector from "@/components/ThemeSelector";
import TransactionsPage from "@/components/TransactionsPage";
import ContactsPage from "@/components/ContactsPage";
import CashFlowPage from "@/components/CashFlowPage";
import BillsPage from "@/components/BillsPage";
import ReportsPage from "@/components/ReportsPage";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CurrencyTicker from "@/components/CurrencyTicker";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  ReceiptText,
  Users,
  ChartPie,
  Settings,
  Search,
  Bell,
  ChevronDown,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Crown,
  Menu,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const navigationTranslations = {
  en: {
    Dashboard: "Dashboard",
    Transactions: "Transactions",
    "Cash Flow": "Cash Flow",
    Bills: "Bills",
    Contacts: "Contacts",
    Reports: "Reports",
    Settings: "Settings",
  },
  es: {
    Dashboard: "Panel de control",
    Transactions: "Transacciones",
    "Cash Flow": "Flujo de caja",
    Bills: "Facturas",
    Contacts: "Contactos",
    Reports: "Informes",
    Settings: "Configuración",
  },
  "pt-BR": {
    Dashboard: "Painel",
    Transactions: "Transações",
    "Cash Flow": "Fluxo de caixa",
    Bills: "Contas",
    Contacts: "Contatos",
    Reports: "Relatórios",
    Settings: "Configurações",
  },
  "pt-PT": {
    Dashboard: "Painel",
    Transactions: "Transações",
    "Cash Flow": "Fluxo de caixa",
    Bills: "Faturas",
    Contacts: "Contactos",
    Reports: "Relatórios",
    Settings: "Definições",
  },
};

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Transactions", icon: ArrowLeftRight },
  { name: "Cash Flow", icon: ChartNoAxesCombined },
  { name: "Bills", icon: ReceiptText },
  { name: "Contacts", icon: Users },
  { name: "Reports", icon: ChartPie },
  { name: "Settings", icon: Settings },
];



  type FinancialTransaction = {
  id: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
  date: string;
};
export default function Home() {
  const { language } = useLanguage();
  const t = (key: string) => translate(language, key);
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [companyName, setCompanyName] = useState("Loading...");
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyCurrency, setCompanyCurrency] = useState("USD");
  const [financialTransactions, setFinancialTransactions] =
  useState<FinancialTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCurrentDate(new Date()));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  
  useEffect(() => {
    let cancelled = false;

    async function loadCompany() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;


if (authError || !user) {
  setCompanyId(null);
  setCompanyError("Please sign in to access your company.");
  setCompanyName("Company unavailable");
  return;
}


      const { data: membership, error: membershipError } =
        await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

      if (cancelled) return;

     if (membershipError || !membership) {
  setCompanyId(null);
  setCompanyError("No company found for this account.");
  setCompanyName("Company unavailable");
  return;
}

      const { data: company, error: companyFetchError } =
        await supabase
          .from("companies")
          .select("name, logo_path, primary_currency")
          .eq("id", membership.company_id)
          .single();

      if (cancelled) return;

     if (companyFetchError || !company) {
  setCompanyId(null);
  setCompanyError("Unable to load company information.");
  setCompanyName("Company unavailable");
  return;
}
if (company.logo_path) {
  const { data: logoData, error: logoError } =
    await supabase.storage
      .from("company-logos")
      .createSignedUrl(company.logo_path, 60 * 60);

  if (cancelled) return;

  setCompanyLogoUrl(
    logoError ? null : logoData?.signedUrl ?? null
  );
} else {
  setCompanyLogoUrl(null);
}
     setCompanyId(membership.company_id);
setCompanyName(company.name);
setCompanyCurrency(company.primary_currency);
setCompanyError("");
    }

    void loadCompany();

    return () => {
      cancelled = true;
    };
  }, []);
useEffect(() => {
  let cancelled = false;

  async function loadTransactions() {
    if (!companyId) {
      setFinancialTransactions([]);
      setTransactionsLoading(false);
      return;
    }

    setTransactionsLoading(true);
    setTransactionsError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select("id, description, category, type, amount, date")
      .eq("company_id", companyId)
      .order("date", { ascending: false });

    if (cancelled) return;

    if (error) {
      setFinancialTransactions([]);
      setTransactionsError(error.message);
    } else {
      setFinancialTransactions(
        (data ?? []).map((item) => ({
          id: item.id,
          description: item.description,
          category: item.category,
          type: item.type as "Income" | "Expense",
          amount: Number(item.amount),
          date: item.date,
        }))
      );
    }

    setTransactionsLoading(false);
  }

  void loadTransactions();

  return () => {
    cancelled = true;
  };
}, [companyId]);
const totalRevenue = financialTransactions
  .filter((transaction) => transaction.type === "Income")
  .reduce((total, transaction) => total + transaction.amount, 0);

const totalExpenses = financialTransactions
  .filter((transaction) => transaction.type === "Expense")
  .reduce((total, transaction) => total + transaction.amount, 0);

const netProfit = totalRevenue - totalExpenses;
const availableBalance = netProfit;
const profitMargin =
  totalRevenue > 0
    ? Math.max(0, Math.min(100, (netProfit / totalRevenue) * 100))
    : 0;
const formatCompanyMoney = (value: number) =>
  new Intl.NumberFormat(
    companyCurrency === "BRL" ? "pt-BR" : "en-US",
    {
      style: "currency",
      currency: companyCurrency,
    }
  ).format(value);
  const realCashFlow = Array.from({ length: 6 }, (_, index) => {
  const monthDate = currentDate
    ? new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 5 + index,
        1
      )
    : new Date(2000, index, 1);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const monthlyTransactions = financialTransactions.filter(
    (transaction) => {
      const [transactionYear, transactionMonth] =
        transaction.date.split("-").map(Number);

      return transactionYear === year && transactionMonth === month + 1;
    }
  );

  return {
    month: monthDate.toLocaleDateString(language, {
      month: "short",
      year: "2-digit",
    }),
    revenue: monthlyTransactions
      .filter((transaction) => transaction.type === "Income")
      .reduce((total, transaction) => total + transaction.amount, 0),
    expenses: monthlyTransactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce((total, transaction) => total + transaction.amount, 0),
  };
});

const metricTranslations = {
  en: {
    revenue: "Total Revenue",
    expenses: "Total Expenses",
    profit: "Net Profit",
    balance: "Available Balance",
  },
  es: {
    revenue: "Ingresos totales",
    expenses: "Gastos totales",
    profit: "Beneficio neto",
    balance: "Saldo disponible",
  },
  "pt-BR": {
    revenue: "Receita total",
    expenses: "Despesas totais",
    profit: "Lucro líquido",
    balance: "Saldo disponível",
  },
  "pt-PT": {
    revenue: "Receita total",
    expenses: "Despesas totais",
    profit: "Lucro líquido",
    balance: "Saldo disponível",
  },
};

const chartTranslations = {
  en: { revenue: "Revenue", expenses: "Expenses", margin: "Profit Margin", profit: "Net Profit", explanation: "Net profit as a percentage of revenue" },
  es: { revenue: "Ingresos", expenses: "Gastos", margin: "Margen de beneficio", profit: "Beneficio neto", explanation: "Beneficio neto como porcentaje de los ingresos" },
  "pt-BR": { revenue: "Receitas", expenses: "Despesas", margin: "Margem de lucro", profit: "Lucro líquido", explanation: "Lucro líquido como percentual da receita" },
  "pt-PT": { revenue: "Receitas", expenses: "Despesas", margin: "Margem de lucro", profit: "Lucro líquido", explanation: "Lucro líquido em percentagem da receita" },
} as const;
const chartLabels = chartTranslations[language];

const metricLabels = metricTranslations[language];

const realMetrics = [
  {
    title: metricLabels.revenue,
    value: formatCompanyMoney(totalRevenue),
    change: null,
    positive: true,
    icon: ArrowUpRight,
  },
  {
    title: metricLabels.expenses,
    value: formatCompanyMoney(totalExpenses),
    change: null,
    positive: true,
    icon: ArrowDownRight,
  },
  {
    title: metricLabels.profit,
    value: formatCompanyMoney(netProfit),
    change: null,
    positive: netProfit >= 0,
    icon: ChartNoAxesCombined,
  },
  {
    title: metricLabels.balance,
    value: formatCompanyMoney(availableBalance),
    change: null,
    positive: availableBalance >= 0,
    icon: Wallet,
  },
];
  const filteredTransactions = financialTransactions
  .filter((transaction) =>
    `${transaction.description} ${transaction.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-65 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] p-6 transition-transform lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-12 flex items-center justify-between">
           <div className="flex min-h-12 items-center">
 {companyLogoUrl ? (
  <div className="flex items-center gap-3">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#B48B4E]/50 bg-[#22262D] p-1.5 shadow-sm">
      <img
        src={companyLogoUrl}
        alt={`${companyName} logo`}
        className="h-full w-full rounded-xl object-contain"
      />
    </div>

    <div className="min-w-0">
      <p className="truncate text-sm font-semibold tracking-wide text-[var(--text-primary)]">
        {companyName}
      </p>
      <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        {t("Business Workspace")}
      </p>
    </div>
  </div>
  ) : (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">
        WJR<span className="text-[var(--primary)]">FIN</span>
      </h1>
      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
        {t("Business Finance")}
      </p>
    </div>
  )}
</div>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--primary-soft)]"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {navigationTranslations[language][
  item.name as keyof typeof navigationTranslations.en
]}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)] p-5">
            <Crown className="mb-3 text-[var(--primary)]" size={25} />
            <h3 className="font-bold">WJRFIN Pro</h3>
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
              {t("Unlock advanced financial reports and team management.")}
            </p>
            <button className="mt-4 w-full rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              {t("Coming Soon")}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 lg:ml-65">
          <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--sidebar)]/80 px-5 py-5 md:px-9">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={23} />
              </button>

              <span className="text-sm text-[var(--text-secondary)]">
                {t("Business Overview")}
              </span>
            </div>

            <div className="flex items-center gap-4">
            
              <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 md:flex">
                <Search size={16} className="text-[var(--text-secondary)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Search transactions...")}
                  className="w-48 bg-transparent text-xs outline-none"
                />
              </div>

              <Bell size={19} className="text-[var(--text-secondary)]" />

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                WJ
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] p-5 md:p-9">
            {activePage === "Dashboard" ? (
              <>
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 text-sm text-[var(--text-secondary)]">
  {t("Hello,")}
</p>
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                      {companyName}{" "}
<span className="text-[var(--primary)]">✦</span> 
                    </h2>
                    {companyError && (
  <p className="mt-2 text-sm text-red-500" role="alert">
    {companyError}
  </p>
)}
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      
                    </p>
                  </div>

                 <div className="flex flex-wrap items-center justify-end gap-6">
  <CurrencyTicker />

  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs">
    <CalendarDays size={16} className="text-[var(--primary)]" />
    {currentDate ? new Intl.DateTimeFormat(language, {month: "short", year: "numeric"}).format(currentDate) : "—"}
    <ChevronDown size={15} />
  </div>
</div>
                </div>

                {/* Financial metrics */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {realMetrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                      <div
                        key={metric.title}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_20px_rgba(80,60,35,0.035)]"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <span className="text-xs text-[var(--text-secondary)]">
                            {metric.title}
                          </span>
                          <div className="rounded-lg bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
                            <Icon size={19} />
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold tracking-tight">
                          {metric.value}
                        </h3>

                        {metric.change && (
                          <p className="mt-3 text-xs text-[var(--text-secondary)]">
                            <span
                              className={`mr-2 rounded-full px-2 py-1 ${
                                metric.positive
                                  ? "bg-[#EAF3E7] text-[#427445]"
                                  : "bg-[#FBE9E5] text-[#A54B3B]"
                              }`}
                            >
                              {metric.change}
                            </span>
                            {t("vs. previous period")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Charts */}
                <div className="mb-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                  <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                    <h3 className="mb-7 text-lg font-bold">
                      {t("Cash Flow Overview")}
                    </h3>

                    <div className="h-75 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={realCashFlow}>
                          <CartesianGrid
                            stroke="var(--border)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                            tickFormatter={(value: number) => value === 0 ? "0" : new Intl.NumberFormat(language, { notation: "compact", maximumFractionDigits: 1 }).format(value)}
                          />
                          <Tooltip
  formatter={(value) =>
    formatCompanyMoney(Number(value ?? 0))
  }
/>
                          <Legend />
                          <Bar
                            name={chartLabels.revenue}
                            dataKey="revenue"
                            fill="var(--chart-primary)"
                            radius={[5, 5, 0, 0]}
                          />
                          <Bar
                            name={chartLabels.expenses}
                            dataKey="expenses"
                            fill="var(--chart-secondary)"
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                    <h3 className="mb-7 text-lg font-bold">
                      {chartLabels.margin}
                    </h3>

                    <div className="flex h-67.5 flex-col items-center justify-center gap-6">
                      <div
                        className="flex h-44 w-44 items-center justify-center rounded-full"
                        style={{
                          background:
                           `conic-gradient(var(--chart-primary) 0% ${profitMargin}%, var(--chart-secondary) ${profitMargin}% 100%)`,
                        }}
                      >
                        <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[var(--surface)]">
                          <span className="text-3xl font-bold">
  {profitMargin.toFixed(1)}%
</span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {chartLabels.profit}
                          </span>
                        </div>
                      </div>

                      <p className="text-center text-xs text-[var(--text-secondary)]">
                        {chartLabels.explanation}
                      </p>
                    </div>
                  </section>
                </div>

                {/* Transactions */}
                <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
                    <h3 className="text-lg font-bold">
                      {t("Recent Transactions")}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-190 text-left text-sm">
                      <thead className="bg-[var(--sidebar)] text-xs text-[var(--text-secondary)]">
                        <tr>
                          <th className="px-6 py-4 font-medium">{t("Date")}</th>
                          <th className="px-6 py-4 font-medium">
                            {t("Description")}
                          </th>
                          <th className="px-6 py-4 font-medium">
                            {t("Category")}
                          </th>
                          <th className="px-6 py-4 font-medium">{t("Type")}</th>
                          <th className="px-6 py-4 text-right font-medium">
                            {t("Amount")}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredTransactions.map((transaction, index) => (
                          <tr
                            key={index}
                            className="border-t border-[var(--border)]"
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">
                              {new Date(`${transaction.date}T12:00:00`).toLocaleDateString(
  "pt-BR"
)}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 text-[var(--text-secondary)]">
                              {transaction.category}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs ${
                                  transaction.type === "Income"
                                    ? "bg-[#EAF3E7] text-[#427445]"
                                    : "bg-[#FBEAE6] text-[#A54B3B]"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>
                            <td
                              className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${
                               transaction.type === "Income"
  ? "text-[#427445]"
  : "text-[#A54B3B]"
                              }`}
                            >
                              {transaction.type === "Income" ? "+" : "-"}
{formatCompanyMoney(Math.abs(transaction.amount))}
                            </td>
                          </tr>
                        ))}

                        {!transactionsLoading &&
  !transactionsError &&
  filteredTransactions.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-10 text-center text-[var(--text-secondary)]"
                            >
                              {t("No transactions found.")}
                            </td>
                          </tr>
                        )}
                     
                        {(transactionsLoading || transactionsError) && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-10 text-center text-[var(--text-secondary)]"
                            >
                              {transactionsLoading
                                ? "Loading transactions..."
                                : `Unable to load transactions: ${transactionsError}`}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                  </div>
                </section>
              </>
            ) : activePage === "Transactions" ? (
  <TransactionsPage
  companyId={companyId}
  companyCurrency={companyCurrency}
/>
) : activePage === "Cash Flow" ? (
  <CashFlowPage transactions={financialTransactions} companyCurrency={companyCurrency} loading={transactionsLoading} error={transactionsError} />
) : activePage === "Bills" ? (
  <BillsPage companyId={companyId} companyCurrency={companyCurrency} />
) : activePage === "Reports" ? (
  <ReportsPage transactions={financialTransactions} companyCurrency={companyCurrency} loading={transactionsLoading} error={transactionsError} />
) : activePage === "Contacts" ? (
  <ContactsPage />
) : activePage === "Settings" || activePage === "Configurações" ? (
  <ThemeSelector />
) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10">
                <p className="mb-2 text-sm text-[var(--primary)]">
                  {t("WJRFIN Workspace")}
                </p>
                <h2 className="text-3xl font-bold">{navigationTranslations[language][activePage as keyof typeof navigationTranslations.en] ?? activePage}</h2>
                <p className="mt-3 text-[var(--text-secondary)]">
                  {t("This module is coming in the next development phase.")}
                </p>
              </div>
            )}

            <footer className="mt-10 text-center text-xs text-[var(--text-secondary)]">
              © {2026} WJRFIN. {t("Business Financial Intelligence.")}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

