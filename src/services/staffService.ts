import api from "./api";

export interface StaffResponse {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

export interface RegisterStaffDto {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  position: string;
  role: string;
}

const staffService = {
  getAll: async () => {
    const response = await api.get<StaffResponse[]>("/admin/Staff");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<StaffResponse>(`/admin/Staff/${id}`);
    return response.data;
  },

  register: async (data: RegisterStaffDto) => {
    const response = await api.post<StaffResponse>("/admin/Staff/register", data);
    return response.data;
  },

  updateRole: async (id: number, role: string) => {
    const response = await api.put<{ message: string }>(`/admin/Staff/${id}/role`, { role });
    return response.data;
  },

  deactivate: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/admin/Staff/${id}`);
    return response.data;
  },
};

export default staffService;
