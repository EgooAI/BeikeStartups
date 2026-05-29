'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi, api, teamApi } from '@/lib/api';
import { UserOutlined, MailOutlined, PhoneOutlined, SmileOutlined, CameraOutlined, CheckCircleOutlined, LockOutlined, CloseOutlined, DeleteOutlined, ExclamationCircleOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);

  useEffect(() => {
    if (user && (user.role === 'team_owner' || user.role === 'team_member')) {
      loadMyTeam();
    }
  }, [user]);

  async function loadMyTeam() {
    try {
      const res = await teamApi.getMyMembers();
      if (res.data) {
        const data = res.data as any;
        setMyTeam(data.team || null);
      }
    } catch (err) {
      console.error('Failed to load team:', err);
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploadError('');
    setAvatarUploading(true);

    try {
      const response = await api.uploadFile<{ url: string }>('/api/uploads', file);
      if (response.data?.url) {
        setForm({ ...form, avatar: response.data.url });
        setNotification({ type: 'success', text: '头像上传成功' });
      } else {
        throw new Error('上传失败，未返回头像地址');
      }
    } catch (err: any) {
      setAvatarUploadError(err.message || '头像上传失败，请重试');
    } finally {
      setAvatarUploading(false);
    }
  };

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

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
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
      setTimeout(() => window.location.href = '/dashboard', 100);
    } catch (err: any) {
      setPasswordError(err.message || '密码修改失败');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (user?.role === 'team_owner' && myTeam) {
      setDeleteError('您是团队负责人，请先解散团队再注销账号');
      return;
    }

    if (deleteConfirm !== '删除账号') {
      setDeleteError('请输入正确的确认信息');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await authApi.deleteAccount();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      setDeleteError((error as Error).message || '注销失败，请稍后重试');
    } finally {
      setDeleteLoading(false);
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
                 user.role === 'team_member' ? '团队成员' :
                 user.role === 'team_owner' ? '团队负责人' :
                 user.role === 'mentor' ? '导师' :
                 user.role === 'investor' ? '投资人' :
                 user.role === 'partner' ? '资源方' :
                 user.role === 'admin' ? '管理员' : '超级管理员'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">上传头像</label>
              <div className="flex items-center space-x-3">
                <CameraOutlined className="text-gray-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#0a2a5c] file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">支持 JPG/PNG/GIF/WebP 图片，文件大小不超过 5MB，每天最多上传 20 次。</p>
              {avatarUploadError ? (
                <p className="mt-2 text-sm text-red-500">{avatarUploadError}</p>
              ) : null}
              {form.avatar ? (
                <p className="mt-2 text-sm text-gray-500">当前头像地址：{form.avatar}</p>
              ) : null}
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

            <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存修改'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  取消
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="px-6 py-3 border border-[#0a2a5c] text-[#0a2a5c] rounded-xl hover:bg-[#0a2a5c]/5 transition-colors font-medium flex items-center gap-2"
              >
                <LockOutlined />
                修改密码
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full px-6 py-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors font-medium flex items-center gap-2 justify-center"
              >
                <DeleteOutlined />
                注销账号
              </button>
            </div>
          </form>
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

      {/* 注销账号弹窗 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <ExclamationCircleOutlined className="text-xl" />
                注销账号
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError('');
                  setDeleteConfirm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseOutlined />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {user?.role === 'team_owner' && myTeam && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-amber-700 text-sm mb-3">
                    <strong>提示：</strong>您是团队"<span className="font-medium">{myTeam.name}</span>"的负责人，注销账号前需要先解散团队。
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center text-amber-700 hover:text-amber-800 text-sm font-medium"
                  >
                    前往解散团队 <RightOutlined className="ml-1 text-xs" />
                  </Link>
                </div>
              )}
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-red-700 text-sm">
                  <strong>警告：</strong>此操作将永久删除您的账号及所有相关数据，包括项目、申请记录等。此操作不可撤销！
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  请输入"删除账号"确认此操作
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="请输入'删除账号'"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    deleteError ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]'
                  }`}
                />
                {deleteError && !deleteError.includes('团队负责人') && (
                  <p className="text-red-500 text-sm mt-1">{deleteError}</p>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError('');
                    setDeleteConfirm('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || (user?.role === 'team_owner' && myTeam)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                >
                  {deleteLoading ? '处理中...' : '确认注销'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}