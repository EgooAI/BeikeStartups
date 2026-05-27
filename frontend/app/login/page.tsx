'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  UserOutlined,
  LockOutlined,
  GoldOutlined,
} from '@ant-design/icons';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2a5c]/5 via-white to-[#f59e0b]/5 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-custom-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] rounded-2xl mb-4">
            <GoldOutlined className="text-3xl text-[#f59e0b]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a2a5c]">欢迎回来</h1>
          <p className="text-gray-500 mt-1">登录贝壳青创汇</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div className="relative">
              <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div className="relative">
              <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-sm text-gray-500">
            还没有账号？{' '}
            <Link href="/register" className="text-[#f59e0b] hover:underline font-medium">
              立即注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}