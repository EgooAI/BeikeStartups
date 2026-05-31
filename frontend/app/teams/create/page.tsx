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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#f7f3ec] to-[#faf7f2]">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-accent/30 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec]/50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
              <TeamOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary">创建团队</h1>
              <p className="mt-1 text-gray-500">组建您的创业团队</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-panel p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="输入团队名称"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              团队描述
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="描述您的团队"
            />
          </div>

          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
              团队Logo URL
            </label>
            <input
              type="text"
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="输入Logo图片URL（可选）"
            />
          </div>

          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  创建中...
                </span>
              ) : '创建团队'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-[#e8dfd0] rounded-xl text-gray-600 hover:bg-[#faf7f2] hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
