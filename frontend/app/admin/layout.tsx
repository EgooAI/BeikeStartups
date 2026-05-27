'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  ProjectOutlined,
  CalendarOutlined,
  BuildOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  RightOutlined,
} from '@ant-design/icons';

const adminNavItems = [
  { name: '仪表板', href: '/admin', icon: <DashboardOutlined /> },
  { name: '用户管理', href: '/admin/users', icon: <UserOutlined /> },
  { name: '身份审核', href: '/admin/verifications', icon: <SafetyOutlined /> },
  { name: '项目管理', href: '/admin/projects', icon: <ProjectOutlined /> },
  { name: '活动管理', href: '/admin/events', icon: <CalendarOutlined /> },
  { name: '资源管理', href: '/admin/resources', icon: <BuildOutlined /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a2a5c] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">贝壳管理</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <CloseOutlined />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
                {isActive(item.href) && <RightOutlined className="ml-auto text-xs" />}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white text-sm font-medium">
                {user.nickname?.[0] || user.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.nickname || user.username}</p>
                <p className="text-xs text-white/50">管理员</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-2">
              <Link
                href="/"
                className="flex-1 text-center px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                返回前台
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 text-xs text-red-300 hover:text-red-200 hover:bg-white/5 rounded-lg transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-[#0a2a5c] mr-4">
            <MenuOutlined className="text-xl" />
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#0a2a5c] transition-colors">前台</Link>
            <span>/</span>
            <span className="text-[#0a2a5c]">管理后台</span>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}