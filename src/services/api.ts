import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface PeriodDate {
  id: string;
  startDate: string;
  endDate: string;
  company: {
    id: number;
    name: string;
  };
}

export interface LineItem {
  id: number;
  name: string;
  value: string;
  accountId: number | null;
  itemType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  value: string;
  categoryType: "income" | "expense" | "profit";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lineItems: LineItem[];
}

export interface RefreshResponse {
  success: boolean;
  message?: string;
}

export const apiService = {
  // Fetch all available period dates
  getPeriodDates: async (): Promise<PeriodDate[]> => {
    try {
      const response = await api.get("/data/report-dates");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching period dates:", error);
      throw error;
    }
  },

  // Fetch P&L data for a specific period
  getPnlData: async (periodId: string): Promise<Category[]> => {
    try {
      const response = await api.get(`/data/categories/${periodId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching P&L data:", error);
      throw error;
    }
  },

  // Fetch all P&L data for all periods
  getAllPnlData: async (): Promise<Category[]> => {
    try {
      const response = await api.get("/data/categories");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all P&L data:", error);
      throw error;
    }
  },

  // Refresh data
  refreshData: async (): Promise<RefreshResponse> => {
    try {
      const response = await api.post("/data/refresh");
      return response.data;
    } catch (error) {
      console.error("Error refreshing data:", error);
      throw error;
    }
  },
};

export default apiService;
