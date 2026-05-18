import api from "./api";

export interface VendorResponse {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface CreateVendorRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

const vendorService = {
  getAll: async () => {
    const response = await api.get<VendorResponse[]>("/Vendor");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<VendorResponse>(`/Vendor/${id}`);
    return response.data;
  },

  create: async (data: CreateVendorRequest) => {
    const response = await api.post<VendorResponse>("/Vendor", data);
    return response.data;
  },
};

export default vendorService;
