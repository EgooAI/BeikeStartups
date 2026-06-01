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
  DownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/85 backdrop-blur-xl border-b border-[#00f0ff]/10">
      {/* 底部发光边 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#b347ea] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:scale-105 transition-transform">
                <ThunderboltOutlined className="text-lg text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                贝壳<span className="text-[#00f0ff]">青创汇</span>
              </span>
            </Link>
            <nav className="hidden lg:flex ml-10 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
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
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive('/my-projects')
                        ? 'bg-[#b347ea]/10 text-[#b347ea]'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <RocketOutlined className="text-sm" />
                    <span>团队项目</span>
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#b347ea] flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                      <UserOutlined className="text-white text-xs" />
                    </div>
                    <span className="font-bold text-white">{user.nickname || user.username}</span>
                    <DownOutlined className={`text-xs transition-transform text-gray-500 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0f0f1f]/95 backdrop-blur-xl rounded-xl border border-[#00f0ff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 animate-scale-in">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <UserOutlined />
                        <span>个人中心</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <UserOutlined />
                        <span>修改个人信息</span>
                      </Link>
                      {user.role === 'admin' || user.role === 'super_admin' ? (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-[#ffb800] hover:bg-[#ffb800]/5 transition-colors"
                        >
                          <UserOutlined />
                          <span>管理后台</span>
                        </Link>
                      ) : null}
                      <hr className="my-2 border-white/5" />
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
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
                  className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-bold text-[#050510] bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:scale-105"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden flex items-center p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a1a]/98 backdrop-blur-xl border-t border-[#00f0ff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <hr className="my-3 border-white/5" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04]"
                >
                  <UserOutlined />
                  <span>个人中心</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04]"
                >
                  <UserOutlined />
                  <span>修改个人信息</span>
                </Link>
                {user.role === 'admin' || user.role === 'super_admin' ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-[#ffb800] hover:bg-[#ffb800]/5"
                  >
                    <UserOutlined />
                    <span>管理后台</span>
                  </Link>
                ) : null}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 w-full"
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
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-gray-400 border border-white/10 rounded-xl hover:bg-white/[0.04]"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-[#050510] bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] rounded-xl"
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
