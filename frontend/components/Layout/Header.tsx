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
  GoldOutlined,
  DownOutlined,
  RocketOutlined
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center shadow-button group-hover:scale-105 transition-transform">
                <GoldOutlined className="text-xl text-white" />
              </div>
              <span className="text-xl font-bold text-primary">贝壳青创汇</span>
            </Link>
            <nav className="hidden lg:flex ml-10 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-primary/8 text-primary'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            {user ? (
              <>
                {(user.role === 'team_owner' || user.role === 'team_member') && (
                  <Link
                    href="/my-projects"
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive('/my-projects')
                        ? 'bg-primary/8 text-primary'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    <RocketOutlined className="text-sm" />
                    <span>团队项目</span>
                  </Link>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserOutlined className="text-primary" />
                    </div>
                    <span>{user.nickname || user.username}</span>
                    <DownOutlined className={`text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-custom-lg border border-gray-100 py-2 animate-scale-in">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <UserOutlined />
                        <span>个人中心</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <UserOutlined />
                        <span>修改个人信息</span>
                      </Link>
                      {user.role === 'admin' || user.role === 'super_admin' ? (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <UserOutlined />
                          <span>管理后台</span>
                        </Link>
                      ) : null}
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogoutOutlined />
                        <span>退出登录</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors rounded-xl hover:bg-gray-50"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-accent-gradient rounded-xl hover:opacity-90 transition-all shadow-button"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden flex items-center p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/8 text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <hr className="my-3 border-gray-100" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <UserOutlined />
                  <span>个人中心</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <UserOutlined />
                  <span>修改个人信息</span>
                </Link>
                {user.role === 'admin' || user.role === 'super_admin' ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50"
                  >
                    <UserOutlined />
                    <span>管理后台</span>
                  </Link>
                ) : null}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full"
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
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-accent-gradient rounded-xl"
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
