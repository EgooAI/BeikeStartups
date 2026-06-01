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
      student: 'bg-[#00f0ff]/10 text-[#00f0ff]',
      team: 'bg-orange-500/10 text-orange-400',
      investor: 'bg-[#b347ea]/10 text-[#b347ea]',
      mentor: 'bg-[#00ff88]/10 text-[#00ff88]',
      partner: 'bg-teal-500/10 text-teal-400',
      admin: 'bg-red-500/10 text-red-400',
      super_admin: 'bg-[#ffb800]/10 text-[#ffb800]',
    };
    return colors[role] || 'bg-white/[0.05] text-white';
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
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">用户管理</h1>
        <p className="text-white mt-1">管理平台所有注册用户，共 {users.length} 人</p>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.05]">
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="搜索用户名、邮箱或昵称..."
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
                <th className="text-left px-6 py-4 text-sm font-medium text-white">用户</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white">角色</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white">邮箱</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white">注册时间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSuperAdmin(u.role) ? 'bg-[#ffb800]/10 text-[#ffb800]' : 'bg-white/[0.05] text-white'
                        }`}>
                        {isSuperAdmin(u.role) ? <CrownOutlined /> : <UserOutlined />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-white">{u.nickname || u.username}</p>
                          {isSuperAdmin(u.role) && (
                            <span className="text-xs bg-[#ffb800]/10 text-[#ffb800] px-1.5 py-0.5 rounded-xl font-bold">SUPER</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium ${u.is_active ? 'text-[#00ff88]' : 'text-red-400'
                      }`}>
                      {u.is_active ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                      <span>{u.is_active ? '正常' : '冻结'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {new Date(u.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    {isSuperAdmin(u.role) && !currentUserIsSuperAdmin ? (
                      <span className="text-xs text-white">不可操作</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="text-xs px-2 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-[#00f0ff]/40 text-white"
                        >
                          <option value="student">同学</option>
                          <option value="investor">投资人</option>
                          <option value="mentor">导师</option>
                          <option value="partner">资源方</option>
                          {currentUserIsSuperAdmin && <option value="admin">管理员</option>}
                        </select>
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-300 ${u.is_active
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20'
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/[0.03] rounded-2xl mb-3">
                      <UserOutlined className="text-3xl text-gray-500" />
                    </div>
                    <p className="text-gray-500">未找到匹配的用户</p>
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
