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
      return <span className="inline-flex items-center space-x-1 text-xs bg-[#ffb800]/10 text-[#ffb800] px-2 py-0.5 rounded-full font-medium"><CrownOutlined /> 超级管理员</span>;
    }
    return <span className="inline-flex items-center space-x-1 text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-medium">管理员</span>;
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
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#050510]">
        <div className="relative flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/[0.06] border-t-[#00f0ff] animate-spin" />
          <div className="absolute w-7 h-7 rounded-full border-4 border-white/[0.04] border-b-[#b347ea] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">管理员管理</h1>
          <p className="text-gray-400 mt-1">管理平台所有管理员，共 {admins.length} 人</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] font-bold rounded-xl text-sm hover:opacity-90 transition-all duration-300"
        >
          <PlusOutlined />
          <span>添加管理员</span>
        </button>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.05]">
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="搜索管理员..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.03]">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">用户</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">角色</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">邮箱</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredAdmins.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        u.role === 'super_admin' ? 'bg-[#ffb800]/10 text-[#ffb800]' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.role === 'super_admin' ? <CrownOutlined /> : <UserOutlined />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.nickname || u.username}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium ${
                      u.is_active ? 'text-[#00ff88]' : 'text-red-400'
                    }`}>
                      {u.is_active ? '正常' : '冻结'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'super_admin' ? (
                      <span className="text-xs text-gray-500">-</span>
                    ) : u.id === currentUser?.id ? (
                      <span className="text-xs text-gray-500">当前账号</span>
                    ) : (
                      <button
                        onClick={() => handleDemote(u.id, u.nickname || u.username)}
                        className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-all duration-300"
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/[0.03] rounded-2xl mb-3">
                      <UserOutlined className="text-3xl text-gray-500" />
                    </div>
                    <p className="text-gray-500">未找到管理员</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#0f0f1f] rounded-2xl max-w-lg w-full p-6 border border-[#00f0ff]/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black tracking-tight text-white mb-4">添加管理员</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">选择用户</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-black border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#00f0ff]/40 focus:ring-1 focus:ring-[#00f0ff]/20 text-white"
              >
                <option value="">请选择用户</option>
                {nonAdminUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nickname || u.username} ({u.email})
                  </option>
                ))}
              </select>
              {nonAdminUsers.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">没有可添加的用户（所有用户已经是管理员）</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePromote}
                disabled={!selectedUserId || promoting}
                className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-[#00f0ff] to-[#00c8ff] text-[#050510] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
