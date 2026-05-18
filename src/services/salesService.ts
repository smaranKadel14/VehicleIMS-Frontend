import api from "./api";

export interface SalesInvoiceItemResponse {
  id: number;
  partId: number;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesInvoiceResponse {
  id: number;
  invoiceNumber: string;
  date: string;
  customerId: number;
  customerName: string;
  subTotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
  isPaid: boolean;
  items: SalesInvoiceItemResponse[];
}

export interface CreateSalesInvoiceItemRequest {
  partId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesInvoiceRequest {
  customerId: number;
  isPaid?: boolean;
  items: CreateSalesInvoiceItemRequest[];
}

export interface SendInvoiceEmailRequest {
  recipientEmail?: string;
  subject?: string;
  message?: string;
}

export interface SendInvoiceEmailResponse {
  message: string;
  sentTo: string;
  invoiceNumber: string;
}

const salesService = {
  getAll: async () => {
    const response = await api.get<SalesInvoiceResponse[]>("/Sales");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<SalesInvoiceResponse>(`/Sales/${id}`);
    return response.data;
  },

  create: async (data: CreateSalesInvoiceRequest) => {
    const response = await api.post<SalesInvoiceResponse>("/Sales", data);
    return response.data;
  },

  getByCustomerId: async (customerId: number) => {
    const response = await api.get<SalesInvoiceResponse[]>(`/Sales/customer/${customerId}`);
    return response.data;
  },

  sendEmail: async (id: number, data: SendInvoiceEmailRequest) => {
    const response = await api.post<SendInvoiceEmailResponse>(`/Sales/${id}/send-email`, data);
    return response.data;
  },
};

export default salesService;
