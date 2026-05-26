// frontend/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { name: '创业申请', href: '/applications', icon: '📝', description: '提交和管理创业申请' },
    { name: '我的团队', href: '/teams', icon: '👥', description: '查看和管理团队' },
    { name: '项目展示', href: '/projects', icon: '🚀', description: '浏览和管理项目' },
    { name: '人才招聘', href: '/recruitments', icon: '💼', description: '发布和管理招聘信息' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">欢迎回来，{user.nickname || user.username}</h1>
          <p className="mt-2 text-gray-600">角色: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">快速开始</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                1
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">提交创业申请</h3>
                <p className="text-gray-600">填写您的创业想法和商业计划</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">创建团队</h3>
                <p className="text-gray-600">申请通过后，组建您的创业团队</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                3
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">发布项目</h3>
                <p className="text-gray-600">展示您的项目成果和创新理念</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}