import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Company {
  id: number;
  name: string;
}

export interface IncomeDataPoint {
  periodStart: string; // Format: "2024-01-28"
  periodEnd: string; // Format: "2024-01-28"
  income: string; // API returns income as string
}

export interface CompanyIncomeData {
  [companyId: number]: IncomeDataPoint[];
}

export const incomeService = {
  // Fetch all companies
  getCompanies: async (): Promise<Company[]> => {
    try {
      const response = await api.get("/data/companies");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  },

  // Fetch income data for a specific company
  getCompanyIncome: async (companyId: number): Promise<IncomeDataPoint[]> => {
    try {
      const response = await api.get(
        `/data/companies/${companyId}/income-by-year`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching income for company ${companyId}:`, error);
      throw error;
    }
  },

  // Fetch income data for all companies
  getAllCompaniesIncome: async (
    startDate?: string,
    endDate?: string
  ): Promise<CompanyIncomeData> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("/income", { params });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all companies income:", error);
      throw error;
    }
  },

  // Calculate growth rate between two periods
  calculateGrowthRate: (
    currentPeriod: IncomeDataPoint,
    previousPeriod: IncomeDataPoint
  ): number => {
    const currentIncome = parseFloat(currentPeriod.income) || 0;
    const previousIncome = parseFloat(previousPeriod.income) || 0;
    if (previousIncome === 0) return 0;
    return ((currentIncome - previousIncome) / previousIncome) * 100;
  },

  // Calculate average growth rate over multiple periods
  calculateAverageGrowthRate: (incomeData: IncomeDataPoint[]): number => {
    if (incomeData.length < 2) return 0;

    // Sort by periodStart date
    const sortedData = [...incomeData].sort(
      (a, b) =>
        new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    );

    let totalGrowth = 0;
    let growthCount = 0;

    for (let i = 1; i < sortedData.length; i++) {
      const growth = incomeService.calculateGrowthRate(
        sortedData[i],
        sortedData[i - 1]
      );
      totalGrowth += growth;
      growthCount++;
    }

    return growthCount > 0 ? totalGrowth / growthCount : 0;
  },

  // Get the most recent income data point
  getLatestIncome: (incomeData: IncomeDataPoint[]): IncomeDataPoint | null => {
    if (incomeData.length === 0) return null;

    return incomeData.reduce((latest, current) => {
      const latestDate = new Date(latest.periodStart);
      const currentDate = new Date(current.periodStart);
      return currentDate > latestDate ? current : latest;
    });
  },

  // Get the second most recent income data point
  getPreviousIncome: (
    incomeData: IncomeDataPoint[]
  ): IncomeDataPoint | null => {
    if (incomeData.length < 2) return null;

    const sortedData = [...incomeData].sort(
      (a, b) =>
        new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()
    );

    return sortedData[1];
  },

  // Format date for display (e.g., "2024-01-28" -> "Jan 28, 2024")
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  // Get year from period start date
  getYearFromPeriod: (periodStart: string): number => {
    return new Date(periodStart).getFullYear();
  },

  // Group income data by year for chart display
  groupByYear: (incomeData: IncomeDataPoint[]): { [year: number]: number } => {
    const grouped: { [year: number]: number } = {};

    incomeData.forEach((dataPoint) => {
      const year = incomeService.getYearFromPeriod(dataPoint.periodStart);
      const income = parseFloat(dataPoint.income) || 0;
      if (!grouped[year]) {
        grouped[year] = 0;
      }
      grouped[year] += income;
    });

    return grouped;
  },
};
