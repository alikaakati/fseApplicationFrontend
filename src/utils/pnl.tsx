// src/utils/pnl.ts

// Individual leaf line item in a P&L category
export interface PnlLineItem {
  name: string;
  value: number; // positive for income, negative for cost if you prefer; up to you
}

// Group (e.g., Revenue, Expenses)
export interface PnlCategory {
  key: string; // machine key ("revenue", "expenses")
  label: string; // display label ("Revenue")
  details: PnlLineItem[];
  total?: number; // optional; will be computed if omitted
}

// Period block (start/end range)
export interface PnlPeriod {
  id: string; // unique (e.g., "2020-01", UUID, etc.)
  startDate: string; // ISO "YYYY-MM-DD"
  endDate: string; // ISO "YYYY-MM-DD"
  categories: PnlCategory[];
}

// Compute total if not provided
export const categoryTotal = (cat: PnlCategory): number =>
  typeof cat.total === "number"
    ? cat.total
    : cat.details.reduce((sum, i) => sum + i.value, 0);

// Find period by id (fallback to first)
export const getSelectedPeriod = (
  periods: PnlPeriod[],
  selectedId?: string
): PnlPeriod | undefined => {
  if (!periods.length) return undefined;
  if (!selectedId) return periods[0];
  return periods.find((p) => p.id === selectedId) ?? periods[0];
};

// Format currency (tweak locale/currency as needed)
export const fmtMoney = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
