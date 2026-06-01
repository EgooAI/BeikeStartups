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
      let data: unknown = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const message = (data as { message: string })?.message || response.statusText || '请求失败';
        throw new Error(message);
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      const text = await response.text();
      let data: unknown = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const message = (data as { message: string })?.message || response.statusText || '请求失败';
        throw new Error(message);
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
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

  updateProfile: (data: { nickname?: string; avatar?: string; phone?: string; email?: string }) =>
    api.put('/api/auth/me', data),

  deleteAccount: () =>
    api.delete('/api/auth/me'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/api/auth/change-password', data),
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

  getMyMembers: () =>
    api.get('/api/teams/my/members'),

  create: (data: { name: string; description?: string; logo?: string }) =>
    api.post('/api/teams', data),

  update: (id: number, data: { name?: string; description?: string; logo?: string }) =>
    api.put(`/api/teams/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/teams/${id}`),

  leave: (id: number) =>
    api.post(`/api/teams/${id}/leave`),
};

export const projectApi = {
  list: (params?: { status?: string; is_public?: string; search?: string; stage?: string; tag?: string; industry?: string; page?: number; limit?: number; sort?: string; order?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.is_public) query.append('is_public', params.is_public);
    if (params?.search) query.append('search', params.search);
    if (params?.stage) query.append('stage', params.stage);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.industry) query.append('industry', params.industry);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.order) query.append('order', params.order);
    const queryString = query.toString();
    return api.get(`/api/projects${queryString ? `?${queryString}` : ''}`);
  },

  get: (id: number) =>
    api.get(`/api/projects/${id}`),

  create: (data: { title: string; description: string; content?: string; cover_image?: string; is_public?: boolean; tags?: string; industry?: string; stage?: string }) =>
    api.post('/api/projects', data),

  update: (id: number, data: { title?: string; description?: string; content?: string; cover_image?: string; is_public?: boolean; tags?: string; industry?: string; stage?: string }) =>
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

export const uploadApi = {
  upload: (file: File) => api.uploadFile<{ url: string }>('/api/uploads', file),
};

export const recruitmentApi = {
  list: (status?: string, myRecruitments?: boolean) => {
    let url = '/api/recruitments';
    const params: string[] = [];
    if (status) params.push(`status=${status}`);
    if (myRecruitments) params.push('my=true');
    if (params.length > 0) url += `?${params.join('&')}`;
    return api.get(url);
  },

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

  apply: (id: number, data: { cover_letter: string; resume?: string }) =>
    api.post(`/api/recruitments/${id}/apply`, data),

  getResponses: (id: number) =>
    api.get(`/api/recruitments/${id}/responses`),

  acceptResponse: (id: number, responseId: number) =>
    api.post(`/api/recruitments/${id}/responses/${responseId}/accept`),

  rejectResponse: (id: number, responseId: number) =>
    api.post(`/api/recruitments/${id}/responses/${responseId}/reject`),

  getMyApplications: () =>
    api.get('/api/responses/my'),
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

export const eventApi = {
  list: (status?: string) =>
    api.get(`/api/events${status ? `?status=${status}` : ''}`),

  get: (id: number) =>
    api.get(`/api/events/${id}`),

  create: (data: { title: string; description: string; event_type: string; location: string; start_at: string; end_at: string; status: string }) =>
    api.post('/api/events', data),

  update: (id: number, data: { title?: string; description?: string; event_type?: string; location?: string; start_at?: string; end_at?: string; status?: string }) =>
    api.put(`/api/events/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/events/${id}`),

  signup: (id: number) =>
    api.post(`/api/events/${id}/signup`),

  cancelSignup: (id: number) =>
    api.delete(`/api/events/${id}/signup`),

  getMySignup: (id: number) =>
    api.get(`/api/events/${id}/signup`),

  getSignups: (id: number) =>
    api.get(`/api/events/${id}/signups`),

  confirmSignup: (signupId: number) =>
    api.post(`/api/events/signups/${signupId}/confirm`),
};

export const bannerApi = {
  list: () =>
    api.get('/api/banners'),

  listAll: () =>
    api.get('/api/banners/all'),

  get: (id: number) =>
    api.get(`/api/banners/${id}`),

  create: (data: { title: string; image_url: string; link_url?: string; status?: string }) =>
    api.post('/api/banners', data),

  update: (id: number, data: { title?: string; image_url?: string; link_url?: string; status?: string }) =>
    api.put(`/api/banners/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/banners/${id}`),
};

export const resourceApi = {
  list: (params?: { status?: string; resource_type?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.resource_type) query.append('resource_type', params.resource_type);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get(`/api/resources${qs ? `?${qs}` : ''}`);
  },

  get: (id: number) =>
    api.get(`/api/resources/${id}`),

  create: (data: { title: string; description: string; resource_type: string; tags?: string; contact: string }) =>
    api.post('/api/resources', data),

  update: (id: number, data: { title?: string; description?: string; resource_type?: string; tags?: string; contact?: string }) =>
    api.put(`/api/resources/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/resources/${id}`),
};

export const roleApi = {
  request: (data: { requested_role: string; organization?: string; expertise?: string; investment_focus?: string; service_area?: string; application_note?: string }) =>
    api.post('/api/auth/role-request', data),

  listRequests: () =>
    api.get('/api/auth/role-requests'),

  approve: (id: number) =>
    api.post(`/api/auth/role-requests/${id}/approve`),

  reject: (id: number) =>
    api.post(`/api/auth/role-requests/${id}/reject`),

  deleteRequest: (id: number) =>
    api.delete(`/api/auth/role-requests/${id}`),
};

export const adminApi = {
  listUsers: () =>
    api.get('/api/admin/users'),

  updateUserActive: (id: number, isActive: boolean) =>
    api.put(`/api/admin/users/${id}/active`, { is_active: isActive }),

  updateUserRole: (id: number, role: string) =>
    api.put(`/api/admin/users/${id}/role`, { role }),
};

export const superAdminApi = {
  listAdmins: () =>
    api.get('/api/admin/admins'),

  promoteToAdmin: (userId: number) =>
    api.post('/api/admin/admins/promote', { user_id: userId }),

  demoteAdmin: (userId: number) =>
    api.post('/api/admin/admins/demote', { user_id: userId }),
};

export const connectionApi = {
  create: (projectId: number, data: { request_type: string; message?: string }) =>
    api.post(`/api/projects/${projectId}/connection-requests`, data),

  list: (projectId: number) =>
    api.get(`/api/projects/${projectId}/connection-requests`),

  accept: (projectId: number, requestId: number) =>
    api.post(`/api/projects/${projectId}/connection-requests/${requestId}/accept`),

  reject: (projectId: number, requestId: number) =>
    api.post(`/api/projects/${projectId}/connection-requests/${requestId}/reject`),

  getMyConnectedProjects: () =>
    api.get('/api/projects/my-connections'),
};