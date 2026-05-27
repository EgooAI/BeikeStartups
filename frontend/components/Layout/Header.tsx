'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  HomeOutlined, 
  ProjectOutlined, 
  TeamOutlined, 
  FundOutlined, 
  CalendarOutlined, 
  InfoCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  GoldOutlined
} from '@ant-design/icons';

const navItems = [
  { name: '首页', href: '/', icon: <HomeOutlined /> },
  { name: '项目库', href: '/projects', icon: <ProjectOutlined /> },
  { name: '招募广场', href: '/recruitments', icon: <TeamOutlined /> },
  { name: '创投资源', href: '/resources', icon: <FundOutlined /> },
  { name: '活动路演', href: '/events', icon: <CalendarOutlined /> },
  { name: '关于贝壳', href: '/about', icon: <InfoCircleOutlined /> },
];

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <GoldOutlined className="text-2xl text-[#f59e0b]" />
              <span className="text-xl font-bold text-[#0a2a5c]">贝壳青创汇</span>
            </Link>
            <nav className="hidden lg:flex ml-10 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#0a2a5c]/5 text-[#0a2a5c]'
                      : 'text-gray-600 hover:text-[#0a2a5c] hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  href="/my-projects"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/my-projects')
                      ? 'bg-[#0a2a5c]/5 text-[#0a2a5c]'
                      : 'text-gray-600 hover:text-[#0a2a5c] hover:bg-gray-50'
                  }`}
                >
                  <ProjectOutlined />
                  <span>我的项目</span>
                </Link>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-[#0a2a5c]/5 text-[#0a2a5c]'
                      : 'text-gray-600 hover:text-[#0a2a5c] hover:bg-gray-50'
                  }`}
                >
                  <UserOutlined />
                  <span>{user.nickname || user.username}</span>
                </Link>
                {user.role === 'admin' || user.role === 'super_admin' ? (
                  <Link
                    href="/admin"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-[#f59e0b] hover:bg-amber-50 transition-colors"
                  >
                    管理后台
                  </Link>
                ) : null}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogoutOutlined />
                  <span>退出</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0a2a5c] transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#0a2a5c] rounded-lg hover:bg-[#0a2a5c]/90 transition-colors shadow-sm"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden flex items-center px-3 text-gray-600 hover:text-[#0a2a5c]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#0a2a5c]/5 text-[#0a2a5c]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <UserOutlined />
                  <span>个人中心 ({user.nickname || user.username})</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full"
                >
                  <LogoutOutlined />
                  <span>退出登录</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-3 px-4 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-[#0a2a5c] rounded-lg hover:bg-[#0a2a5c]/90"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}