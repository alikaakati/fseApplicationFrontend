// src/mock/pnlData.ts

import { PnlPeriod } from "./pnl";

export const pnlPeriods: PnlPeriod[] = [
  {
    id: "2020-01",
    startDate: "2020-01-01",
    endDate: "2020-01-31",
    categories: [
      {
        key: "revenue",
        label: "Revenue",
        details: [
          { name: "Product Sales", value: 80000 },
          { name: "Service Income", value: 40000 },
        ],
      },
      {
        key: "expenses",
        label: "Expenses",
        details: [
          { name: "Salaries", value: 40000 },
          { name: "Rent", value: 15000 },
          { name: "Utilities", value: 15000 },
        ],
      },
    ],
  },
  {
    id: "2020-02",
    startDate: "2020-02-01",
    endDate: "2020-02-29",
    categories: [
      {
        key: "revenue",
        label: "Revenue",
        details: [
          { name: "Product Sales", value: 60000 },
          { name: "Service Income", value: 30000 },
          { name: "Recurring Subscriptions", value: 10000 },
        ],
      },
      {
        key: "expenses",
        label: "Expenses",
        details: [
          { name: "Salaries", value: 42000 },
          { name: "Rent", value: 15000 },
          { name: "Utilities", value: 16000 },
        ],
      },
      {
        key: "other_income",
        label: "Other Income",
        details: [
          { name: "Interest", value: 500 },
          { name: "Misc", value: 250 },
        ],
      },
    ],
  },
];
