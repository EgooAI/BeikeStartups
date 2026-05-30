'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, superAdminApi } from '@/lib/api';
import { User } from '@/types';
import { message } from 'antd';
import { CrownOutlined, UserOutlined, SearchOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export default function AdminAdminsPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [adminsRes, usersRes] = await Promise.all([
        superAdminApi.listAdmins(),
        adminApi.listUsers(),
      ]);

      if (adminsRes.data) {
        setAdmins(adminsRes.data as User[]);
      }
      if (usersRes.data) {
        const data = usersRes.data as { items?: User[] } | User[];
        setAllUsers(Array.isArray(data) ? data : data.items || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePromote = async () => {
    if (!selectedUserId) return;
    setPromoting(true);
    try {
      await superAdminApi.promoteToAdmin(selectedUserId);
      setShowAddModal(false);
      setSelectedUserId(null);
      await loadData();
      message.success('已设置该用户为管理员');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
      message.error((err as Error).message || '操作失败');
    } finally {
      setPromoting(false);
    }
  };

  const handleDemote = async (userId: number, username: string) => {
    if (!confirm(`确定要撤销 ${username} 的管理员权限吗？`)) return;
    try {
      await superAdminApi.demoteAdmin(userId);
      await loadData();
      message.success('已撤销管理员权限');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: '管理员',
      super_admin: '超级管理员',
    };
    return labels[role] || role;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') {
      return <span className="inline-flex items-center space-x-1 text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full font-medium"><CrownOutlined /> 超级管理员</span>;
    }
    return <span className="inline-flex items-center space-x-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">管理员</span>;
  };

  const nonAdminUsers = allUsers.filter(u =>
    u.role !== 'admin' && u.role !== 'super_admin' &&
    (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.nickname?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAdmins = admins.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2a5c]">管理员管理</h1>
          <p className="text-gray-500 mt-1">管理平台所有管理员，共 {admins.length} 人</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0a2a5c] text-white rounded-xl text-sm font-medium hover:bg-[#0a2a5c]/90 transition-colors"
        >
          <PlusOutlined />
          <span>添加管理员</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索管理员..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">用户</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">角色</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">邮箱</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmins.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        u.role === 'super_admin' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {u.role === 'super_admin' ? <CrownOutlined /> : <UserOutlined />}
                      </div>
                      <div>
                        <p className="font-medium text-[#0a2a5c]">{u.nickname || u.username}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium ${
                      u.is_active ? 'text-green-600' : 'text-red-400'
                    }`}>
                      {u.is_active ? '正常' : '冻结'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'super_admin' ? (
                      <span className="text-xs text-gray-400">-</span>
                    ) : u.id === currentUser?.id ? (
                      <span className="text-xs text-gray-400">当前账号</span>
                    ) : (
                      <button
                        onClick={() => handleDemote(u.id, u.nickname || u.username)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                      >
                        <DeleteOutlined className="mr-1" />
                        撤销权限
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <UserOutlined className="text-4xl mb-2 block" />
                    未找到管理员
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#0a2a5c] mb-4">添加管理员</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择用户</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              >
                <option value="">请选择用户</option>
                {nonAdminUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nickname || u.username} ({u.email})
                  </option>
                ))}
              </select>
              {nonAdminUsers.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">没有可添加的用户（所有用户已经是管理员）</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePromote}
                disabled={!selectedUserId || promoting}
                className="px-4 py-2.5 text-sm font-medium bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {promoting ? '添加中...' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}