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
      <div className="min-h-screen flex justify-center items-start pt-20 bg-[#f7f3ec]/50">
        <div className="relative flex justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#e8dfd0] border-t-[#0a2a5c] animate-spin" />
          <div className="absolute w-7 h-7 rounded-full border-4 border-[#f5f0e8] border-b-[#f59e0b] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c]">管理员管理</h1>
          <p className="text-[#8b7e6a] mt-1">管理平台所有管理员，共 {admins.length} 人</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0a2a5c] text-white rounded-xl text-sm font-medium hover:bg-[#0a2a5c]/90 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusOutlined />
          <span>添加管理员</span>
        </button>
      </div>

      <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] overflow-hidden">
        <div className="p-4 border-b border-[#e8dfd0]">
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89a80]" />
            <input
              type="text"
              placeholder="搜索管理员..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#faf7f2]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#8b7e6a]">用户</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#8b7e6a]">角色</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#8b7e6a]">邮箱</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#8b7e6a]">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#8b7e6a]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dfd0]">
              {filteredAdmins.map((u) => (
                <tr key={u.id} className="hover:bg-[#faf7f2]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        u.role === 'super_admin' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {u.role === 'super_admin' ? <CrownOutlined /> : <UserOutlined />}
                      </div>
                      <div>
                        <p className="font-medium text-[#0a2a5c]">{u.nickname || u.username}</p>
                        <p className="text-xs text-[#a89a80]">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4 text-sm text-[#6b5e4a]">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium ${
                      u.is_active ? 'text-green-600' : 'text-red-400'
                    }`}>
                      {u.is_active ? '正常' : '冻结'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'super_admin' ? (
                      <span className="text-xs text-[#a89a80]">-</span>
                    ) : u.id === currentUser?.id ? (
                      <span className="text-xs text-[#a89a80]">当前账号</span>
                    ) : (
                      <button
                        onClick={() => handleDemote(u.id, u.nickname || u.username)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all duration-300 hover:-translate-y-0.5"
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f5f0e8] rounded-2xl mb-3">
                      <UserOutlined className="text-3xl text-[#a89a80]" />
                    </div>
                    <p className="text-[#a89a80]">未找到管理员</p>
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
          <div className="bg-[#fefcf8] rounded-2xl max-w-lg w-full p-6 border border-[#e8dfd0] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold tracking-tight text-[#0a2a5c] mb-4">添加管理员</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#6b5e4a] mb-2">选择用户</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c]"
              >
                <option value="">请选择用户</option>
                {nonAdminUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nickname || u.username} ({u.email})
                  </option>
                ))}
              </select>
              {nonAdminUsers.length === 0 && (
                <p className="text-xs text-[#a89a80] mt-2">没有可添加的用户（所有用户已经是管理员）</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-[#6b5e4a] hover:bg-[#faf7f2] rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePromote}
                disabled={!selectedUserId || promoting}
                className="px-4 py-2.5 text-sm font-medium bg-[#0a2a5c] text-white rounded-xl hover:bg-[#0a2a5c]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
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
