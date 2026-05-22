export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: 'admin' | 'owner' | 'tenant';
  isActive?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  location: string;
  city: string;
  state: string;
  pincode?: string;
  images: string[];
  amenities: string[];
  is_active: boolean;
  created_at: string;
  rooms?: Room[];
  owner_name?: string;
  owner_phone?: string;
  vacant_rooms?: number;
  occupied_rooms?: number;
  tenant_count?: number;
}

export interface Room {
  id: string;
  property_id?: string;
  room_number: string;
  room_type: '1RK' | '1BHK' | '2BHK' | '3BHK' | '4BHK';
  rent: number;
  security_deposit?: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  floor_number?: number;
  square_feet?: number;
  description?: string;
}

export interface Tenant {
  id: string;
  user_id: string;
  owner_id: string;
  room_id: string;
  property_id: string;
  lease_start: string;
  lease_end?: string;
  rent_amount: number;
  security_deposit: number;
  is_active: boolean;
  full_name?: string;
  email?: string;
  phone?: string;
  property_name?: string;
  location?: string;
  city?: string;
  room_number?: string;
  room_type?: string;
  room_rent?: number;
  overdue_amount?: number;
  due_amount?: number;
  last_login?: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  property_id: string;
  owner_id: string;
  amount: number;
  payment_type: 'rent' | 'water' | 'electricity' | 'maintenance' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  invoice_number: string;
  due_date: string;
  paid_at?: string;
  tenant_name?: string;
  tenant_phone?: string;
  property_name?: string;
}

export interface Enquiry {
  id: string;
  property_id: string;
  room_type: string;
  name: string;
  phone: string;
  email?: string;
  preferred_move_in?: string;
  message?: string;
  status: 'new' | 'contacted' | 'approved' | 'rejected' | 'converted';
  owner_id?: string;
  property_name?: string;
  location?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  channel: string;
  is_read: boolean;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface OwnerDashboardData {
  kpis: {
    totalRevenue: number;
    monthlyRevenue: number;
    occupancyRate: number;
    pendingDues: number;
    overduePayments: number;
    totalTenants: number;
    totalProperties: number;
    activeLeads: number;
    vacancyCount: number;
  };
  revenueChart: { month: string; revenue: number }[];
}

export interface TenantDashboardData {
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    leaseStart: string;
    leaseEnd?: string;
    rentAmount: number;
    isActive: boolean;
  };
  property: {
    name: string;
    location: string;
    city: string;
    images: string[];
  };
  room: {
    number: string;
    type: string;
    rent: number;
    status: string;
  };
  finances: {
    totalDue: number;
    overdueAmount: number;
    totalFines: number;
    unpaidFines: number;
  };
  payments: Payment[];
  notifications: Notification[];
}

export interface AdminDashboardData {
  kpis: {
    totalOwners: number;
    totalTenants: number;
    totalProperties: number;
    totalRooms: number;
    totalTransactions: number;
    totalRevenue: number;
    pendingVerifications: number;
    overdueAccounts: number;
    totalLeads: number;
    vacancyCount: number;
  };
  recentPayments: Payment[];
  revenueChart: { month: string; revenue: number }[];
}
