'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { message } from 'antd';
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
        const data = res.data as { items?: User[]; } & User[];
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
      message.success(!currentActive ? '已启用用户' : '已禁用用户');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
    }
  };

  const changeRole = async (userId: number, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as User['role'] } : u));
      message.success('角色已更新');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      message.error(errorMessage);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      student: '同学',
      team_owner: '团队负责人',
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
    return colors[role] || 'bg-[#f5f0e8] text-[#6b5e4a]';
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
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c]">用户管理</h1>
        <p className="text-[#8b7e6a] mt-1">管理平台所有注册用户，共 {users.length} 人</p>
      </div>

      <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] overflow-hidden">
        <div className="p-4 border-b border-[#e8dfd0]">
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89a80]" />
            <input
              type="text"
              placeholder="搜索用户名、邮箱或昵称..."
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
                <th className="text-left px-6 py-4 text-sm font-medium text-[#8b7e6a]">注册时间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#8b7e6a]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dfd0]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#faf7f2]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSuperAdmin(u.role) ? 'bg-yellow-50 text-yellow-600' : 'bg-[#0a2a5c]/5 text-[#0a2a5c]'
                        }`}>
                        {isSuperAdmin(u.role) ? <CrownOutlined /> : <UserOutlined />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-[#0a2a5c]">{u.nickname || u.username}</p>
                          {isSuperAdmin(u.role) && (
                            <span className="text-xs bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded-xl font-medium">SUPER</span>
                          )}
                        </div>
                        <p className="text-xs text-[#a89a80]">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b5e4a]">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-red-400'
                      }`}>
                      {u.is_active ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                      <span>{u.is_active ? '正常' : '冻结'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#a89a80]">
                    {new Date(u.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    {isSuperAdmin(u.role) && !currentUserIsSuperAdmin ? (
                      <span className="text-xs text-[#a89a80]">不可操作</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="text-xs px-2 py-1.5 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a2a5c]/20"
                        >
                          <option value="student">同学</option>
                          <option value="investor">投资人</option>
                          <option value="mentor">导师</option>
                          <option value="partner">资源方</option>
                          {currentUserIsSuperAdmin && <option value="admin">管理员</option>}
                        </select>
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 ${u.is_active
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f5f0e8] rounded-2xl mb-3">
                      <UserOutlined className="text-3xl text-[#a89a80]" />
                    </div>
                    <p className="text-[#a89a80]">未找到匹配的用户</p>
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
