'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  GoldOutlined,
} from '@ant-design/icons';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.nickname, form.phone);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2a5c]/5 via-white to-[#f59e0b]/5 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-custom-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] rounded-2xl mb-4">
            <GoldOutlined className="text-3xl text-[#f59e0b]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a2a5c]">创建账号</h1>
          <p className="text-gray-500 mt-1">加入贝壳青创汇，开启创业之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户名 *</label>
            <div className="relative">
              <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="3-50个字符"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱 *</label>
            <div className="relative">
              <MailOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="请输入邮箱"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => updateField('nickname', e.target.value)}
                placeholder="昵称"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
              <div className="relative">
                <PhoneOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="手机号"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">密码 *</label>
            <div className="relative">
              <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="至少6个字符"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">确认密码 *</label>
            <div className="relative">
              <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="再次输入密码"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '注册中...' : '创建账号'}
          </button>

          <p className="text-center text-sm text-gray-500">
            已有账号？{' '}
            <Link href="/login" className="text-[#f59e0b] hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}