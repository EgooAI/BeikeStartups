// frontend/app/teams/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { teamApi } from '@/lib/api';
import { TeamOutlined } from '@ant-design/icons';

export default function CreateTeamPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await teamApi.create(formData);
      router.push('/teams');
    } catch (err: any) {
      setError(err.message || '创建团队失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050510]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/20 border-t-[#00f0ff] animate-spin" />
          <div className="absolute inset-[6px] rounded-full border-2 border-[#b347ea]/20 border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
        <p className="text-gray-500 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00f0ff] to-[#00c8ff] rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <TeamOutlined className="text-xl text-[#050510]" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">创建团队</h1>
              <p className="mt-1 text-gray-400">组建您的创业团队</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="holo-card p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              团队名称 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all text-white placeholder:text-gray-500"
              placeholder="输入团队名称"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              团队描述
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all resize-none text-white placeholder:text-gray-500"
              placeholder="描述您的团队"
            />
          </div>

          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-2">
              团队Logo URL
            </label>
            <input
              type="text"
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-[#00f0ff]/20 focus:border-[#00f0ff]/40 transition-all text-white placeholder:text-gray-500"
              placeholder="输入Logo图片URL（可选）"
            />
          </div>

          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#050510] border-t-transparent" />
                  创建中...
                </span>
              ) : '创建团队'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-white/10 rounded-xl text-white hover:bg-white/[0.03] hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
