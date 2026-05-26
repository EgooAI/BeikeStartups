// frontend/lib/auth.ts
// 注意：认证功能已在 context/AuthContext.tsx 中实现
// 此文件可用于额外的认证相关工具函数

import { User } from '@/types';

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function requireAuth(redirectUrl: string = '/login'): void {
  if (typeof window === 'undefined') return;
  if (!isAuthenticated()) {
    window.location.href = redirectUrl;
  }
}