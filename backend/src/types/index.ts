import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  phone: string;
  role: 'admin' | 'owner' | 'tenant' | 'other';
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
