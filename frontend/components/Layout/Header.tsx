// frontend/components/Layout/Header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                贝壳创业平台
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                登录
              </Link>
              <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
              贝壳创业平台
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/applications" className="text-gray-700 hover:text-indigo-600">
              申请
            </Link>
            <Link href="/teams" className="text-gray-700 hover:text-indigo-600">
              团队
            </Link>
            <Link href="/projects" className="text-gray-700 hover:text-indigo-600">
              项目
            </Link>
            <Link href="/recruitments" className="text-gray-700 hover:text-indigo-600">
              招聘
            </Link>
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
              <span className="text-gray-700">{user.nickname || user.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600"
              >
                退出
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}