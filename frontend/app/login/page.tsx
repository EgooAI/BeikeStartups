'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  UserOutlined,
  LockOutlined,
  ThunderboltOutlined,
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
    <div className="min-h-screen bg-[#050510] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative cyberpunk gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00f0ff]/5 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-morph-blob" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#b347ea]/5 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-morph-blob-reverse" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-[#ffb800]/[0.04] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float" />
      </div>

      <div className="holo-card p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00f0ff]/20 to-[#b347ea]/20 rounded-2xl mb-4 border border-[#00f0ff]/10">
            <ThunderboltOutlined className="text-3xl text-[#00f0ff]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">欢迎回来</h1>
          <p className="text-gray-400 mt-1">登录贝壳青创汇</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">用户名</label>
            <div className="relative">
              <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40 transition-all placeholder:text-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">密码</label>
            <div className="relative">
              <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/10 focus:border-[#00f0ff]/40 transition-all placeholder:text-gray-600 text-white"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl hover:from-[#00d4e0] hover:to-[#00a8e0] shadow-[0_2px_12px_rgba(0,240,255,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-sm text-gray-400">
            还没有账号？{' '}
            <Link href="/register" className="text-[#00f0ff] hover:underline font-medium">
              立即注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
