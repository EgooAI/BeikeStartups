'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { teamApi } from '@/lib/api';
import { Team } from '@/types';
import { formatDate } from '@/lib/utils';
import { message } from 'antd';
import Link from 'next/link';
import { TeamOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, RightOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

export default function AdminTeamsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [disbandTeam, setDisbandTeam] = useState<Team | null>(null);
  const [disbandLoading, setDisbandLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const res = await teamApi.list();
      if (res.data) {
        const data = res.data as Team[];
        setTeams(data || []);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDisband() {
    if (!disbandTeam) return;
    setDisbandLoading(true);
    try {
      await teamApi.delete(disbandTeam.id);
      setDisbandTeam(null);
      loadTeams();
      message.success('团队已解散');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '解散团队失败';
      message.error(errorMessage);
    } finally {
      setDisbandLoading(false);
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
    return colors[status] || 'bg-[#f5f0e8] text-[#6b5e4a]';
  };

  const filteredTeams = teams.filter(team => {
    const searchLower = searchTerm.toLowerCase();
    return (team.name?.toLowerCase().includes(searchLower) || false) ||
      (team.description?.toLowerCase().includes(searchLower) || false);
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
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center text-[#a89a80] hover:text-[#0a2a5c] mb-4 transition-colors">
          <ArrowLeftOutlined className="mr-2" />
          返回管理后台
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2a5c]">团队管理</h1>
            <p className="text-[#8b7e6a] mt-1">管理所有创业团队，共 {teams.length} 个团队</p>
          </div>
        </div>
      </div>

      <div className="bg-[#fefcf8] rounded-xl shadow-sm border border-[#e8dfd0] overflow-hidden">
        <div className="p-4 border-b border-[#e8dfd0]">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89a80]" />
            <input
              type="text"
              placeholder="搜索团队名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#faf7f2] border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-[#0a2a5c]/20 focus:border-[#0a2a5c] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#faf7f2]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b7e6a] uppercase tracking-wider">团队名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b7e6a] uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b7e6a] uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b7e6a] uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dfd0]">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f5f0e8] rounded-2xl mb-3">
                      <TeamOutlined className="text-3xl text-[#a89a80]" />
                    </div>
                    <p className="text-[#a89a80]">暂无团队数据</p>
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a2a5c] to-[#1a4a8a] flex items-center justify-center text-white">
                          <TeamOutlined />
                        </div>
                        <div>
                          <p className="font-medium text-[#0a2a5c]">{team.name}</p>
                          {team.description && (
                            <p className="text-sm text-[#a89a80] truncate max-w-xs">{team.description.substring(0, 50)}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status || 'approved')}`}>
                        {getStatusLabel(team.status || 'approved')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b5e4a]">
                      {formatDate(team.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/teams/${team.id}`}
                        className="inline-flex items-center text-[#0a2a5c] hover:text-[#0a2a5c]/80 text-sm font-medium transition-colors mr-4"
                      >
                        查看详情 <RightOutlined className="ml-1 text-xs" />
                      </Link>
                      <button
                        onClick={() => setDisbandTeam(team)}
                        className="inline-flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                      >
                        <ExclamationCircleOutlined className="mr-1" />解散
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 解散团队确认弹窗 */}
      {disbandTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#fefcf8] rounded-2xl p-6 w-full max-w-md mx-4 border border-[#e8dfd0] shadow-xl">
            <h3 className="text-lg font-extrabold tracking-tight text-[#3a2e1a] mb-2">确认解散团队</h3>
            <p className="text-[#6b5e4a] mb-6">
              解散团队后，团队&quot;<span className="font-medium">{disbandTeam.name}</span>&quot;的所有成员将恢复为学生身份，团队的所有项目、招募等信息也将被删除。此操作不可恢复，确定要解散吗？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDisbandTeam(null)}
                className="px-4 py-2 text-[#6b5e4a] hover:text-[#3a2e1a] transition-colors rounded-xl hover:bg-[#faf7f2]"
                disabled={disbandLoading}
              >
                取消
              </button>
              <button
                onClick={handleConfirmDisband}
                disabled={disbandLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                {disbandLoading ? '解散中...' : '确认解散'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
