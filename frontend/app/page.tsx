// frontend/app/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            贝壳创业平台
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            为大学生提供创新创业的一站式服务平台，从创意到实践，从团队到项目，助力每一个创业梦想
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              立即开始
            </Link>
            <Link
              href="/login"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              登录
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">创意孵化</h3>
            <p className="text-gray-600">
              提交您的创业想法，获得专业导师的指导和反馈
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">团队协作</h3>
            <p className="text-gray-600">
              组建创业团队，汇聚志同道合的伙伴
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">项目展示</h3>
            <p className="text-gray-600">
              展示项目成果，获得更多关注和资源
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}