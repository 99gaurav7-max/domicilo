import api from './api';
import {
  User, Property, Tenant, Payment, Enquiry, Notification,
  ApiResponse, Pagination, OwnerDashboardData, TenantDashboardData, AdminDashboardData
} from '../types';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', { email, password }),
  register: (data: { email: string; phone: string; fullName: string; password: string; role?: string }) =>
    api.post<ApiResponse>('/auth/register', data),
  getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse>('/auth/change-password', { currentPassword, newPassword }),
  deleteAccount: () => api.delete<ApiResponse>('/auth/account'),
  forgotPassword: (email: string) =>
    api.post<ApiResponse>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse>('/auth/reset-password', { token, newPassword }),
};

// Properties
export const propertyApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<ApiResponse<Property[]> & { pagination: Pagination }>('/properties', { params }),
  getById: (id: string) => api.get<ApiResponse<Property>>(`/properties/${id}`),
  createEnquiry: (data: { propertyId: string; roomType: string; name: string; phone: string; email?: string; preferredMoveIn?: string; message?: string }) =>
    api.post<ApiResponse>('/properties/enquiry', data),
};

// Owner
export const ownerApi = {
  getDashboard: () => api.get<ApiResponse<OwnerDashboardData>>('/owner/dashboard'),
  getChartData: (params?: Record<string, any>) =>
    api.get<ApiResponse>('/owner/chart-data', { params }),
  getProperties: (params?: Record<string, any>) =>
    api.get<ApiResponse<Property[]> & { pagination: Pagination }>('/owner/properties', { params }),
  createProperty: (data: any) => api.post<ApiResponse>('/owner/properties', data),
  updateProperty: (id: string, data: any) => api.put<ApiResponse>(`/owner/properties/${id}`, data),
  deleteProperty: (id: string) => api.delete<ApiResponse>(`/owner/properties/${id}`),
  getTenants: (params?: Record<string, any>) =>
    api.get<ApiResponse<Tenant[]> & { pagination: Pagination }>('/owner/tenants', { params }),
  createTenant: (data: { fullName: string; phone: string; email?: string; propertyId: string; roomId: string; rentAmount: number; securityDeposit?: number; leaseStart?: string }) =>
    api.post<ApiResponse>('/owner/tenants', data),
  updateRoom: (id: string, data: any) => api.put<ApiResponse>(`/owner/rooms/${id}`, data),
  bulkUpdateRooms: (roomIds: string[], updates: any) =>
    api.post<ApiResponse>('/owner/rooms/bulk-update', { roomIds, updates }),
  applyFine: (tenantId: string, amount: number, reason: string) =>
    api.post<ApiResponse>('/owner/fines', { tenantId, amount, reason }),
  getLeads: (params?: Record<string, any>) =>
    api.get<ApiResponse<Enquiry[]> & { pagination: Pagination }>('/owner/leads', { params }),
  updateLeadStatus: (id: string, status: string) =>
    api.put<ApiResponse>(`/owner/leads/${id}/status`, { status }),
  createPaymentOrder: (data: { tenantId: string; propertyId: string; amount: number; paymentType: string }) =>
    api.post<ApiResponse>('/owner/payments/create-order', data),
  verifyPayment: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    api.post<ApiResponse>('/owner/payments/verify', data),
  getPayments: (params?: Record<string, any>) =>
    api.get<ApiResponse<Payment[]> & { pagination: Pagination }>('/owner/payments', { params }),
  getNotifications: () => api.get<ApiResponse<Notification[]> & { unreadCount: number }>('/owner/notifications'),
  markNotificationRead: (id: string) => api.put<ApiResponse>(`/owner/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put<ApiResponse>('/owner/notifications/read-all'),
};

// Tenant
export const tenantApi = {
  getDashboard: () => api.get<ApiResponse<TenantDashboardData>>('/tenant/dashboard'),
  getNotifications: () => api.get<ApiResponse<Notification[]> & { unreadCount: number }>('/tenant/notifications'),
  markNotificationRead: (id: string) => api.put<ApiResponse>(`/tenant/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put<ApiResponse>('/tenant/notifications/read-all'),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard'),
  getUsers: (params?: Record<string, any>) =>
    api.get<ApiResponse<User[]> & { pagination: Pagination }>('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put<ApiResponse>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete<ApiResponse>(`/admin/users/${id}`),
  getPayments: (params?: Record<string, any>) =>
    api.get<ApiResponse<Payment[]> & { pagination: Pagination }>('/admin/payments', { params }),
  getNotifications: () => api.get<ApiResponse<Notification[]>>('/admin/notifications'),
  markNotificationRead: (id: string) => api.put<ApiResponse>(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put<ApiResponse>('/admin/notifications/read-all'),
  exportCsv: (type: string) => api.get(`/admin/export?type=${type}`, { responseType: 'blob' }),
  getProperties: (params?: Record<string, any>) =>
    api.get<ApiResponse<Property[]> & { pagination: Pagination }>('/admin/properties', { params }),
};
