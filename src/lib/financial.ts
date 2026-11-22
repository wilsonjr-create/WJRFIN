export type FinancialRecord = { id: string; description: string; category: string; type: "Income" | "Expense"; amount: number; date: string };
export function currency(value: number, code: string, locale: string) {
  const symbols: Record<string, string> = {
    BRL: "R$",
    USD: "US$",
    EUR: "€",
    GBP: "£",
    PYG: "₲",
  };

  const digits = code === "PYG" ? 0 : 2;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

  const symbol = symbols[code] ?? code;

  return `${symbol} ${formatted}`;
}
export function monthly(records: FinancialRecord[], year: number) { return Array.from({length: 12}, (_, month) => { const entries = records.filter(r => { const [y,m] = r.date.split("-").map(Number); return y === year && m === month+1; }); const income = entries.filter(r=>r.type === "Income").reduce((s,r)=>s+r.amount,0); const expense = entries.filter(r=>r.type === "Expense").reduce((s,r)=>s+r.amount,0); return {month, income, expense, net:income-expense}; }); }
export const locales = {en:"en-US", es:"es-ES", "pt-BR":"pt-BR", "pt-PT":"pt-PT"} as const;
