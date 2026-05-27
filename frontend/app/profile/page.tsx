'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { UserOutlined, MailOutlined, PhoneOutlined, SmileOutlined, CameraOutlined, CheckCircleOutlined, LockOutlined, CloseOutlined } from '@ant-design/icons';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);
    try {
      const response = await authApi.updateProfile(form);
      if (response.data) {
        setNotification({ type: 'success', text: '个人信息更新成功' });
        setTimeout(() => window.location.href = '/dashboard', 100);
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || '更新失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.new_password.length < 6) {
      setPasswordError('新密码长度至少为6位');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setNotification({ type: 'success', text: '密码修改成功' });
      setShowPasswordModal(false);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => window.location.href = '/dashboard', 1500);
    } catch (err: any) {
      setPasswordError(err.message || '密码修改失败');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-custom-lg p-12 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#0a2a5c] mb-3">请先登录</h2>
          <p className="text-gray-500 mb-8">登录后可修改您的个人信息</p>
          <a
            href="/login"
            className="inline-flex items-center px-8 py-3 bg-[#0a2a5c] text-white font-semibold rounded-xl hover:bg-[#0a2a5c]/90 transition-colors"
          >
            立即登录
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-2">个人中心</h1>
          <p className="text-gray-200">管理您的个人信息和账号设置</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-custom p-8">
          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-[#0a2a5c]/10 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nickname || user.username} className="w-full h-full object-cover" />
              ) : (
                <UserOutlined className="text-3xl text-[#0a2a5c]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#0a2a5c]">{user.nickname || user.username}</h2>
              <p className="text-gray-500 text-sm">@{user.username}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#0a2a5c]/5 text-[#0a2a5c] rounded text-xs font-medium">
                {user.role === 'student' ? '学生' : 
                 user.role === 'team' ? '团队' :
                 user.role === 'mentor' ? '导师' :
                 user.role === 'investor' ? '投资人' :
                 user.role === 'partner' ? '资源方' :
                 user.role === 'admin' ? '管理员' : '超级管理员'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">头像 URL</label>
              <div className="flex items-center space-x-3">
                <CameraOutlined className="text-gray-400" />
                <input
                  type="text"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="请输入头像图片URL"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <div className="flex items-center space-x-3">
                <SmileOutlined className="text-gray-400" />
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  placeholder="请输入昵称"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <div className="flex items-center space-x-3">
                <MailOutlined className="text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="请输入邮箱"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
              <div className="flex items-center space-x-3">
                <PhoneOutlined className="text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
            </div>

            {notification && (
              <div className={`p-4 rounded-xl text-sm flex items-center ${
                notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {notification.type === 'success' && <CheckCircleOutlined className="mr-2" />}
                {notification.text}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-custom p-8">
          <h3 className="text-lg font-semibold text-[#0a2a5c] mb-4">账号安全</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">登录账号</p>
                <p className="text-sm text-gray-500">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">账号密码</p>
                <p className="text-sm text-gray-500">定期更换密码可以保护账号安全</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 text-sm text-[#0a2a5c] border border-[#0a2a5c] rounded-lg hover:bg-[#0a2a5c]/5 transition-colors"
              >
                修改密码
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#0a2a5c]">修改密码</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseOutlined />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">旧密码</label>
                <div className="flex items-center space-x-3">
                  <LockOutlined className="text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    placeholder="请输入旧密码"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                <div className="flex items-center space-x-3">
                  <LockOutlined className="text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="请输入新密码（至少6位）"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                <div className="flex items-center space-x-3">
                  <LockOutlined className="text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="请再次输入新密码"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50">
                  {passwordError}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium disabled:opacity-50"
                >
                  {passwordSaving ? '保存中...' : '确认修改'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}