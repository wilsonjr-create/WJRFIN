"use client";
import { currency, locales } from "@/lib/financial";
import { translate } from "@/lib/i18n";
import Image from "next/image";
import { useRouter } from "next/navigation";

import ThemeSelector from "@/components/ThemeSelector";
import CompanyLogoSettings from "@/components/CompanyLogoSettings";
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
  UserRound,
  Building2,
  LogOut,
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

const profileTranslations = {
  en: { profile: "My Profile", company: "My Company", settings: "Settings", logout: "Sign out", account: "Account", companyDetails: "Company information", email: "Email", name: "Name", currency: "Primary currency", loading: "Loading...", error: "Unable to sign out. Please try again." },
  es: { profile: "Mi perfil", company: "Mi empresa", settings: "Configuración", logout: "Cerrar sesión", account: "Cuenta", companyDetails: "Información de la empresa", email: "Correo electrónico", name: "Nombre", currency: "Moneda principal", loading: "Cargando...", error: "No se pudo cerrar sesión. Inténtalo de nuevo." },
  "pt-BR": { profile: "Meu perfil", company: "Minha empresa", settings: "Configurações", logout: "Sair", account: "Conta", companyDetails: "Informações da empresa", email: "E-mail", name: "Nome", currency: "Moeda principal", loading: "Carregando...", error: "Não foi possível sair. Tente novamente." },
  "pt-PT": { profile: "O meu perfil", company: "A minha empresa", settings: "Definições", logout: "Terminar sessão", account: "Conta", companyDetails: "Informações da empresa", email: "E-mail", name: "Nome", currency: "Moeda principal", loading: "A carregar...", error: "Não foi possível terminar a sessão. Tente novamente." },
} as const;

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
type UserCompany = {
  id: string;
  name: string;
  primary_currency: string;
  logo_path: string | null;
  role: string;
};

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = (key: string) => translate(language, key);
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountName, setAccountName] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const profileLabels = profileTranslations[language];

  const [companyName, setCompanyName] = useState("Loading...");
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [companyLogoPath, setCompanyLogoPath] = useState<string | null>(null);
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);
  const [companyError, setCompanyError] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<UserCompany[]>([]);
  const [companyCurrency, setCompanyCurrency] = useState("USD");

  async function switchCompany(nextCompanyId: string) {
    const selected = availableCompanies.find(
      (company) => company.id === nextCompanyId
    );

    if (!selected || selected.id === companyId) return;

    setCompanyError("");
    setCompanyId(null);
    setFinancialTransactions([]);
    setTransactionsLoading(true);

    setCompanyName(selected.name);
    setCompanyCurrency(selected.primary_currency);
    setCompanyLogoPath(selected.logo_path);
    setCompanyLogoUrl(null);
    setIsCompanyOwner(selected.role.toLowerCase() === "owner");

    if (selected.logo_path) {
      const supabase = createClient();

      const { data, error } = await supabase.storage
        .from("company-logos")
        .createSignedUrl(selected.logo_path, 3600);

      setCompanyLogoUrl(error ? null : data?.signedUrl ?? null);
    }

    setCompanyId(selected.id);

    const { data: { user } } = await createClient().auth.getUser();
    if (user) {
      localStorage.setItem(
        `wjrfin-active-company-${user.id}`,
        selected.id
      );
    }
  }
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
      if (user) {
        setAccountEmail(user.email ?? "");
        const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name;
        setAccountName(typeof displayName === "string" ? displayName : "");
      }

