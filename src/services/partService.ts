import api from "./api";

export interface PartResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  vendorId: number;
  vendorName: string;
}

export interface CreatePartRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  vendorId: number;
}

export interface UpdatePartRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  vendorId: number;
}

const partService = {
  getAll: async () => {
    const response = await api.get<PartResponse[]>("/Parts");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<PartResponse>(`/Parts/${id}`);
    return response.data;
  },

  create: async (data: CreatePartRequest) => {
    const response = await api.post<PartResponse>("/Parts", data);
    return response.data;
  },

  update: async (id: number, data: UpdatePartRequest) => {
    const response = await api.put<PartResponse>(`/Parts/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/Parts/${id}`);
    return response.data;
  },
};

export default partService;
