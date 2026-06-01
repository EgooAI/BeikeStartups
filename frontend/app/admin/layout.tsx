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
  PictureOutlined,
} from '@ant-design/icons';

const adminNavItems = [
  { name: '仪表板', href: '/admin', icon: <DashboardOutlined /> },
  { name: '用户管理', href: '/admin/users', icon: <UserOutlined /> },
  { name: '身份审核', href: '/admin/verifications', icon: <SafetyOutlined /> },
  { name: '项目管理', href: '/admin/projects', icon: <ProjectOutlined /> },
  { name: '活动管理', href: '/admin/events', icon: <CalendarOutlined /> },
  { name: '轮播图管理', href: '/admin/banners', icon: <PictureOutlined /> },
  { name: '资源管理', href: '/admin/resources', icon: <BuildOutlined /> },
];

const superAdminNavItems = [
  { name: '管理员管理', href: '/admin/admins', icon: <SafetyOutlined /> },
];

function isAdminRole(role: string) {
  return role === 'admin' || role === 'super_admin';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdminRole(user.role))) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="relative flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/[0.06] border-t-[#00f0ff] animate-spin" />
          <div className="absolute w-7 h-7 rounded-full border-4 border-white/[0.04] border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
      </div>
    );
  }

  if (!user || !isAdminRole(user.role)) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#050510] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#06061a] border-r border-white/[0.06] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-white">贝壳管理</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
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
                    ? 'bg-white/[0.08] text-[#00f0ff]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
                {isActive(item.href) && <RightOutlined className="ml-auto text-xs" />}
              </Link>
            ))}
            {user.role === 'super_admin' && (
              <>
                <div className="pt-4 pb-2 px-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">超级管理员</p>
                </div>
                {superAdminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-white/[0.08] text-[#00f0ff]'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                    {isActive(item.href) && <RightOutlined className="ml-auto text-xs" />}
                  </Link>
                ))}
              </>
            )}
          </nav>
          <div className="px-4 py-4 border-t border-white/[0.06]">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#b347ea] flex items-center justify-center text-[#050510] text-sm font-bold">
                {user.nickname?.[0] || user.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.nickname || user.username}</p>
                <p className="text-xs text-gray-500">{user.role === 'super_admin' ? '超级管理员' : '管理员'}</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-2">
              <Link
                href="/"
                className="flex-1 text-center px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                返回前台
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#050510]/80 backdrop-blur-sm border-b border-white/[0.06] h-16 flex items-center px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-[#00f0ff] mr-4">
            <MenuOutlined className="text-xl" />
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#00f0ff] transition-colors">前台</Link>
            <span>/</span>
            <span className="text-[#00f0ff]">管理后台</span>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
