import api from "./api";

export interface VehicleResponse {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
}

export interface CustomerResponse {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  vehicles: VehicleResponse[];
}

export interface SalesInvoiceSummaryResponse {
  id: number;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
}

export interface ServiceHistoryResponse {
  id: number;
  appointmentDate: string;
  status: string;
  notes: string;
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
}

export interface CustomerHistoryResponse {
  customer: CustomerResponse;
  salesInvoices: SalesInvoiceSummaryResponse[];
  serviceHistory: ServiceHistoryResponse[];
  totalSpent: number;
  totalInvoices: number;
  totalServices: number;
}

export interface CreateCustomerWithVehicleRequestDTO {
  username: string;
  email: string;
  passwordHash: string; // The backend parameter is literally called 'PasswordHash'
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
}

const customerService = {
  register: async (data: CreateCustomerWithVehicleRequestDTO) => {
    const response = await api.post<CustomerResponse>("/Customer/register", data);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<CustomerResponse>(`/Customer/${id}`);
    return response.data;
  },

  getHistory: async (id: number) => {
    const response = await api.get<CustomerHistoryResponse>(`/Customer/${id}/history`);
    return response.data;
  },

  search: async (
    query?: string,
    searchType = "All",
    status = "All",
    sortBy = "Name"
  ) => {
    const response = await api.get<CustomerResponse[]>("/Customer/search", {
      params: { query, searchType, status, sortBy },
    });
    return response.data;
  },
};

export default customerService;
