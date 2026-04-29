import api from "./api";

export interface DashboardStats {
  pendingBalance: number;
  lastInvoiceNumber: string;
  fuelEconomy: number;
  totalMaintenance: number;
  nextServiceDistance: number;
}

export interface Vehicle {
  id: string;
  name: string;
  vin: string;
  status: string;
  engineHealth: string;
  tirePressure: string;
  odometer: string;
  image?: string;
}

export interface Transaction {
  id: string;
  title: string;
  orderId: string;
  date: string;
  price: string;
}

const dashboardService = {
  getStats: async () => {
    const response = await api.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },

  getVehicles: async () => {
    const response = await api.get<Vehicle[]>("/vehicles");
    return response.data;
  },

  getRecentTransactions: async () => {
    const response = await api.get<Transaction[]>("/transactions/recent");
    return response.data;
  },
};

export default dashboardService;
