import api from "./api";

export interface RevenueTransactionDto {
  invoiceId: number;
  invoiceNumber: string;
  date: string;
  customerName: string;
  amount: number;
  isPaid: boolean;
}

export interface PopularPartDto {
  partId: number;
  name: string;
  sku: string;
  quantitySold: number;
  revenueGenerated: number;
}

export interface FinancialReportResponse {
  totalRevenue: number;
  totalSalesCount: number;
  totalPartsSold: number;
  netProfit: number;
  transactions: RevenueTransactionDto[];
  popularParts: PopularPartDto[];
}

export interface RegularCustomerDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  purchaseCount: number;
}

export interface HighSpenderCustomerDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
}

export interface PendingCreditCustomerDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  pendingBalance: number;
  unpaidInvoiceCount: number;
}

export interface CustomerReportResponse {
  regulars: RegularCustomerDto[];
  highSpenders: HighSpenderCustomerDto[];
  pendingCredits: PendingCreditCustomerDto[];
}

const reportService = {
  getFinancialReport: async (type = "daily", targetDate?: string) => {
    const response = await api.get<FinancialReportResponse>("/staff/Report/financial", {
      params: { type, targetDate },
    });
    return response.data;
  },

  getCustomerReport: async () => {
    const response = await api.get<CustomerReportResponse>("/staff/Report/customers");
    return response.data;
  },
};

export default reportService;
