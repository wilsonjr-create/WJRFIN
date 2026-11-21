"use client";

import ThemeSelector from "@/components/ThemeSelector";
import TransactionsPage from "@/components/TransactionsPage";
import ContactsPage from "@/components/ContactsPage";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CurrencyTicker from "@/components/CurrencyTicker";
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

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Transactions", icon: ArrowLeftRight },
  { name: "Cash Flow", icon: ChartNoAxesCombined },
  { name: "Bills", icon: ReceiptText },
  { name: "Contacts", icon: Users },
  { name: "Reports", icon: ChartPie },
  { name: "Settings", icon: Settings },
];

const cashFlow = [
  { month: "Jan", revenue: 55000, expenses: 39000 },
  { month: "Feb", revenue: 68000, expenses: 45000 },
  { month: "Mar", revenue: 78000, expenses: 51000 },
  { month: "Apr", revenue: 85000, expenses: 58000 },
  { month: "May", revenue: 96000, expenses: 68000 },
  { month: "Jun", revenue: 112000, expenses: 75000 },
];

const transactions = [
  {
    date: "Jun 20, 2025",
    description: "Client Payment – Acme Ltd.",
    category: "Sales",
    type: "Income",
    amount: 12500,
  },
  {
    date: "Jun 18, 2025",
    description: "Office Rent",
    category: "Facilities",
    type: "Expense",
    amount: -4200,
  },
  {
    date: "Jun 16, 2025",
    description: "Marketing Campaign",
    category: "Marketing",
    type: "Expense",
    amount: -2850,
  },
  {
    date: "Jun 14, 2025",
    description: "Supplier Payment – Global Supply",
    category: "Supplies",
    type: "Expense",
    amount: -6300,
  },
  {
    date: "Jun 12, 2025",
    description: "Service Revenue – Tech Solutions",
    category: "Services",
    type: "Income",
    amount: 18900,
  },
];

const metrics = [
  {
    title: "Total Revenue",
    value: "$124,500.00",
    change: "+12.4%",
    positive: true,
    icon: ArrowUpRight,
  },
  {
    title: "Total Expenses",
    value: "$72,340.00",
    change: "-5.8%",
    positive: true,
    icon: ArrowDownRight,
  },
  {
    title: "Net Profit",
    value: "$52,160.00",
    change: "+28.1%",
    positive: true,
    icon: ChartNoAxesCombined,
  },
  {
    title: "Available Balance",
    value: "$89,750.00",
    change: null,
    positive: true,
    icon: Wallet,
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [companyName, setCompanyName] = useState("Loading...");
  const [companyError, setCompanyError] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
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
          .select("name")
          .eq("id", membership.company_id)
          .single();

      if (cancelled) return;

     if (companyFetchError || !company) {
  setCompanyId(null);
  setCompanyError("Unable to load company information.");
  setCompanyName("Company unavailable");
  return;
}

     setCompanyId(membership.company_id);
setCompanyName(company.name);
setCompanyError("");
    }

    void loadCompany();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTransactions = transactions.filter((transaction) =>
    `${transaction.description} ${transaction.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                WJR<span className="text-[var(--primary)]">FIN</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Business Finance
              </p>
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
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)] p-5">
            <Crown className="mb-3 text-[var(--primary)]" size={25} />
            <h3 className="font-bold">WJRFIN Pro</h3>
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
              Unlock advanced financial reports and team management.
            </p>
            <button className="mt-4 w-full rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              Coming Soon
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
                Business Overview
              </span>
            </div>

            <div className="flex items-center gap-4">
            
              <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 md:flex">
                <Search size={16} className="text-[var(--text-secondary)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions..."
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
  Hello,
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
                      Demo dashboard · Sample financial data
                    </p>
                  </div>

                 <div className="flex flex-wrap items-center justify-end gap-6">
  <CurrencyTicker />

  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs">
    <CalendarDays size={16} className="text-[var(--primary)]" />
    Jan – Jun 2025
    <ChevronDown size={15} />
  </div>
</div>
                </div>

                {/* Financial metrics */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric) => {
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
                            vs. previous period
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
                      Cash Flow Overview
                    </h3>

                    <div className="h-75 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlow}>
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
                            tickFormatter={(value) => `${value / 1000}k`}
                          />
                          <Tooltip
                            formatter={(value) =>
                              money(Number(value ?? 0))
                            }
                          />
                          <Legend />
                          <Bar
                            name="Revenue"
                            dataKey="revenue"
                            fill="var(--chart-primary)"
                            radius={[5, 5, 0, 0]}
                          />
                          <Bar
                            name="Expenses"
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
                      Profit Margin
                    </h3>

                    <div className="flex h-67.5 flex-col items-center justify-center gap-6">
                      <div
                        className="flex h-44 w-44 items-center justify-center rounded-full"
                        style={{
                          background:
                            "conic-gradient(var(--chart-primary) 0% 41.9%, var(--chart-secondary) 41.9% 100%)",
                        }}
                      >
                        <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[var(--surface)]">
                          <span className="text-3xl font-bold">41.9%</span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            Net Profit
                          </span>
                        </div>
                      </div>

                      <p className="text-center text-xs text-[var(--text-secondary)]">
                        Net profit as a percentage of revenue
                      </p>
                    </div>
                  </section>
                </div>

                {/* Transactions */}
                <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
                    <h3 className="text-lg font-bold">
                      Recent Transactions
                    </h3>
                    <span className="text-xs text-[var(--primary)]">
                      Demo data
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-190 text-left text-sm">
                      <thead className="bg-[var(--sidebar)] text-xs text-[var(--text-secondary)]">
                        <tr>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">
                            Description
                          </th>
                          <th className="px-6 py-4 font-medium">
                            Category
                          </th>
                          <th className="px-6 py-4 font-medium">Type</th>
                          <th className="px-6 py-4 text-right font-medium">
                            Amount
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
                              {transaction.date}
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
                                transaction.amount >= 0
                                  ? "text-[#427445]"
                                  : "text-[#A54B3B]"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {money(transaction.amount)}
                            </td>
                          </tr>
                        ))}

                        {filteredTransactions.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-10 text-center text-[var(--text-secondary)]"
                            >
                              No transactions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : activePage === "Transactions" ? (
  <TransactionsPage companyId={companyId} />
) : activePage === "Contacts" ? (
  <ContactsPage />
) : activePage === "Settings" || activePage === "Configurações" ? (
  <ThemeSelector />
) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10">
                <p className="mb-2 text-sm text-[var(--primary)]">
                  WJRFIN Workspace
                </p>
                <h2 className="text-3xl font-bold">{activePage}</h2>
                <p className="mt-3 text-[var(--text-secondary)]">
                  This module is coming in the next development phase.
                </p>
              </div>
            )}

            <footer className="mt-10 text-center text-xs text-[var(--text-secondary)]">
              © {2026} WJRFIN. Business Financial
              Intelligence.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

