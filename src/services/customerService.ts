import api from "./api";

export interface VehicleResponse {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  image?: string;
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

  bookAppointment: async (
    customerId: number,
    data: { appointmentDate: string; vehicleId: number; notes?: string }
  ) => {
    const response = await api.post<{ message: string }>(`/Appointment/${customerId}`, data);
    return response.data;
  },

  submitPartRequest: async (
    customerId: number,
    data: { partName: string; partId?: number; quantity: number; vehicleId?: number }
  ) => {
    const response = await api.post<{ message: string }>(`/PartRequest/${customerId}`, data);
    return response.data;
  },

  submitReview: async (
    customerId: number,
    data: { rating: number; comment?: string; partId?: number }
  ) => {
    const response = await api.post<{ message: string }>(`/Review/${customerId}`, data);
    return response.data;
  },

  addVehicle: async (customerId: number, data: Omit<VehicleResponse, "id">) => {
    const response = await api.post<VehicleResponse>(`/Customer/${customerId}/vehicles`, data);
    return response.data;
  },

  updateVehicle: async (
    customerId: number,
    vehicleId: number,
    data: Omit<VehicleResponse, "id">
  ) => {
    const response = await api.put<VehicleResponse>(`/Customer/${customerId}/vehicles/${vehicleId}`, data);
    return response.data;
  },

  deleteVehicle: async (customerId: number, vehicleId: number) => {
    const response = await api.delete<{ message: string }>(`/Customer/${customerId}/vehicles/${vehicleId}`);
    return response.data;
  },

  updateCustomer: async (
    customerId: number,
    data: { firstName: string; lastName: string; phone: string; address: string }
  ) => {
    const response = await api.put<CustomerResponse>(`/Customer/${customerId}`, data);
    return response.data;
  },
};

export default customerService;
