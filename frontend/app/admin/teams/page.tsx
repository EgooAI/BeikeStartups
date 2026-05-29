'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { teamApi } from '@/lib/api';
import { Team } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { TeamOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, RightOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export default function AdminTeamsPage() {
  const { user: currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const res = await teamApi.list();
      if (res.data) {
        const data = res.data as any;
        setTeams(data.items || data || []);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待审核',
      approved: '已认证',
      rejected: '已拒绝',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-600',
      approved: 'bg-green-50 text-green-600',
      rejected: 'bg-red-50 text-red-600',
    };
    return colors[status] || 'bg-gray-50 text-gray-600';
  };

  const filteredTeams = teams.filter(team => {
    const searchLower = searchTerm.toLowerCase();
    return (team.name?.toLowerCase().includes(searchLower) || false) ||
           (team.description?.toLowerCase().includes(searchLower) || false);
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
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center text-[#0a2a5c]/60 hover:text-[#0a2a5c] mb-4 transition-colors">
          <ArrowLeftOutlined className="mr-2" />
          返回管理后台
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0a2a5c]">团队管理</h1>
            <p className="text-gray-500 mt-1">管理所有创业团队，共 {teams.length} 个团队</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-custom border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索团队名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">团队名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <TeamOutlined className="text-4xl mb-3 block" />
                    <p>暂无团队数据</p>
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] flex items-center justify-center text-white">
                          <TeamOutlined />
                        </div>
                        <div>
                          <p className="font-medium text-[#0a2a5c]">{team.name}</p>
                          {team.description && (
                            <p className="text-sm text-gray-400 truncate max-w-xs">{team.description.substring(0, 50)}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status || 'approved')}`}>
                        {getStatusLabel(team.status || 'approved')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(team.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/teams/${team.id}`}
                        className="inline-flex items-center text-[#0a2a5c] hover:text-[#0a2a5c]/80 text-sm font-medium transition-colors"
                      >
                        查看详情 <RightOutlined className="ml-1 text-xs" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}