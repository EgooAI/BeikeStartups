'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  SafetyOutlined,
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  WarningOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      
      // 注意：login 后会触发 AuthContext 的 loadUser，但这里需要立即检查角色
      // 所以从 token 中解析角色信息
      const token = localStorage.getItem('token');
      let role = null;
      
      if (token) {
        try {
          // JWT token 的 payload 在第二部分
          const payload = JSON.parse(atob(token.split('.')[1]));
          role = payload?.role;
        } catch (err) {
          console.error('解析 token 失败:', err);
        }
      }
      
      if (role === 'admin' || role === 'super_admin') {
        router.push('/admin');
      } else {
        setError('当前账号不是管理员，无法登录管理后台');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a2a5c] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a2a5c] via-[#0d3470] to-[#1a4a8a] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#f59e0b] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-3xl mb-8">
            <SafetyOutlined className="text-4xl text-[#f59e0b]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">贝壳管理后台</h1>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            贝壳青创汇平台管理中心，高效管理用户、项目、活动和资源
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">多角色</p>
              <p className="text-xs text-white/40 mt-1">用户管理</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">全流程</p>
              <p className="text-xs text-white/40 mt-1">审核管理</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">数据化</p>
              <p className="text-xs text-white/40 mt-1">运营分析</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-white/40 hover:text-white/80 mt-12 transition-colors text-sm"
          >
            <GlobalOutlined className="mr-2" />
            返回贝壳青创汇前台
          </Link>
        </div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back link - mobile */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-[#0a2a5c] mb-8 transition-colors text-sm lg:hidden"
          >
            <ArrowLeftOutlined className="mr-2" />
            返回首页
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] rounded-2xl mb-4 shadow-lg">
              <SafetyOutlined className="text-2xl text-[#f59e0b]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0a2a5c]">管理员登录</h2>
            <p className="text-gray-400 mt-1">请输入管理员账号信息登录后台</p>
          </div>

          {/* Security notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-start space-x-2">
            <WarningOutlined className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              仅限授权管理员登录。请妥善保管账号信息，不要在非安全环境下使用。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">管理员账号</label>
              <div className="relative">
                <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入管理员用户名"
                  required
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入管理员密码"
                  required
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                <WarningOutlined className="text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-[#0a2a5c] to-[#1a4a8a] text-white rounded-xl hover:from-[#0a2a5c]/90 hover:to-[#1a4a8a]/90 transition-all font-medium disabled:opacity-50 shadow-lg shadow-[#0a2a5c]/20 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  验证中...
                </>
              ) : (
                <>
                  <SafetyOutlined className="mr-2" />
                  管理员登录
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                使用普通账号登录？{' '}
                <Link href="/login" className="text-[#0a2a5c] hover:underline font-medium">
                  用户登录
                </Link>
              </p>
              <Link
                href="/"
                className="hidden lg:inline-flex items-center text-xs text-gray-400 hover:text-[#0a2a5c] transition-colors"
              >
                <GlobalOutlined className="mr-1" />
                返回贝壳青创汇前台
              </Link>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-300 mt-8">
            贝壳青创汇 &copy; {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}