'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { UserOutlined, SearchOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CrownOutlined } from '@ant-design/icons';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await adminApi.listUsers();
      if (res.data) {
        const data = res.data as any;
        setUsers(data.items || data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await adminApi.updateUserActive(userId, !currentActive);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const changeRole = async (userId: number, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      student: '同学',
      team: '创业团队',
      investor: '投资人',
      mentor: '导师',
      partner: '资源方',
      admin: '管理员',
      super_admin: '超级管理员',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-50 text-blue-600',
      team: 'bg-orange-50 text-orange-600',
      investor: 'bg-purple-50 text-purple-600',
      mentor: 'bg-green-50 text-green-600',
      partner: 'bg-teal-50 text-teal-600',
      admin: 'bg-red-50 text-red-600',
      super_admin: 'bg-yellow-50 text-yellow-600',
    };
    return colors[role] || 'bg-gray-50 text-gray-600';
  };

  const isSuperAdmin = (role: string) => role === 'super_admin';
  const currentUserIsSuperAdmin = currentUser?.role === 'super_admin';

  const filteredUsers = users.filter(u => {
    if (u.role === 'super_admin') {
      return false;
    }
    if (!currentUserIsSuperAdmin && u.role === 'admin') {
      return false;
    }
    return u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.nickname?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0a2a5c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2a5c]">用户管理</h1>
        <p className="text-gray-500 mt-1">管理平台所有注册用户，共 {users.length} 人</p>
      </div>

      <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户名、邮箱或昵称..."
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
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">注册时间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSuperAdmin(u.role) ? 'bg-yellow-50 text-yellow-600' : 'bg-[#0a2a5c]/5 text-[#0a2a5c]'
                      }`}>
                        {isSuperAdmin(u.role) ? <CrownOutlined /> : <UserOutlined />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-[#0a2a5c]">{u.nickname || u.username}</p>
                          {isSuperAdmin(u.role) && (
                            <span className="text-xs bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded font-medium">SUPER</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium ${
                      u.is_active ? 'text-green-600' : 'text-red-400'
                    }`}>
                      {u.is_active ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                      <span>{u.is_active ? '正常' : '冻结'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    {isSuperAdmin(u.role) && !currentUserIsSuperAdmin ? (
                      <span className="text-xs text-gray-400">不可操作</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20"
                        >
                          <option value="student">同学</option>
                          <option value="investor">投资人</option>
                          <option value="mentor">导师</option>
                          <option value="partner">资源方</option>
                          {currentUserIsSuperAdmin && <option value="admin">管理员</option>}
                        </select>
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            u.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {u.is_active ? '冻结' : '解冻'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <UserOutlined className="text-4xl mb-2 block" />
                    未找到匹配的用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}