if (authError || !user) {
  setCompanyId(null);
  setCompanyError("Please sign in to access your company.");
  setCompanyName("Company unavailable");
  return;
}


      const { data: memberships, error: membershipError } =
        await supabase
          .from("company_members")
          .select("company_id, role")
          .eq("user_id", user.id)
          .order("company_id");

      if (cancelled) return;

     if (membershipError || !memberships?.length) {
  setCompanyId(null);
  setIsCompanyOwner(false);
  setCompanyError("No company found for this account.");
  setCompanyName("Company unavailable");
  return;
}

      const savedCompanyId = localStorage.getItem(
        `wjrfin-active-company-${user.id}`
      );

      const membership =
        memberships.find(
          (item) => item.company_id === savedCompanyId
        ) ?? memberships[0];

      const { data: companies, error: companiesError } =
        await supabase
          .from("companies")
          .select("id, name, logo_path, primary_currency")
          .in("id", memberships.map((item) => item.company_id));

      if (cancelled) return;

      if (companiesError) {
        setCompanyError("Unable to load companies.");
        return;
      }

      const companyList: UserCompany[] = (companies ?? []).flatMap((item) => {
        const member = memberships.find(
          (entry) => entry.company_id === item.id
        );

        return member
          ? [{
              id: item.id,
              name: item.name,
              logo_path: item.logo_path,
              primary_currency: item.primary_currency,
              role: member.role,
            }]
          : [];
      });

      setAvailableCompanies(companyList);

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
setCompanyLogoPath(company.logo_path ?? null);
setIsCompanyOwner(String(membership.role).toLowerCase() === "owner");
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
    setFinancialTransactions([]);
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
  currency(value, companyCurrency, locales[language]);
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
      <Image
        unoptimized
        width={56}
        height={56}
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

          {/* Company workspace selector */}
          <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)] p-3">
            <div className="mb-2 flex items-center gap-2 px-2">
              <Building2 size={14} className="text-[var(--primary)]" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                {language === "es" ? "Espacio de trabajo" : language === "pt-BR" ? "Área de trabalho" : language === "pt-PT" ? "Espaço de trabalho" : "Workspace"}
              </span>
            </div>

            <select
              aria-label="Select company workspace"
              value={companyId ?? ""}
              disabled={availableCompanies.length <= 1}
              onChange={(event) => { void switchCompany(event.target.value); }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--sidebar)] px-3 py-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--primary)] disabled:cursor-default"
            >
              {availableCompanies.length === 0 && (
                <option value="">Loading...</option>
              )}
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                window.location.assign("/dashboard/new-company");
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--sidebar)]"
            >
              <span className="text-lg leading-none">+</span>
              {language === "es"
                ? "Añadir empresa"
                : language === "pt-BR"
                  ? "Adicionar empresa"
                  : language === "pt-PT"
                    ? "Adicionar empresa"
                    : "Add company"}
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

              <div className="relative">
                <button
                  type="button"
                  aria-label={profileLabels.account}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] p-1 pr-2 hover:bg-[var(--primary-soft)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                    {(accountName || accountEmail || "WJ").slice(0, 2).toUpperCase()}
                  </span>
                  <ChevronDown size={15} className="text-[var(--text-secondary)]" />
                </button>
                {profileMenuOpen && (
                  <>
                    <button type="button" aria-label="Close profile menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setProfileMenuOpen(false)} />
                    <div role="menu" className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                      <div className="border-b border-[var(--border)] px-3 py-3">
                        <p className="truncate text-sm font-semibold">{accountName || profileLabels.account}</p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">{accountEmail}</p>
                      </div>
                      {([
                        { label: profileLabels.profile, page: "Profile", icon: UserRound },
                        { label: profileLabels.company, page: "Company", icon: Building2 },
                        { label: profileLabels.settings, page: "Settings", icon: Settings },
                      ] as const).map(({ label, page, icon: Icon }) => (
                        <button key={page} type="button" role="menuitem" onClick={() => { setActivePage(page); setProfileMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[var(--primary-soft)]">
                          <Icon size={17} />{label}
                        </button>
                      ))}
                      <div className="mt-1 border-t border-[var(--border)] pt-1">
                        <button type="button" role="menuitem" disabled={signingOut} onClick={async () => {
                          setSigningOut(true);
                          setLogoutError("");
                          const { error } = await createClient().auth.signOut();
                          if (error) { setLogoutError(profileLabels.error); setSigningOut(false); return; }
                          router.replace("/login");
                          router.refresh();
                        }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-[var(--primary-soft)] disabled:opacity-50">
                          <LogOut size={17} />{profileLabels.logout}
                        </button>
                        {logoutError && <p role="alert" className="px-3 py-2 text-xs text-red-600">{logoutError}</p>}
                      </div>
                    </div>
                  </>
                )}
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
  <CurrencyTicker companyCurrency={companyCurrency} />

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
            ) : activePage === "Profile" ? (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-bold">{profileLabels.profile}</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><p className="text-xs text-[var(--text-secondary)]">{profileLabels.name}</p><p className="mt-1 font-medium">{accountName || "—"}</p></div>
                  <div><p className="text-xs text-[var(--text-secondary)]">{profileLabels.email}</p><p className="mt-1 break-all font-medium">{accountEmail || "—"}</p></div>
                </div>
              </section>
            ) : activePage === "Company" ? (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-bold">{profileLabels.company}</h2>
                {companyError ? <p role="alert" className="text-sm text-red-600">{companyError}</p> : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div><p className="text-xs text-[var(--text-secondary)]">{profileLabels.name}</p><p className="mt-1 font-medium">{companyName}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">{profileLabels.currency}</p><p className="mt-1 font-medium">{companyCurrency}</p></div>
                  </div>
                )}
              </section>
            ) : activePage === "Transactions" ? (
  <TransactionsPage
  key={companyId ?? "none"}
  companyId={companyId}
  companyCurrency={companyCurrency}
/>
) : activePage === "Cash Flow" ? (
  <CashFlowPage transactions={financialTransactions} companyCurrency={companyCurrency} loading={transactionsLoading} error={transactionsError} />
) : activePage === "Bills" ? (
  <BillsPage key={companyId ?? "none"} companyId={companyId} companyCurrency={companyCurrency} />
) : activePage === "Reports" ? (
  <ReportsPage transactions={financialTransactions} companyCurrency={companyCurrency} loading={transactionsLoading} error={transactionsError} />
) : activePage === "Contacts" ? (
  <ContactsPage key={companyId ?? "none"} companyId={companyId} />
) : activePage === "Settings" || activePage === "Configurações" ? (
  <div className="space-y-6">
    <CompanyLogoSettings key={companyId ?? "none"} companyId={companyId} logoPath={companyLogoPath} logoUrl={companyLogoUrl} isOwner={isCompanyOwner} onLogoChange={(path, url) => { setCompanyLogoPath(path); setCompanyLogoUrl(url); }} />
    <ThemeSelector />
  </div>
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

