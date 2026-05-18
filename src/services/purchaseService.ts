import api from "./api";

export interface PurchaseInvoiceItemResponse {
  id: number;
  partId: number;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseInvoiceResponse {
  id: number;
  invoiceNumber: string;
  date: string;
  vendorId: number;
  vendorName: string;
  subTotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
  items: PurchaseInvoiceItemResponse[];
}

export interface CreatePurchaseInvoiceItemRequest {
  partId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseInvoiceRequest {
  vendorId: number;
  items: CreatePurchaseInvoiceItemRequest[];
}

const purchaseService = {
  getAll: async () => {
    const response = await api.get<PurchaseInvoiceResponse[]>("/Purchase");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<PurchaseInvoiceResponse>(`/Purchase/${id}`);
    return response.data;
  },

  create: async (data: CreatePurchaseInvoiceRequest) => {
    const response = await api.post<PurchaseInvoiceResponse>("/Purchase", data);
    return response.data;
  },
};

export default purchaseService;
