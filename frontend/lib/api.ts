// frontend/lib/api.ts
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const text = await response.text();
      let data: any = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const message = data?.message || response.statusText || '请求失败';
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

export const authApi = {
  register: (data: { username: string; email: string; password: string; nickname?: string; phone?: string }) =>
    api.post('/api/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  getCurrentUser: () =>
    api.get('/api/auth/me'),
};

export const applicationApi = {
  list: () =>
    api.get('/api/applications'),
  
  get: (id: number) =>
    api.get(`/api/applications/${id}`),
  
  create: (data: { title: string; description: string; business_plan?: string }) =>
    api.post('/api/applications', data),
  
  update: (id: number, data: { title?: string; description?: string; business_plan?: string }) =>
    api.put(`/api/applications/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/applications/${id}`),
  
  submit: (id: number) =>
    api.post(`/api/applications/${id}/submit`),
  
  approve: (id: number, note: string) =>
    api.post(`/api/applications/${id}/approve`, { note }),
  
  reject: (id: number, note: string) =>
    api.post(`/api/applications/${id}/reject`, { note }),
};

export const teamApi = {
  list: (status?: string) =>
    api.get(`/api/teams${status ? `?status=${status}` : ''}`),
  
  get: (id: number) =>
    api.get(`/api/teams/${id}`),
  
  create: (data: { name: string; description?: string; logo?: string }) =>
    api.post('/api/teams', data),
  
  update: (id: number, data: { name?: string; description?: string; logo?: string }) =>
    api.put(`/api/teams/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/teams/${id}`),
};

export const projectApi = {
  list: (params?: { status?: string; is_public?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.is_public) query.append('is_public', params.is_public);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString();
    return api.get(`/api/projects${queryString ? `?${queryString}` : ''}`);
  },
  
  get: (id: number) =>
    api.get(`/api/projects/${id}`),
  
  create: (data: { title: string; description: string; content?: string; cover_image?: string; is_public?: boolean; tags?: string }) =>
    api.post('/api/projects', data),
  
  update: (id: number, data: { title?: string; description?: string; content?: string; cover_image?: string; is_public?: boolean; tags?: string }) =>
    api.put(`/api/projects/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/projects/${id}`),
  
  requestOnline: (id: number) =>
    api.post(`/api/projects/${id}/request-online`),
  
  approveOnline: (id: number) =>
    api.post(`/api/projects/${id}/approve-online`),
  
  rejectOnline: (id: number) =>
    api.post(`/api/projects/${id}/reject-online`),
  
  requestOffline: (id: number) =>
    api.post(`/api/projects/${id}/request-offline`),
  
  approveOffline: (id: number) =>
    api.post(`/api/projects/${id}/approve-offline`),
  
  rejectOffline: (id: number) =>
    api.post(`/api/projects/${id}/reject-offline`),
  
  invalidate: (id: number) =>
    api.post(`/api/projects/${id}/invalidate`),
};

export const recruitmentApi = {
  list: (status?: string) =>
    api.get(`/api/recruitments${status ? `?status=${status}` : ''}`),
  
  get: (id: number) =>
    api.get(`/api/recruitments/${id}`),
  
  create: (data: { title: string; description: string; requirements?: string; position: string; salary?: string; deadline?: string }) =>
    api.post('/api/recruitments', data),
  
  update: (id: number, data: { title?: string; description?: string; requirements?: string; position?: string; salary?: string; deadline?: string }) =>
    api.put(`/api/recruitments/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/recruitments/${id}`),
  
  solve: (id: number) =>
    api.post(`/api/recruitments/${id}/solve`),
  
  invalidate: (id: number) =>
    api.post(`/api/recruitments/${id}/invalidate`),
};

export const responseApi = {
  create: (data: { recruitment_id: number; cover_letter: string; resume?: string }) =>
    api.post('/api/responses', data),
  
  get: (id: number) =>
    api.get(`/api/responses/${id}`),
  
  update: (id: number, data: { cover_letter?: string; resume?: string }) =>
    api.put(`/api/responses/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/responses/${id}`),
  
  accept: (id: number, note: string) =>
    api.post(`/api/responses/${id}/accept`, { note }),
  
  reject: (id: number, note: string) =>
    api.post(`/api/responses/${id}/reject`, { note }),
  
  invalidate: (id: number) =>
    api.post(`/api/responses/${id}/invalidate`),
};