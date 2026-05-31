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
    <div className="min-h-screen bg-gradient-to-b from-[#f7f3ec] to-[#faf7f2] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#fef3c7]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-morph-blob" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#0a2a5c]/[0.03] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph-blob-reverse" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-[#d4a853]/[0.06] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
      </div>

      <div className="dashboard-panel bg-[#fefcf8] rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] rounded-2xl mb-4 shadow-button">
            <GoldOutlined className="text-3xl text-[#f59e0b]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c]">欢迎回来</h1>
          <p className="text-[#8b7e6a] mt-1">登录贝壳青创汇</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#4a3f2f] mb-2">用户名</label>
            <div className="relative">
              <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c4b99a]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full pl-11 pr-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-colors placeholder:text-[#c4b99a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a3f2f] mb-2">密码</label>
            <div className="relative">
              <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c4b99a]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full pl-11 pr-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-colors placeholder:text-[#c4b99a]"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] text-white rounded-xl hover:from-[#0a2a5c]/90 hover:to-[#1a4a8a]/90 shadow-button hover:-translate-y-0.5 transition-all font-medium disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-sm text-[#8b7e6a]">
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
