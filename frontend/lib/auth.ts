// frontend/lib/auth.ts
// 认证策略：只存储 token，用户信息通过 /me API 获取
// 不要将 user 对象存储到 localStorage，避免数据不一致

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

export function requireAuth(redirectUrl: string = '/login'): void {
  if (typeof window === 'undefined') return;
  if (!isAuthenticated()) {
    window.location.href = redirectUrl;
  }
}